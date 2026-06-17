# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *
import json
import hashlib

def fund_leak_bounty_impl(self, leak_id: str, amount: u256) -> None:
    """Funds a targeted bounty for a specific leak ID."""
    if int(amount) == 0:
        raise gl.vm.UserError("Bounty must be > 0")
    
    leak_str = self.leaks.get(leak_id, "")
    if not leak_str:
        raise gl.vm.UserError("Leak does not exist")
        
    current = self.leak_bounty.get(leak_id, u256(0))
    self.leak_bounty[leak_id] = u256(int(current) + int(amount))
    self.total_bounty_pool = u256(int(self.total_bounty_pool) + int(amount))

def claim_bounty_impl(self, leak_id: str, submitter_pubkey: str, signature: str) -> None:
    """Claims the bounty for a verified leak using a commit-reveal protocol."""
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
            
        # Check if already committed or revealed
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
            
        # 1. Verify seed matches submitter_pubkey (stored as sha256(seed))
        computed_pubkey = hashlib.sha256(seed_hex.encode()).hexdigest()
        if computed_pubkey != submitter_pubkey:
            raise gl.vm.UserError("Seed does not match pseudonymous public key")
            
        # 2. Verify commit hash matches seed + stored recipient address
        stored_recipient = claim_data.get("recipient")
        if str(gl.message.sender_address) != stored_recipient:
            raise gl.vm.UserError("Invalid reveal: seed does not match commitment")
            
        expected_commit = hashlib.sha256((seed_hex + stored_recipient).encode()).hexdigest()
        if expected_commit != claim_data.get("commit_hash"):
            raise gl.vm.UserError("Invalid reveal: seed does not match commitment")
            
        # Calculate payout
        bounty_amount = self.leak_bounty.get(leak_id, u256(0))
        if int(bounty_amount) == 0:
            raise gl.vm.UserError("No bounty currently active for this leak")
            
        # Mark as claimed and clear bounty
        claim_data["revealed"] = True
        self.bounty_claims[leak_id] = json.dumps(claim_data)
        self.leak_bounty[leak_id] = u256(0)
        
        if int(self.total_bounty_pool) >= int(bounty_amount):
            self.total_bounty_pool = u256(int(self.total_bounty_pool) - int(bounty_amount))
        else:
            self.total_bounty_pool = u256(0)
            
        self.leak_payouts[leak_id] = bounty_amount
        
        # Credit recipient withdrawable balance
        try:
            recipient_addr = Address(stored_recipient)
        except Exception:
            raise gl.vm.UserError(f"Invalid recipient address: {stored_recipient}")
            
        current = self.withdrawable_balance.get(recipient_addr, u256(0))
        self.withdrawable_balance[recipient_addr] = u256(int(current) + int(bounty_amount))
    else:
        raise gl.vm.UserError("Invalid signature format. Must start with 'commit:' or 'reveal:'")
