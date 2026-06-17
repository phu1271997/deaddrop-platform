# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *

def check_rate_limit_impl(self, submitter_pubkey: str, current_timestamp: u256) -> None:
    """Enforces submitter rate limiting: max 1 submission per hour per identity."""
    last_sub = self.submitter_last_submission.get(submitter_pubkey, u256(0))
    if int(last_sub) > 0:
        if int(current_timestamp) < int(last_sub) + 3600:
            raise gl.vm.UserError("Rate limit: Max 1 submission per hour per identity")

def update_reputation_impl(self, submitter_pubkey: str, is_verified: bool) -> None:
    """Updates the submitter's reputation score and submission statistics."""
    base_rep = self.submitter_reputation.get(submitter_pubkey, u256(100))
    
    if is_verified:
        self.submitter_reputation[submitter_pubkey] = u256(int(base_rep) + 50)
    else:
        # Prevent spam by demoting reputation, floor at 0
        if int(base_rep) >= 10:
            self.submitter_reputation[submitter_pubkey] = u256(int(base_rep) - 10)
        else:
            self.submitter_reputation[submitter_pubkey] = u256(0)
            
    # Track statistics
    prev_sub_count = self.submitter_total_submissions.get(submitter_pubkey, u256(0))
    self.submitter_total_submissions[submitter_pubkey] = u256(int(prev_sub_count) + 1)
