# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json
import hashlib
import re

# ==========================================
# MODULAR IMPORTS WITH FALLBACK
# ==========================================
try:
    from contracts.deaddrop_core import _now, _parse_llm_result, verify_document_hash_impl
    from contracts.deaddrop_treasury import withdraw_impl, credit_balance_impl
    from contracts.deaddrop_reputation import check_rate_limit_impl, update_reputation_impl
    from contracts.deaddrop_bounty import fund_leak_bounty_impl, claim_bounty_impl
except ImportError:
    # Fallback implementations if compile flat
    def _now(self) -> u256:
        try:
            ts = gl.message.timestamp
            return u256(int(ts))
        except (AttributeError, Exception):
            try:
                dt = gl.message_raw.get("datetime")
                if hasattr(dt, "timestamp"):
                    return u256(int(dt.timestamp()))
                if isinstance(dt, (int, float)):
                    return u256(int(dt))
            except Exception:
                pass
            return u256(0)

    def _parse_llm_result(raw) -> dict:
        if isinstance(raw, dict):
            return raw
        if isinstance(raw, str):
            try:
                return json.loads(raw)
            except Exception:
                cleaned = re.sub(r"```(?:json)?\s*|\s*```", "", raw).strip()
                first = cleaned.find("{")
                last = cleaned.rfind("}")
                if first != -1 and last != -1:
                    cleaned = cleaned[first:last+1]
                    try:
                        return json.loads(cleaned)
                    except Exception:
                        pass
                raise gl.vm.UserError(f"Cannot parse LLM JSON: {raw[:200]}")
        raise gl.vm.UserError(f"Unexpected LLM result type: {type(raw)}")

    def verify_document_hash_impl(self, document_hash: str) -> str:
        leak_ids_str = self.leak_ids_by_document_hash.get(document_hash, "")
        if not leak_ids_str:
            return "[]"
        try:
            leak_ids = json.loads(leak_ids_str)
        except Exception:
            return "[]"
        result = []
        for leak_id in leak_ids:
            leak_str = self.leaks.get(leak_id, "")
            if leak_str:
                try:
                    result.append(json.loads(leak_str))
                except Exception:
                    pass
        return json.dumps(result)

    def withdraw_impl(self) -> u256:
        sender = gl.message.sender_address
        amount = self.withdrawable_balance.get(sender, u256(0))
        if int(amount) == 0:
            raise gl.vm.UserError("No balance to withdraw")
        self.withdrawable_balance[sender] = u256(0)
        recipient_contract = gl.get_contract_at(sender.as_hex)
        recipient_contract.emit_transfer(value=amount, on='finalized')
        return amount

    def credit_balance_impl(self, recipient: Address, amount: u256) -> None:
        if int(amount) <= 0:
            return
        current = self.withdrawable_balance.get(recipient, u256(0))
        self.withdrawable_balance[recipient] = u256(int(current) + int(amount))

    def check_rate_limit_impl(self, submitter_pubkey: str, current_timestamp: u256) -> None:
        last_sub = self.submitter_last_submission.get(submitter_pubkey, u256(0))
        if int(last_sub) > 0:
            if int(current_timestamp) < int(last_sub) + 3600:
                raise gl.vm.UserError("Rate limit: Max 1 submission per hour per identity")

    def update_reputation_impl(self, submitter_pubkey: str, is_verified: bool) -> None:
        base_rep = self.submitter_reputation.get(submitter_pubkey, u256(100))
        if is_verified:
            self.submitter_reputation[submitter_pubkey] = u256(int(base_rep) + 50)
        else:
            if int(base_rep) >= 10:
                self.submitter_reputation[submitter_pubkey] = u256(int(base_rep) - 10)
            else:
                self.submitter_reputation[submitter_pubkey] = u256(0)
        prev_sub_count = self.submitter_total_submissions.get(submitter_pubkey, u256(0))
        self.submitter_total_submissions[submitter_pubkey] = u256(int(prev_sub_count) + 1)

    def fund_leak_bounty_impl(self, leak_id: str, amount: u256) -> None:
        if int(amount) == 0:
            raise gl.vm.UserError("Bounty must be > 0")
        leak_str = self.leaks.get(leak_id, "")
        if not leak_str:
            raise gl.vm.UserError("Leak does not exist")
        current = self.leak_bounty.get(leak_id, u256(0))
        self.leak_bounty[leak_id] = u256(int(current) + int(amount))
        self.total_bounty_pool = u256(int(self.total_bounty_pool) + int(amount))

    def claim_bounty_impl(self, leak_id: str, submitter_pubkey: str, signature: str) -> None:
        leak_str = self.leaks.get(leak_id, "")
        if not leak_str:
            raise gl.vm.UserError("Leak does not exist")
        leak_data = json.loads(leak_str)
        if leak_data.get("status") != "VERIFIED":
            raise gl.vm.UserError("Leak is not verified")
        if leak_data.get("submitter_pubkey") != submitter_pubkey:
            raise gl.vm.UserError("Invalid submitter pubkey")
        if signature.startswith("commit:"):
            commit_hash = signature[7:]
            if len(commit_hash) != 64:
                raise gl.vm.UserError("Commit hash must be SHA-256 (64 chars)")
            claim_str = self.bounty_claims.get(leak_id, "")
            if claim_str:
                claim_data = json.loads(claim_str)
                if claim_data.get("revealed"):
                    raise gl.vm.UserError("Bounty already claimed")
                raise gl.vm.UserError("Bounty already has active commitment")
            claim = {
                "recipient": str(gl.message.sender_address),
                "commit_hash": commit_hash,
                "revealed": False
            }
            self.bounty_claims[leak_id] = json.dumps(claim)
        elif signature.startswith("reveal:"):
            seed_hex = signature[7:]
            claim_str = self.bounty_claims.get(leak_id, "")
            if not claim_str:
                raise gl.vm.UserError("No active claim commitment found. Call commit first.")
            claim_data = json.loads(claim_str)
            if claim_data.get("revealed"):
                raise gl.vm.UserError("Bounty already claimed")
            computed_pubkey = hashlib.sha256(seed_hex.encode()).hexdigest()
            if computed_pubkey != submitter_pubkey:
                raise gl.vm.UserError("Seed does not match pseudonymous public key")
            stored_recipient = claim_data.get("recipient")
            if str(gl.message.sender_address) != stored_recipient:
                raise gl.vm.UserError("Invalid reveal: seed does not match commitment")
            expected_commit = hashlib.sha256((seed_hex + stored_recipient).encode()).hexdigest()
            if expected_commit != claim_data.get("commit_hash"):
                raise gl.vm.UserError("Invalid reveal: seed does not match commitment")
            bounty_amount = self.leak_bounty.get(leak_id, u256(0))
            if int(bounty_amount) == 0:
                raise gl.vm.UserError("No bounty currently active for this leak")
            claim_data["revealed"] = True
            self.bounty_claims[leak_id] = json.dumps(claim_data)
            self.leak_bounty[leak_id] = u256(0)
            if int(self.total_bounty_pool) >= int(bounty_amount):
                self.total_bounty_pool = u256(int(self.total_bounty_pool) - int(bounty_amount))
            else:
                self.total_bounty_pool = u256(0)
            self.leak_payouts[leak_id] = bounty_amount
            try:
                recipient_addr = Address(stored_recipient)
            except Exception:
                raise gl.vm.UserError(f"Invalid recipient address: {stored_recipient}")
            current = self.withdrawable_balance.get(recipient_addr, u256(0))
            self.withdrawable_balance[recipient_addr] = u256(int(current) + int(bounty_amount))
        else:
            raise gl.vm.UserError("Invalid signature format. Must start with 'commit:' or 'reveal:'")


