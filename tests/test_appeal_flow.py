import pytest
import json
from genlayer import Address

def test_appeal_flow_overturn(contract, setup_gl_state):
    """Verify that a rejected leak can be appealed and overturned successfully."""
    leak_id = "a" * 64
    pubkey = "c" * 64
    
    # 1. Setup mock to reject submission
    setup_gl_state.nondet.exec_prompt = lambda prompt, response_format=None: '{"verdict": "REJECTED", "credibility_score": 45, "public_interest_score": 30, "reasoning": "Insincere.", "red_flags": [], "recommended_followup": "None", "estimated_impact": "LOW"}'
    
    contract.submit_leak(
        leak_id=leak_id,
        title="Spam Leak",
        category="environmental",
        target_entity="Apex Corp",
        summary="Spam content.",
        evidence_urls='[]',
        document_hash="b" * 64,
        submitter_pubkey=pubkey
    )
    
    assert contract.total_leaks_rejected == 1
    assert json.loads(contract.get_leak(leak_id))["status"] == "REJECTED"
    assert contract.get_submitter_reputation(pubkey) == 90 # demoted from 100
    
    # 2. Whistleblower appeals with 5 GEN stake and new evidence
    setup_gl_state.message.value = 5 * 10**18 # 5 GEN stake
    setup_gl_state.message.sender_address = Address("0x2222222222222222222222222222222222222222")
    
    # Mock appeal decision to return OVERTURNED
    setup_gl_state.nondet.exec_prompt = lambda prompt, response_format=None: '{"decision": "OVERTURNED", "credibility_score": 88, "public_interest_score": 80, "reasoning": "New evidence is valid."}'
    
    contract.appeal_rejection(leak_id, '["https://new-evidence.org/doc"]')
    
    # Verify state updates
    leak_data = json.loads(contract.get_leak(leak_id))
    assert leak_data["status"] == "VERIFIED"
    assert leak_data["credibility_score"] == 88
    
    assert contract.total_leaks_verified == 1
    assert contract.total_leaks_rejected == 0
    assert contract.get_submitter_reputation(pubkey) == 140 # boosted by +50 from 90
    
    # Stake should be refunded (credited to withdrawable balance of sender)
    assert contract.get_withdrawable_balance("0x2222222222222222222222222222222222222222") == 5 * 10**18

def test_appeal_flow_upheld(contract, setup_gl_state):
    """Verify that if an appeal is rejected, the status remains REJECTED and stake is forfeited."""
    leak_id = "a" * 64
    pubkey = "c" * 64
    
    # Reject submission
    setup_gl_state.nondet.exec_prompt = lambda prompt, response_format=None: '{"verdict": "REJECTED", "credibility_score": 45, "public_interest_score": 30, "reasoning": "Insincere.", "red_flags": [], "recommended_followup": "None", "estimated_impact": "LOW"}'
    
    contract.submit_leak(
        leak_id=leak_id,
        title="Spam Leak",
        category="environmental",
        target_entity="Apex Corp",
        summary="Spam content.",
        evidence_urls='[]',
        document_hash="b" * 64,
        submitter_pubkey=pubkey
    )
    
    # Whistleblower appeals with 5 GEN
    setup_gl_state.message.value = 5 * 10**18
    setup_gl_state.message.sender_address = Address("0x2222222222222222222222222222222222222222")
    
    # Mock appeal decision to return UPHELD
    setup_gl_state.nondet.exec_prompt = lambda prompt, response_format=None: '{"decision": "UPHELD", "credibility_score": 40, "public_interest_score": 30, "reasoning": "Still fake."}'
    
    contract.appeal_rejection(leak_id, '["https://fake-evidence.org/doc"]')
    
    # Verify state updates
    leak_data = json.loads(contract.get_leak(leak_id))
    assert leak_data["status"] == "REJECTED"
    assert contract.total_leaks_verified == 0
    assert contract.total_leaks_rejected == 1
    assert contract.get_submitter_reputation(pubkey) == 80 # demoted again (-10)
    
    # Stake is forfeited (not credited to withdrawable balance)
    assert contract.get_withdrawable_balance("0x2222222222222222222222222222222222222222") == 0

def test_appeal_rejection_expired(contract, setup_gl_state):
    """Verify that appeals submitted after 7 days are rejected."""
    leak_id = "a" * 64
    pubkey = "c" * 64
    
    # Reject submission
    setup_gl_state.nondet.exec_prompt = lambda prompt, response_format=None: '{"verdict": "REJECTED", "credibility_score": 45, "public_interest_score": 30, "reasoning": "Insincere.", "red_flags": [], "recommended_followup": "None", "estimated_impact": "LOW"}'
    
    contract.submit_leak(
        leak_id=leak_id,
        title="Spam Leak",
        category="environmental",
        target_entity="Apex Corp",
        summary="Spam content.",
        evidence_urls='[]',
        document_hash="b" * 64,
        submitter_pubkey=pubkey
    )
    
    # Advance blockchain timestamp by 8 days (8 * 86400 seconds)
    setup_gl_state.message.timestamp += 8 * 86400
    
    setup_gl_state.message.value = 5 * 10**18
    setup_gl_state.message.sender_address = Address("0x2222222222222222222222222222222222222222")
    
    with pytest.raises(Exception, match="Appeal period expired"):
        contract.appeal_rejection(leak_id, '[]')
