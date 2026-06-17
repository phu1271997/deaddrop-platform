import pytest
import json
import hashlib
from genlayer import Address

def test_bounty_commit_reveal_success(contract, setup_gl_state):
    """Verify the entire commit-reveal bounty claim and pull-based withdrawal flow."""
    leak_id = "a" * 64
    doc_hash = "b" * 64
    seed = "my_secret_seed_credentials"
    # pubkey = sha256(seed)
    pubkey = hashlib.sha256(seed.encode()).hexdigest()
    
    # 1. Submit leak
    contract.submit_leak(
        leak_id=leak_id,
        title="PFAS dumping coordinates",
        category="environmental",
        target_entity="Apex Corp",
        summary="Apex dumped waste in maritime zones.",
        evidence_urls='[]',
        document_hash=doc_hash,
        submitter_pubkey=pubkey
    )
    
    # 2. Fund leak bounty
    setup_gl_state.message.value = 10 * 10**18  # 10 GEN
    contract.fund_leak_bounty(leak_id)
    assert contract.get_leak_bounty(leak_id) == 10 * 10**18
    assert contract.total_bounty_pool == 10 * 10**18
    
    # 3. Commit Phase
    recipient = "0x2222222222222222222222222222222222222222"
    setup_gl_state.message.sender_address = Address(recipient)
    setup_gl_state.message.value = 0
    
    commit_hash = hashlib.sha256((seed + recipient).encode()).hexdigest()
    contract.claim_bounty(leak_id, pubkey, f"commit:{commit_hash}")
    
    # Verify commitment stored
    claim_str = contract.bounty_claims.get(leak_id)
    assert claim_str != ""
    claim_data = json.loads(claim_str)
    assert claim_data["recipient"] == recipient
    assert claim_data["commit_hash"] == commit_hash
    assert not claim_data["revealed"]
    
    # 4. Reveal Phase
    contract.claim_bounty(leak_id, pubkey, f"reveal:{seed}")
    
    # Verify state updates
    claim_data = json.loads(contract.bounty_claims.get(leak_id))
    assert claim_data["revealed"]
    assert contract.get_leak_bounty(leak_id) == 0
    assert contract.total_bounty_pool == 0
    assert contract.get_withdrawable_balance(recipient) == 10 * 10**18
    
    # 5. Withdraw Phase
    contract.withdraw()
    assert contract.get_withdrawable_balance(recipient) == 0
    
    # Verify contract transfer was emitted
    mock_contract = setup_gl_state.get_contract_at(recipient)
    mock_contract.emit_transfer.assert_called_once_with(value=10 * 10**18, on='finalized')

def test_frontrunning_protection(contract, setup_gl_state):
    """Verify that a frontrunner cannot hijack the bounty by copying the reveal seed."""
    leak_id = "a" * 64
    seed = "my_secret_seed_credentials"
    pubkey = hashlib.sha256(seed.encode()).hexdigest()
    
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
    
    # Whistleblower commits
    whistleblower = "0x2222222222222222222222222222222222222222"
    setup_gl_state.message.sender_address = Address(whistleblower)
    setup_gl_state.message.value = 0
    commit_hash = hashlib.sha256((seed + whistleblower).encode()).hexdigest()
    contract.claim_bounty(leak_id, pubkey, f"commit:{commit_hash}")
    
    # Frontrunner intercepts reveal seed from mempool and attempts to call reveal with their address
    frontrunner = "0x3333333333333333333333333333333333333333"
    setup_gl_state.message.sender_address = Address(frontrunner)
    
    with pytest.raises(Exception, match="seed does not match commitment"):
        contract.claim_bounty(leak_id, pubkey, f"reveal:{seed}")