class Contract(gl.Contract):
    # Platform metadata
    platform_owner: Address
    total_leaks_submitted: u256
    total_leaks_verified: u256
    total_leaks_rejected: u256
    total_bounty_pool: u256

    # Leaks: leak_id -> JSON string
    leaks: TreeMap[str, str]
    all_leak_ids: DynArray[str]
    leaks_by_category: TreeMap[str, str]
    
    # Document Hash mappings
    leak_ids_by_document_hash: TreeMap[str, str] # stores JSON array of leak_ids
    
    # Status arrays
    verified_leaks: DynArray[str]
    rejected_leaks: DynArray[str]
    
    # Bounty system
    bounty_pools: TreeMap[str, u256] # category -> pool amount
    leak_bounty: TreeMap[str, u256]  # leak_id -> assigned bounty
    leak_payouts: TreeMap[str, u256]
    bounty_claims: TreeMap[str, str]
    
    # Treasury balance (pull-based withdrawal)
    withdrawable_balance: TreeMap[Address, u256]
    
    # Submitter metrics
    submitter_reputation: TreeMap[str, u256]
    submitter_total_submissions: TreeMap[str, u256]
    submitter_last_submission: TreeMap[str, u256]

    # Appeals
    # leak_id -> status string: NONE | PENDING | OVERTURNED | UPHELD
    appeal_status: TreeMap[str, str]
    appeal_stake: TreeMap[str, u256]
    appeal_evidence: TreeMap[str, str]

    def __init__(self):
        super().__init__()
        self.platform_owner = gl.message.sender_address
        self.total_leaks_submitted = u256(0)
        self.total_leaks_verified = u256(0)
        self.total_leaks_rejected = u256(0)
        self.total_bounty_pool = u256(0)

    # === LEAK SUBMISSION & AI VERIFICATION ===

    @gl.public.write
    def submit_leak(
        self,
        leak_id: str,
        title: str,
        category: str,
        target_entity: str,
        summary: str,
        evidence_urls: str,
        document_hash: str,
        submitter_pubkey: str
    ):
        """Submit a new leak for AI verification using prompt comparative consensus."""
        
        # === VALIDATION ===
        if len(leak_id) != 64:
            raise gl.vm.UserError("leak_id must be SHA-256 hex (64 chars)")
        if self.leaks.get(leak_id, ""):
            raise gl.vm.UserError("Leak ID already exists")
        if len(summary) > 2000:
            raise gl.vm.UserError("Summary too long")
        if not title.strip():
            raise gl.vm.UserError("Title cannot be empty")
        if not target_entity.strip():
            raise gl.vm.UserError("Target entity cannot be empty")
        if category not in ["corporate_fraud", "government", "environmental", 
                            "healthcare", "tech", "finance", "other"]:
            raise gl.vm.UserError("Invalid category")
            
        current_timestamp = _now(self)
        check_rate_limit_impl(self, submitter_pubkey, current_timestamp)

        # Warnings for excess evidence urls
        try:
            parsed_urls = json.loads(evidence_urls)
        except Exception:
            parsed_urls = []
            
        # === AI GATEKEEPER CONSENSUS ===
        def leader_fn():
            evidence_contents = []
            for i in range(min(len(parsed_urls), 5)):
                url = parsed_urls[i]
                try:
                    rendered = gl.nondet.web.render(url, mode="text")
                    evidence_contents.append(f"Evidence [{i}]: {url}\nContent:\n{rendered[:4000]}")
                except Exception as e:
                    evidence_contents.append(f"Evidence [{i}]: {url}\nError rendering: {str(e)}")
            
            sec_data = ""
            try:
                sec_data = gl.nondet.web.render(
                    f"https://efts.sec.gov/LATEST/search-index?q=%22{target_entity}%22&forms=10-K,8-K",
                    mode="text"
                )
            except Exception as e:
                sec_data = f"Error querying public SEC databases: {str(e)}"
                
            evidence_str = "\n\n".join(evidence_contents)
            rep_score = int(self.submitter_reputation.get(submitter_pubkey, u256(100)))
            prev_subs = int(self.submitter_total_submissions.get(submitter_pubkey, u256(0)))
            
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
   - Specific details, dates, transaction codes.
   - Cross-referencing match to public filing databases.
