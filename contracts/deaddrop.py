# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json
import datetime
import hashlib

class Contract(gl.Contract):
    # Platform metadata
    platform_owner: Address
    total_leaks_submitted: u256
    total_leaks_verified: u256
    total_leaks_rejected: u256
    total_bounty_pool: u256        # In wei
    
    # Leaks: leak_id (hash) -> JSON string
    # Schema: {
    #   "leak_id", "title", "category", "target_entity", "summary",
    #   "evidence_urls": [...], "document_hash", "submitter_pubkey",
    #   "submission_timestamp", "status": "PENDING|VERIFIED|REJECTED",
    #   "credibility_score": 0-100, "public_interest_score": 0-100,
    #   "ai_verdict", "ai_reasoning", "red_flags": [...],
    #   "recommended_followup", "estimated_impact"
    # }
    leaks: TreeMap[str, str]
    
    # Index of all leak IDs (for iteration)
    all_leak_ids: DynArray[str]
    
    # Index by category: category -> serialized JSON array of leak_ids
    leaks_by_category: TreeMap[str, str]
    
    # Index of document_hash -> leak_id
    leak_by_document_hash: TreeMap[str, str]
    
    # Index by status (for filtering)
    verified_leaks: DynArray[str]
    rejected_leaks: DynArray[str]
    
    # Bounty system
    # bounty_pools: category -> total bounty amount in wei
    bounty_pools: TreeMap[str, u256]
    
    # Track which leaks have been paid out
    leak_payouts: TreeMap[str, u256]
    
    # Track active claims: leak_id -> JSON string: {"recipient": Address_str, "commit_hash": str, "revealed": bool}
    bounty_claims: TreeMap[str, str]
    
    # Submitter reputation & submission counters
    submitter_reputation: TreeMap[str, u256]
    submitter_total_submissions: TreeMap[str, u256]
    
    # Anti-spam: rate limiting per pubkey
    submitter_last_submission: TreeMap[str, u256]

    def __init__(self):
        self.platform_owner = gl.message.sender_address
        self.total_leaks_submitted = u256(0)
        self.total_leaks_verified = u256(0)
        self.total_leaks_rejected = u256(0)
        self.total_bounty_pool = u256(0)

    # === LEAK SUBMISSION & AI VERIFICATION ===

    @gl.public.write
    def submit_leak(
        self,
        leak_id: str,           # SHA-256 hash (client-side generated)
        title: str,
        category: str,          # "corporate_fraud", "government", "environmental", "healthcare", etc.
        target_entity: str,     # Name of company/org being exposed
        summary: str,           # Plain text summary (max 2000 chars)
        evidence_urls: str,     # JSON array string: ["url1", "url2", ...]
        document_hash: str,     # Hash of the leaked document itself
        submitter_pubkey: str   # Pseudonymous identifier (hash of seed, not wallet address)
    ):
        """Submit a new leak for AI verification."""
        
        # === DETERMINISTIC VALIDATION ===
        assert len(leak_id) == 64, "leak_id must be SHA-256 hex (64 chars)"
        assert not self.leaks.get(leak_id, ""), "Leak ID already exists"
        assert len(summary) <= 2000, "Summary too long"
        assert category in ["corporate_fraud", "government", "environmental", 
                            "healthcare", "tech", "finance", "other"], "Invalid category"
        
        # Rate limiting: max 1 submission per pubkey per hour
        current_time = datetime.datetime.now(datetime.timezone.utc)
        current_timestamp = u256(int(current_time.timestamp()))
        
        last_sub = self.submitter_last_submission.get(submitter_pubkey, u256(0))
        if last_sub > u256(0):
            # 3600 seconds = 1 hour
            assert current_timestamp >= last_sub + u256(3600), "Rate limit: Max 1 submission per hour per identity"
        
        # === AI GATEKEEPER (non-deterministic) ===
        def leader_fn():
            # Step 1: Fetch and parse evidence URLs (max 5)
            evidence_contents = []
            try:
                urls = json.loads(evidence_urls)
            except Exception:
                urls = []
                
            for i in range(min(len(urls), 5)):
                url = urls[i]
                try:
                    # Render URL in text mode to extract readable content
                    rendered = gl.nondet.web.render(url, mode="text")
                    evidence_contents.append(f"Evidence [{i}]: {url}\nContent:\n{rendered[:4000]}")
                except Exception as e:
                    evidence_contents.append(f"Evidence [{i}]: {url}\nError rendering: {str(e)}")
            
            # Step 2: Cross-reference search (SEC filings / news search)
            sec_data = ""
            try:
                sec_data = gl.nondet.web.render(
                    f"https://efts.sec.gov/LATEST/search-index?q=%22{target_entity}%22&forms=10-K,8-K",
                    mode="text"
                )
            except Exception as e:
                sec_data = f"Error querying public SEC databases: {str(e)}"
                
            evidence_str = "\n\n".join(evidence_contents)
            
            # Get reputation score & total count from context
            rep_score = int(self.submitter_reputation.get(submitter_pubkey, u256(100)))
            prev_subs = int(self.submitter_total_submissions.get(submitter_pubkey, u256(0)))
            
            # Step 3: AI Forensic Analysis Prompts
            prompt = f"""You are an experienced investigative journalism editor and forensic auditor 
working for an organization like ProPublica or Bellingcat. Your job is to evaluate 
whether a submitted leak is:
(a) AUTHENTIC and worth publishing, or
(b) FAKE, MISLEADING, or LOW QUALITY and should be rejected.

LEAK SUBMISSION:
- Title: "{title}"
- Category: {category}
- Target Entity: "{target_entity}"
- Summary: "{summary}"
- Document Hash: {document_hash}
- Submitter Reputation: {rep_score}/1000
- Previous Submissions: {prev_subs}

EVIDENCE CONTENTS:
{evidence_str}

PUBLIC RECORDS CROSS-REFERENCE (SEC/News):
{sec_data[:3000]}

EVALUATION CRITERIA:

1. AUTHENTICITY SIGNALS (weight: 40%):
   - Does evidence contain specific, verifiable details (names, dates, amounts)?
   - Are document patterns consistent with claimed source organization?
   - Does it cross-reference with public records (SEC filings, court documents, news)?
   - Any signs of fabrication (impossible timelines, fake metadata, ChatGPT-generated text)?

2. PUBLIC INTEREST (weight: 30%):
   - Does this expose wrongdoing affecting many people?
   - Is the target entity powerful (government, large corp)?
   - Would publishing serve democratic accountability?

3. FORENSIC RED FLAGS (weight: 20%):
   - Personal vendetta indicators?
   - Defamation without evidence?
   - Already-public information being repackaged?
   - Submission within 24h of similar fake leaks?

4. SUBMITTER PATTERN (weight: 10%):
   - Reputation score history
   - Whether submitter has prior verified leaks

OUTPUT (strict JSON):
{{
    "verdict": "VERIFIED" or "REJECTED",
    "credibility_score": 0-100,
    "public_interest_score": 0-100,
    "authenticity_breakdown": {{
        "evidence_quality": 0-100,
        "cross_reference_match": 0-100,
        "forensic_integrity": 0-100
    }},
    "reasoning": "concise explanation under 500 chars",
    "red_flags": ["flag1", "flag2"],
    "recommended_followup": "what journalists should investigate next",
    "estimated_impact": "LOW|MEDIUM|HIGH|CRITICAL"
}}

DECISION THRESHOLD:
- VERIFIED requires: credibility_score >= 70 AND public_interest_score >= 50
- Otherwise: REJECTED with reasoning
"""
            return gl.nondet.exec_prompt(prompt, response_format="json")

        def validator_fn(leader_result) -> bool:
            if not isinstance(leader_result, gl.vm.Return):
                return False
            try:
                data = json.loads(leader_result.calldata)
                verdict = data.get("verdict")
                if verdict not in ["VERIFIED", "REJECTED"]:
                    return False
                cred = int(data.get("credibility_score", -1))
                pub_int = int(data.get("public_interest_score", -1))
                if not (0 <= cred <= 100) or not (0 <= pub_int <= 100):
                    return False
                return True
            except Exception:
                return False

        # Run under consensus model
        ai_result_str = gl.vm.run_nondet_unsafe(leader_fn, validator_fn)
        
        # === DETERMINISTIC POST-PROCESSING ===
        ai_data = json.loads(ai_result_str)
        credibility_score = int(ai_data.get("credibility_score", 0))
        public_interest_score = int(ai_data.get("public_interest_score", 0))
        
        # Establish threshold rules
        if credibility_score >= 70 and public_interest_score >= 50:
            final_verdict = "VERIFIED"
        else:
            final_verdict = "REJECTED"
            
        # Build leak JSON structure
        leak_record = {
            "leak_id": leak_id,
            "title": title,
            "category": category,
            "target_entity": target_entity,
            "summary": summary,
            "evidence_urls": json.loads(evidence_urls),
            "document_hash": document_hash,
            "submitter_pubkey": submitter_pubkey,
            "submission_timestamp": int(current_timestamp),
            "status": final_verdict,
            "credibility_score": credibility_score,
            "public_interest_score": public_interest_score,
            "ai_verdict": final_verdict,
            "ai_reasoning": ai_data.get("reasoning", "Verification complete."),
            "red_flags": ai_data.get("red_flags", []),
            "recommended_followup": ai_data.get("recommended_followup", ""),
            "estimated_impact": ai_data.get("estimated_impact", "LOW")
        }
        
        self.leaks[leak_id] = json.dumps(leak_record)
        self.all_leak_ids.append(leak_id)
        self.leak_by_document_hash[document_hash] = leak_id
        
        # Update category indexing
        category_list = []
        category_list_str = self.leaks_by_category.get(category, "")
        if category_list_str:
            category_list = json.loads(category_list_str)
        category_list.append(leak_id)
        self.leaks_by_category[category] = json.dumps(category_list)
        
        # Update status arrays and reputational counters
        base_rep = self.submitter_reputation.get(submitter_pubkey, u256(100))
            
        if final_verdict == "VERIFIED":
            self.verified_leaks.append(leak_id)
            self.total_leaks_verified += u256(1)
            # Boost reputation
            self.submitter_reputation[submitter_pubkey] = base_rep + u256(50)
        else:
            self.rejected_leaks.append(leak_id)
            self.total_leaks_rejected += u256(1)
            # Demote reputation (prevent spam), floor at 0
            if base_rep >= u256(10):
                self.submitter_reputation[submitter_pubkey] = base_rep - u256(10)
            else:
                self.submitter_reputation[submitter_pubkey] = u256(0)
                
        # Track statistics
        self.total_leaks_submitted += u256(1)
        
        # Incremental counts
        prev_sub_count = self.submitter_total_submissions.get(submitter_pubkey, u256(0))
        self.submitter_total_submissions[submitter_pubkey] = prev_sub_count + u256(1)
        self.submitter_last_submission[submitter_pubkey] = current_timestamp

    # === PUBLIC READ METHODS ===

    @gl.public.view
    def get_leak(self, leak_id: str) -> str:
        """Returns the full leak JSON, or empty string if not found."""
        return self.leaks.get(leak_id, "")

    @gl.public.view
    def get_verified_leaks(self, offset: int, limit: int) -> str:
        """Paginated list of verified leaks. Returns JSON array string."""
        total = len(self.verified_leaks)
        if offset < 0 or offset >= total or limit <= 0:
            return "[]"
        
        result = []
        end = min(offset + limit, total)
        for i in range(offset, end):
            leak_id = self.verified_leaks[i]
            leak_str = self.leaks.get(leak_id, "")
            if leak_str:
                result.append(json.loads(leak_str))
        return json.dumps(result)

    @gl.public.view
    def get_leaks_by_category(self, category: str) -> str:
        """All verified leaks in a category."""
        leak_ids_str = self.leaks_by_category.get(category, "")
        if not leak_ids_str:
            return "[]"
            
        leak_ids = json.loads(leak_ids_str)
        result = []
        for leak_id in leak_ids:
            leak_str = self.leaks.get(leak_id, "")
            if leak_str:
                leak_data = json.loads(leak_str)
                if leak_data.get("status") == "VERIFIED":
                    result.append(leak_data)
        return json.dumps(result)

    @gl.public.view
    def get_platform_stats(self) -> str:
        """Platform-wide stats as JSON."""
        stats = {
            "total_leaks_submitted": int(self.total_leaks_submitted),
            "total_leaks_verified": int(self.total_leaks_verified),
            "total_leaks_rejected": int(self.total_leaks_rejected),
            "total_bounty_pool": str(int(self.total_bounty_pool)),
            "platform_owner": str(self.platform_owner)
        }
        return json.dumps(stats)

    @gl.public.view
    def get_submitter_reputation(self, pubkey: str) -> u256:
        """Get pseudonymous reputation score."""
        return self.submitter_reputation.get(pubkey, u256(100))

    @gl.public.view
    def verify_document_hash(self, document_hash: str) -> str:
        """Public tool: paste a document hash, get verification status."""
        leak_id = self.leak_by_document_hash.get(document_hash, "")
        if leak_id:
            return self.leaks.get(leak_id, "")
        return ""

    # === BOUNTY SYSTEM ===

    @gl.public.write.payable
    def fund_bounty_pool(self, category: str):
        """Anyone can fund a category-specific bounty pool (e.g., journalism DAOs)."""
        amount = gl.message.value
        assert amount > u256(0), "Funding amount must be greater than 0"
        assert category in ["corporate_fraud", "government", "environmental", 
                            "healthcare", "tech", "finance", "other"], "Invalid category"
        
        current_pool = self.bounty_pools.get(category, u256(0))
        self.bounty_pools[category] = current_pool + amount
        self.total_bounty_pool += amount

    @gl.public.write
    def claim_bounty(self, leak_id: str, submitter_pubkey: str, signature: str):
        """Submitter claims bounty for verified leak using their pseudonymous key signature.
        
        The signature is structured as follows:
        - "commit:<commit_hash>" where commit_hash = sha256(seed_hex + recipient_wallet_address)
          This locks in the payout recipient wallet to prevent mempool frontrunning.
        - "reveal:<seed_hex>" where seed_hex is revealed to release funds.
        """
        leak_str = self.leaks.get(leak_id, "")
        assert leak_str, "Leak does not exist"
        leak_data = json.loads(leak_str)
        assert leak_data.get("status") == "VERIFIED", "Leak is not verified"
        assert leak_data.get("submitter_pubkey") == submitter_pubkey, "Invalid submitter pubkey"
        
        if signature.startswith("commit:"):
            # Step 1: Commit Phase
            commit_hash = signature[7:]
            assert len(commit_hash) == 64, "Commit hash must be SHA-256 (64 chars)"
            
            # Store commitment
            claim = {
                "recipient": str(gl.message.sender_address),
                "commit_hash": commit_hash,
                "revealed": False
            }
            self.bounty_claims[leak_id] = json.dumps(claim)
            
        elif signature.startswith("reveal:"):
            # Step 2: Reveal Phase
            seed_hex = signature[7:]
            
            claim_str = self.bounty_claims.get(leak_id, "")
            assert claim_str, "No active claim commitment found. Call commit first."
            claim_data = json.loads(claim_str)
            assert not claim_data.get("revealed"), "Bounty already claimed"
            
            # 1. Verify seed matches submitter_pubkey
            # submitter_pubkey was stored as sha256(seed)
            computed_pubkey = hashlib.sha256(seed_hex.encode()).hexdigest()
            assert computed_pubkey == submitter_pubkey, "Seed does not match pseudonymous public key"
            
            # 2. Verify commit hash matches seed + stored recipient address
            stored_recipient = claim_data.get("recipient")
            expected_commit = hashlib.sha256((seed_hex + stored_recipient).encode()).hexdigest()
            assert expected_commit == claim_data.get("commit_hash"), "Invalid reveal: seed does not match commitment"
            
            # Payout Logic
            category = leak_data.get("category")
            bounty_amount = self.bounty_pools.get(category, u256(0))
            assert bounty_amount > u256(0), "No bounties currently active in this category"
            
            # Mark claim as claimed & clear bounty pool
            claim_data["revealed"] = True
            self.bounty_claims[leak_id] = json.dumps(claim_data)
            self.bounty_pools[category] = u256(0)
            
            if self.total_bounty_pool >= bounty_amount:
                self.total_bounty_pool -= bounty_amount
            else:
                self.total_bounty_pool = u256(0)
                
            self.leak_payouts[leak_id] = bounty_amount
            
            # Execute Transfer
            # Payout is securely routed to the pre-committed recipient address
            # gl.get_contract_at retrieves proxy and safely routes native tokens (GEN)
            recipient_contract = gl.get_contract_at(stored_recipient)
            recipient_contract.emit_transfer(value=bounty_amount, on='finalized')
            
        else:
            raise gl.vm.UserError("Invalid signature format. Must start with 'commit:' or 'reveal:'")
