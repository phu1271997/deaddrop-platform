# 🧠 DeadDrop Technical Architecture Deep-Dive

This document details the architectural decisions, cryptographic protocols, and AI prompt engineering that power DeadDrop's decentralized, AI-gated whistleblower infrastructure.

---

## ⚡ Why GenLayer?

Traditional decentralized file archives (such as WikiLeaks) suffer from three massive flaws:
1. **Centralization:** Submissions require manual validation by human editors, creating central points of failure, administrative backlogs, and target vectors for state actors.
2. **Lack of Trust:** Malicious actors can easily flood portals with fabricated or low-quality documents, diluting genuine files and damaging journalistic credibility.
3. **No Financial Incentives:** Sources risk career and personal ruin to expose wrongdoings without receiving any anonymous financial safety nets or compensation.

DeadDrop solves these issues by executing an **on-chain AI Editor** built on **GenLayer Intelligent Contracts**. GenLayer extends standard blockchain deterministic VMs to support **non-deterministic operations** (LLM evaluations and web requests) under a robust consensus protocol called **Optimistic Democracy**. 

This enables us to:
- Automatically scrape and render public verification documents (e.g., SEC EDGAR filings, public maritime tracking maps, news archives).
- Deploy independent, sandboxed AI validators to audit claims, detect fabrications, and calculate credibility scores completely decentralized.
- Automatically execute payouts to anonymous burner addresses upon validation.

---

## 🤖 The AI Gatekeeper Forensic Algorithm

When a whistleblower submits a leak transaction, the GenLayer network activates a non-deterministic validation block wrapped in `gl.vm.run_nondet_unsafe`:

1. **Evidence Scraping:** The leader node iterates through the submitted public evidence URLs (up to 5) and executes `gl.nondet.web.render(url, mode="text")` to pull the textual content of the public registries or IPFS paths.
2. **Target Cross-Referencing:** The leader node queries public database registries (e.g. SEC EDGAR search indices for the target company).
3. **Forensic Prompts:** The leader feeds these inputs into a highly structured audit prompt, instructing the model to act as an investigative journalist and forensic auditor.

### Prompt Engineering Decisions

The system prompt enforces strict journalistic and audit-based guidelines:
- **Authenticity Signals (40%):** Looks for specific details (dates, coordinates, transaction identifiers) rather than vague claims. It checks if the tone aligns with corporate communication or if it resembles ChatGPT-generated text.
- **Public Interest (30%):** Binds publication to accountability. Exposing a powerful entity committing systemic crimes is highly favored. Defamation of private individuals or personal disputes are filtered out.
- **Forensic Red Flags (20%):** Filters out repackaged news, conspiracy theories, and defamation.
- **Submitter Pattern (10%):** Adjusts weight based on the pseudonymous submitter's history and reputation.

The model is required to return a strict JSON response. This allows us to parse parameters deterministically in post-processing.

### Optimistic Consensus Validation

Rather than forcing every validator to re-run the expensive LLM prompt (which could yield minor syntax differences and lead to consensus failures), the **validator function** acts as a semantic filter. It verifies that:
- The proposed output is syntactically valid JSON.
- Contains the required verdict (`VERIFIED` or `REJECTED`).
- Scores are within boundary limits.
- If it conforms, consensus is approved. If not, validators reject it, triggering a leader rotation.

---

## 🔐 Anti-Frontrunning Commit-Reveal Payouts

In public blockchains, a massive vulnerability is **transaction frontrunning**. If a whistleblower reveals their secret seed to claim a bounty in a public transaction, a malicious node or frontrunner could observe the transaction in the mempool, extract the secret seed, and submit a high-priority transaction to divert the bounty to their own wallet address.

To eliminate this, DeadDrop uses a **two-step cryptographic commit-reveal protocol** in `claim_bounty`:

```
[ Whistleblower ]                 [ DeadDrop Contract ]
        |                                   |
        | 1. commit(leak_id, commit_hash)   |
        |---------------------------------->| -> Stores recipient and commit_hash
        |                                   |
        | [ Wait for finalization block ]   |
        |                                   |
        | 2. reveal(leak_id, seed_hex)      |
        |----------------------------->[1]  | -> Checks sha256(seed) == submitter_pubkey
        |                                   | -> Checks sha256(seed + recipient) == commit_hash
        |                                   | -> [2] Transfers GEN to committed recipient
        v                                   v
```

1. **Commit Phase:** The whistleblower calls `claim_bounty` with `"commit:<commit_hash>"`, where `commit_hash = sha256(seed_hex + recipient_address)`. The contract records the caller's address as the locked `stored_recipient_address`.
2. **Reveal Phase:** Once the transaction is finalized, the whistleblower calls `claim_bounty` again with `"reveal:<seed_hex>"`.
3. **Execution:** The contract:
   - Verifies `sha256(seed_hex) == submitter_pubkey` (proves they own the identity).
   - Reconstructs `expected_commit_hash = sha256(seed_hex + stored_recipient_address)`.
   - If they match, the bounty is sent to the `stored_recipient_address`.
4. **Security:** Even if frontrunners observe `seed_hex` in the mempool during the Reveal phase, they cannot modify the recipient to their own address because the payout is bound to the address recorded in the Commit phase!

---

## ⚠️ Threat Model & Limitations

While DeadDrop offers unprecedented source protection, users must remain aware of limitations:
- **Browser Sandbox:** Burner wallet keys are saved in local storage. Cleared histories delete them. Users must download key backups.
- **Physical OPSEC:** Cryptography cannot prevent physical tracking, canvas fingerprinting on personal laptops, or local network sniffing. Whistleblowers must submit transactions from public library/cafe networks on dedicated burner operating systems (e.g. TAILS OS).
- **Consensus Delays:** AI consensus audits require roughly 60-90 seconds. The frontend implements terminal animators to keep users engaged.