2. PUBLIC INTEREST (weight: 30%):
   - Systemic wrongdoing affecting citizens/environment.
3. FORENSIC RED FLAGS (weight: 20%):
   - Personal vendettas, defamation, repackaging common knowledge.
4. SUBMITTER PATTERN (weight: 10%):
   - Submitter's past verification records.

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
- VERIFIED requires: credibility_score >= 70 AND public_interest_score >= 50.
- Otherwise verdict must be REJECTED.
"""
            return gl.nondet.exec_prompt(prompt, response_format="json")

        comparative_principle = (
            "Validators MUST agree on: "
            "(1) verdict — exact match required ('VERIFIED' or 'REJECTED'). "
            "If validators disagree on verdict, consensus FAILS. "
            "(2) credibility_score — within ±15 points deviation AND must be "
            "consistent with verdict (>=70 implies VERIFIED, <70 implies REJECTED). "
            "(3) public_interest_score — within ±15 points deviation. "
            "(4) red_flags — must agree on whether high-severity red flags exist. "
            "Minor wording differences in 'reasoning' are acceptable, but the core decision must align."
        )

        # Execute under comparative consensus
        ai_result_str = gl.eq_principle.prompt_comparative(leader_fn, principle=comparative_principle)
        ai_data = _parse_llm_result(ai_result_str)
        
        credibility_score = int(ai_data.get("credibility_score", 0))
        public_interest_score = int(ai_data.get("public_interest_score", 0))
        
        # Enforce threshold rules deterministically in post-processing
        if credibility_score >= 70 and public_interest_score >= 50:
            final_verdict = "VERIFIED"
        else:
            final_verdict = "REJECTED"
            
        # Build leak JSON record
        leak_record = {
            "leak_id": leak_id,
            "title": title,
            "category": category,
            "target_entity": target_entity,
            "summary": summary,
            "evidence_urls": parsed_urls,
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
        
        # Save to document hash mapping without collisions
        existing_str = self.leak_ids_by_document_hash.get(document_hash, "")
        if existing_str:
            try:
                existing_list = json.loads(existing_str)
            except Exception:
                existing_list = []
        else:
            existing_list = []
        existing_list.append(leak_id)
        self.leak_ids_by_document_hash[document_hash] = json.dumps(existing_list)
        
        # Update category index
        category_list = []
        category_list_str = self.leaks_by_category.get(category, "")
        if category_list_str:
            try:
                category_list = json.loads(category_list_str)
            except Exception:
                category_list = []
        category_list.append(leak_id)
        self.leaks_by_category[category] = json.dumps(category_list)
        
        # Post-consensus status tracking
        if final_verdict == "VERIFIED":
            self.verified_leaks.append(leak_id)
            self.total_leaks_verified = u256(int(self.total_leaks_verified) + 1)
            update_reputation_impl(self, submitter_pubkey, True)
            
            # Allocation from general pool to this leak (up to 10% or 5 GEN cap)
            pool_amount = self.bounty_pools.get(category, u256(0))
            if int(pool_amount) > 0:
                cap = 5 * 10**18 # 5 GEN in wei
                allocation = min(int(pool_amount) // 10, cap)
                if allocation == 0:
                    allocation = int(pool_amount)
                
                self.bounty_pools[category] = u256(int(pool_amount) - allocation)
                current_leak_bounty = self.leak_bounty.get(leak_id, u256(0))
                self.leak_bounty[leak_id] = u256(int(current_leak_bounty) + allocation)
        else:
            self.rejected_leaks.append(leak_id)
            self.total_leaks_rejected = u256(int(self.total_leaks_rejected) + 1)
            update_reputation_impl(self, submitter_pubkey, False)
            
        self.total_leaks_submitted = u256(int(self.total_leaks_submitted) + 1)
        self.submitter_last_submission[submitter_pubkey] = current_timestamp

    # === APPEAL PROCESS ===

    @gl.public.write.payable
    def appeal_rejection(self, leak_id: str, additional_evidence_urls: str):
        """Whistleblowers appeal a REJECTED leak within 7 days by staking 5 GEN and adding new evidence."""
        leak_str = self.leaks.get(leak_id, "")
        if not leak_str:
            raise gl.vm.UserError("Leak does not exist")
            
        leak_data = json.loads(leak_str)
        if leak_data.get("status") != "REJECTED":
            raise gl.vm.UserError("Only rejected leaks can be appealed")
            
        current_appeal = self.appeal_status.get(leak_id, "NONE")
        if current_appeal != "NONE":
            raise gl.vm.UserError("Appeal already active or processed")
            
        # Verify 5 GEN stake
        appeal_fee = 5 * 10**18  # 5 GEN in wei
        if int(gl.message.value) < appeal_fee:
            raise gl.vm.UserError("Staking requirement of 5 GEN not met")
            
        # Verify 7-day window
        submission_timestamp = leak_data.get("submission_timestamp", 0)
        current_timestamp = _now(self)
        if int(current_timestamp) > int(submission_timestamp) + (7 * 86400):
            raise gl.vm.UserError("Appeal period expired (7 days max)")
            
        self.appeal_status[leak_id] = "PENDING"
        self.appeal_stake[leak_id] = gl.message.value
        self.appeal_evidence[leak_id] = additional_evidence_urls
        
        # Change status in manifest to DISPUTED
        leak_data["status"] = "DISPUTED"
        self.leaks[leak_id] = json.dumps(leak_data)
        
        # AI Re-evaluation consensus
        try:
            new_urls = json.loads(additional_evidence_urls)
        except Exception:
            new_urls = []
            
        def appeal_leader_fn():
            evidence_contents = []
            for i in range(min(len(new_urls), 5)):
                url = new_urls[i]
                try:
                    rendered = gl.nondet.web.render(url, mode="text")
                    evidence_contents.append(f"New Evidence [{i}]: {url}\nContent:\n{rendered[:4000]}")
                except Exception as e:
                    evidence_contents.append(f"New Evidence [{i}]: {url}\nError rendering: {str(e)}")
                    
            new_evidence_str = "\n\n".join(evidence_contents)
            
            prompt = f"""You are a senior appellate editorial board reviewing a disputed whistleblower leak.
