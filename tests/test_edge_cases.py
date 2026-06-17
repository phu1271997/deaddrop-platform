import pytest
import json
import hashlib
from genlayer import Address

def test_withdraw_zero_balance(contract, setup_gl_state):
    """Verify that withdrawing with zero balance raises UserError."""
    setup_gl_state.message.sender_address = Address("0x2222222222222222222222222222222222222222")
    with pytest.raises(Exception, match="No balance to withdraw"):
        contract.withdraw()

def test_fund_leak_bounty_non_existent(contract, setup_gl_state):
    """Verify that funding a non-existent leak is rejected."""
    setup_gl_state.message.value = 10 * 10**18
    with pytest.raises(Exception, match="Leak does not exist"):
        contract.fund_leak_bounty("non_existent_leak_id" + "a"*44)

def test_claim_bounty_reveal_without_commit(contract, setup_gl_state):
    """Verify that revealing without an active commitment fails."""
    leak_id = "a" * 64
    pubkey = "c" * 64
    
    # Submit leak and fund bounty
    contract.submit_leak(
        leak_id=leak_id,
        title="PFAS dumping coordinates",
        category="environmental",
        target_entity="Apex Corp",
        summary="Apex dumped waste.",
        evidence_urls='[]',
        document_hash="b" * 64,
        submitter_pubkey=pubkey
    )
    setup_gl_state.message.value = 10 * 10**18
    contract.fund_leak_bounty(leak_id)
    
    # Direct reveal call without commit
    with pytest.raises(Exception, match="No active claim commitment found"):
        contract.claim_bounty(leak_id, pubkey, "reveal:my_seed")

def test_claim_bounty_duplicate_commit(contract, setup_gl_state):
    """Verify that committing twice is rejected."""
    leak_id = "a" * 64
    pubkey = "c" * 64
    
    # Submit leak and fund bounty
    contract.submit_leak(
        leak_id=leak_id,
        title="PFAS dumping coordinates",
        category="environmental",
        target_entity="Apex Corp",
        summary="Apex dumped waste.",
        evidence_urls='[]',
        document_hash="b" * 64,
        submitter_pubkey=pubkey
    )
    setup_gl_state.message.value = 10 * 10**18
    contract.fund_leak_bounty(leak_id)
    
    # Commit once
    recipient = "0x2222222222222222222222222222222222222222"
    setup_gl_state.message.sender_address = Address(recipient)
    commit_hash = "h" * 64
    contract.claim_bounty(leak_id, pubkey, f"commit:{commit_hash}")
    
    # Commit again
    with pytest.raises(Exception, match="Bounty already has active commitment"):
        contract.claim_bounty(leak_id, pubkey, f"commit:{commit_hash}")
