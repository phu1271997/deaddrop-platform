import pytest
import json
from genlayer import Address

def test_submit_leak_success(contract, setup_gl_state):
    """Verify that a valid leak is submitted, verified, and mapped correctly."""
    leak_id = "a" * 64
    doc_hash = "b" * 64
    pubkey = "c" * 64
    
    contract.submit_leak(
        leak_id=leak_id,
        title="PFAS dumping coordinates",
        category="environmental",
        target_entity="Apex Corp",
        summary="Apex dumped waste in maritime zones.",
        evidence_urls='["https://evidence.io/url"]',
        document_hash=doc_hash,
        submitter_pubkey=pubkey
    )
    
    # Assert counts
    assert contract.total_leaks_submitted == 1
    assert contract.total_leaks_verified == 1
    assert contract.total_leaks_rejected == 0
    
    # Assert state
    leak_str = contract.get_leak(leak_id)
    assert leak_str != ""
    leak_data = json.loads(leak_str)
    assert leak_data["status"] == "VERIFIED"
    assert leak_data["credibility_score"] == 85
    assert leak_data["submitter_pubkey"] == pubkey
    
    # Assert reputation boost
    assert contract.get_submitter_reputation(pubkey) == 150
    
    # Assert document hash mapping
    docs_str = contract.verify_document_hash(doc_hash)
    docs_list = json.loads(docs_str)
    assert len(docs_list) == 1
    assert docs_list[0]["leak_id"] == leak_id

def test_submit_leak_rate_limiting(contract, setup_gl_state):
    """Verify that submitter cannot submit more than once per hour."""
    leak_id_1 = "a" * 64
    leak_id_2 = "d" * 64
    pubkey = "c" * 64
    
    # First submission
    contract.submit_leak(
        leak_id=leak_id_1,
        title="First Title",
        category="environmental",
        target_entity="Apex Corp",
        summary="Apex dumped waste.",
        evidence_urls='[]',
        document_hash="b" * 64,
        submitter_pubkey=pubkey
    )
    
    # Try second submission immediately (should raise UserError)
    with pytest.raises(Exception, match="Rate limit"):
        contract.submit_leak(
            leak_id=leak_id_2,
            title="Second Title",
            category="environmental",
            target_entity="Apex Corp",
            summary="Apex dumped waste again.",
            evidence_urls='[]',
            document_hash="e" * 64,
            submitter_pubkey=pubkey
        )
        
    # Advance blockchain time by 3601 seconds
    setup_gl_state.message.timestamp += 3601
    
    # Second submission should now succeed
    contract.submit_leak(
        leak_id=leak_id_2,
        title="Second Title",
        category="environmental",
        target_entity="Apex Corp",
        summary="Apex dumped waste again.",
        evidence_urls='[]',
        document_hash="e" * 64,
        submitter_pubkey=pubkey
    )
    assert contract.total_leaks_submitted == 2

def test_submit_leak_invalid_params(contract, setup_gl_state):
    """Verify parameters validation constraints."""
    pubkey = "c" * 64
    
    # Invalid leak ID length
    with pytest.raises(Exception, match="leak_id must be SHA-256 hex"):
        contract.submit_leak(
            leak_id="short_id",
            title="Title",
            category="environmental",
            target_entity="Apex",
            summary="Apex dumped waste.",
            evidence_urls='[]',
            document_hash="b" * 64,
            submitter_pubkey=pubkey
        )
        
    # Empty title
    with pytest.raises(Exception, match="Title cannot be empty"):
        contract.submit_leak(
            leak_id="a" * 64,
            title=" ",
            category="environmental",
            target_entity="Apex",
            summary="Apex dumped waste.",
            evidence_urls='[]',
            document_hash="b" * 64,
            submitter_pubkey=pubkey
        )

    # Empty target
    with pytest.raises(Exception, match="Target entity cannot be empty"):
        contract.submit_leak(
            leak_id="a" * 64,
            title="Title",
            category="environmental",
            target_entity="",
            summary="Apex dumped waste.",
            evidence_urls='[]',
            document_hash="b" * 64,
            submitter_pubkey=pubkey
        )

    # Invalid category
    with pytest.raises(Exception, match="Invalid category"):
        contract.submit_leak(
            leak_id="a" * 64,
            title="Title",
            category="invalid_category",
            target_entity="Apex",
            summary="Apex dumped waste.",
            evidence_urls='[]',
            document_hash="b" * 64,
            submitter_pubkey=pubkey
        )

def test_submit_leak_duplicate_id(contract, setup_gl_state):
    """Verify that submitting duplicate leak IDs is rejected."""
    leak_id = "a" * 64
    pubkey = "c" * 64
    
    contract.submit_leak(
        leak_id=leak_id,
        title="First Title",
        category="environmental",
        target_entity="Apex Corp",
        summary="Apex dumped waste.",
        evidence_urls='[]',
        document_hash="b" * 64,
        submitter_pubkey=pubkey
    )
    
    # Second submission with duplicate ID
    setup_gl_state.message.timestamp += 3601
    with pytest.raises(Exception, match="Leak ID already exists"):
        contract.submit_leak(
            leak_id=leak_id,
            title="Duplicate Title",
            category="environmental",
            target_entity="Apex Corp",
            summary="Apex dumped waste.",
            evidence_urls='[]',
            document_hash="e" * 64,
            submitter_pubkey=pubkey
        )