Original Verdict was REJECTED. Submitter has appealed by staking collateral and providing new evidence.

ORIGINAL SUBMISSION:
- Title: "{leak_data.get('title')}"
- Summary: "{leak_data.get('summary')}"
- Target Entity: "{leak_data.get('target_entity')}"
- Original AI Reasoning: "{leak_data.get('ai_reasoning')}"

NEW APPEAL EVIDENCE:
{new_evidence_str}

Evaluate whether the new evidence resolves the original rejection issues (such as verifying authentic timelines, establishing cross-references).
OUTPUT JSON:
{{
    "decision": "OVERTURNED" or "UPHELD",
    "credibility_score": 0-100,
    "public_interest_score": 0-100,
    "reasoning": "concise explanation of appeal decision"
}}
"""
            return gl.nondet.exec_prompt(prompt, response_format="json")
            
        comparative_principle = (
            "Validators MUST agree on: "
            "(1) decision — exact match required ('OVERTURNED' or 'UPHELD'). "
            "(2) credibility_score — within ±15 points deviation. "
            "(3) public_interest_score — within ±15 points deviation."
        )
        
        ai_appeal_result = gl.eq_principle.prompt_comparative(appeal_leader_fn, principle=comparative_principle)
        appeal_data = _parse_llm_result(ai_appeal_result)
        
        decision = appeal_data.get("decision", "UPHELD")
        credibility_score = int(appeal_data.get("credibility_score", 0))
        public_interest = int(appeal_data.get("public_interest_score", 0))
        
        submitter_pubkey = leak_data.get("submitter_pubkey")
        
        if decision == "OVERTURNED" and credibility_score >= 70 and public_interest >= 50:
            # Overturn rejection -> VERIFIED
            self.appeal_status[leak_id] = "OVERTURNED"
            leak_data["status"] = "VERIFIED"
            leak_data["credibility_score"] = credibility_score
            leak_data["public_interest_score"] = public_interest
            leak_data["ai_reasoning"] = appeal_data.get("reasoning", "Appeal accepted.")
            
            # Boost submitter reputation (overturn reward)
            update_reputation_impl(self, submitter_pubkey, True)
            
            # Refund stake (credit to withdrawable balance)
            stake = self.appeal_stake.get(leak_id, u256(0))
            self.appeal_stake[leak_id] = u256(0)
            credit_balance_impl(self, gl.message.sender_address, stake)
            
            # Shift from rejected arrays to verified
            self.verified_leaks.append(leak_id)
            self.total_leaks_verified = u256(int(self.total_leaks_verified) + 1)
            if int(self.total_leaks_rejected) > 0:
                self.total_leaks_rejected = u256(int(self.total_leaks_rejected) - 1)
        else:
            # Appeal rejected -> UPHELD (Forfeit stake, remains rejected)
            self.appeal_status[leak_id] = "UPHELD"
            leak_data["status"] = "REJECTED"
            leak_data["ai_reasoning"] = appeal_data.get("reasoning", "Appeal rejected.")
            
            # Penalty for false appeals (forfeit stake remains in contract)
            self.appeal_stake[leak_id] = u256(0)
            update_reputation_impl(self, submitter_pubkey, False)
            
        self.leaks[leak_id] = json.dumps(leak_data)

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
                try:
                    result.append(json.loads(leak_str))
                except Exception:
                    pass
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
                try:
                    leak_data = json.loads(leak_str)
                    if leak_data.get("status") == "VERIFIED":
                        result.append(leak_data)
                except Exception:
                    pass
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
        """Public verification tool: lookup leaks matching a document hash."""
        return verify_document_hash_impl(self, document_hash)

    @gl.public.view
    def get_withdrawable_balance(self, addr: str) -> u256:
        """Get the withdrawable balance of a given address in wei."""
        try:
            target = Address(addr)
        except Exception:
            raise gl.vm.UserError(f"Invalid address format: {addr}")
        return self.withdrawable_balance.get(target, u256(0))

    @gl.public.view
    def get_leak_bounty(self, leak_id: str) -> u256:
        """Get active bounty allocated to a specific leak."""
        return self.leak_bounty.get(leak_id, u256(0))

    # === BOUNTY SYSTEM ===

    @gl.public.write.payable
    def fund_bounty_pool(self, category: str):
        """Anyone can fund a category-specific bounty pool (e.g., journalism DAOs)."""
        amount = gl.message.value
        if int(amount) == 0:
            raise gl.vm.UserError("Funding amount must be greater than 0")
        if category not in ["corporate_fraud", "government", "environmental", 
                            "healthcare", "tech", "finance", "other"]:
            raise gl.vm.UserError("Invalid category")
        
        current_pool = self.bounty_pools.get(category, u256(0))
        self.bounty_pools[category] = u256(int(current_pool) + int(amount))
        self.total_bounty_pool = u256(int(self.total_bounty_pool) + int(amount))

    @gl.public.write.payable
    def fund_leak_bounty(self, leak_id: str):
        """Fund a bounty assigned to a specific leak ID."""
        fund_leak_bounty_impl(self, leak_id, gl.message.value)

    @gl.public.write
    def claim_bounty(self, leak_id: str, submitter_pubkey: str, signature: str):
        """Submitter claims bounty for verified leak using their pseudonymous key signature.
        
        Double-commit claim workflow:
        - "commit:<commit_hash>" locks in the recipient wallet.
        - "reveal:<seed_hex>" releases funds to pre-locked wallet withdrawable balance.
        """
        claim_bounty_impl(self, leak_id, submitter_pubkey, signature)

    @gl.public.write
    def withdraw(self) -> u256:
        """Withdraw accrued bounty funds to claimant's wallet address."""
        return withdraw_impl(self)
