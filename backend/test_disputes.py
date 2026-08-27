import pytest
from fastapi.testclient import TestClient
from main import app, STORE_TRANSACTIONS, STORE_DISPUTES, STORE_USERS, seed_demo_data
from auth import create_access_token

client = TestClient(app)

buyer_token = create_access_token(data={
    "sub": "buyer-202",
    "role": "buyer",
    "name": "Green Grocers Ltd.",
    "phone": "+919884012345",
    "preferred_language": "en",
    "is_admin": False
})
buyer_headers = {"Authorization": f"Bearer {buyer_token}"}

admin_token = create_access_token(data={
    "sub": "admin-999",
    "role": "admin",
    "name": "Platform Admin",
    "phone": "+919999999999",
    "preferred_language": "en",
    "is_admin": True
})
admin_headers = {"Authorization": f"Bearer {admin_token}"}

@pytest.fixture(autouse=True)
def reset_stores():
    seed_demo_data()

def test_buyer_reject_lot_success():
    """Test standard rejection flow creating a dispute."""
    response = client.post("/transactions/1/reject", json={
        "reason": "quality_mismatch",
        "description": "Produce arrived bruised and rotten.",
        "rejected_quantity_kg": 250.0,
        "photo_urls": ["https://storage.agriconnect.in/evidence/photo1.jpg"]
    }, headers=buyer_headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["transaction_id"] == 1
    assert data["status"] == "open"
    assert data["rejected_quantity_kg"] == 250.0

    # Verify transaction status is now 'disputed'
    tx = STORE_TRANSACTIONS[1]
    assert tx["status"] == "disputed"
    assert tx["payment_status"] == "held" # Payment is held

def test_buyer_reject_lot_missing_photo_fails():
    """Edge case: quality_mismatch requires at least one photo."""
    response = client.post("/transactions/1/reject", json={
        "reason": "quality_mismatch",
        "description": "Rotten tomatoes",
        "rejected_quantity_kg": 200.0,
        "photo_urls": [] # Empty photos list
    }, headers=buyer_headers)
    
    assert response.status_code == 400
    assert "Evidence photos are mandatory" in response.json()["detail"]

def test_buyer_reject_lot_excess_quantity_fails():
    """Edge case: Cannot reject more quantity than delivered."""
    total_qty = STORE_TRANSACTIONS[1]["quantity"]
    response = client.post("/transactions/1/reject", json={
        "reason": "wrong_item",
        "description": "Excess quantity rejected",
        "rejected_quantity_kg": total_qty + 500.0,
        "photo_urls": []
    }, headers=buyer_headers)
    
    assert response.status_code == 400
    assert "exceeds total delivered quantity" in response.json()["detail"]

def test_admin_resolve_partial_refund():
    """Admin resolves dispute with partial refund and remainder payout."""
    # First reject
    client.post("/transactions/1/reject", json={
        "reason": "quantity_mismatch",
        "description": "Short by 250kg",
        "rejected_quantity_kg": 250.0,
        "photo_urls": []
    }, headers=buyer_headers)

    # Admin resolution
    response = client.post("/transactions/1/dispute/resolve", json={
        "resolution": "partial_refund"
    }, headers=admin_headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["resolution"] == "partial_refund"
    assert data["transaction_status"] == "paid"
    assert data["payment_status"] == "refunded_partial"

def test_admin_resolve_full_refund():
    """Admin resolves dispute with full refund."""
    client.post("/transactions/1/reject", json={
        "reason": "wrong_item",
        "description": "Completely wrong batch",
        "rejected_quantity_kg": 1250.0,
        "photo_urls": []
    }, headers=buyer_headers)

    response = client.post("/transactions/1/dispute/resolve", json={
        "resolution": "full_refund"
    }, headers=admin_headers)
    
    assert response.status_code == 200
    data = response.json()
    assert data["resolution"] == "full_refund"
    assert data["payment_status"] == "refunded_full"

def test_dispute_timeout_escalation():
    """Test timeout check endpoint."""
    client.post("/transactions/1/reject", json={
        "reason": "other",
        "description": "Testing escalation",
        "rejected_quantity_kg": 100.0,
        "photo_urls": []
    }, headers=buyer_headers)

    response = client.post("/transactions/1/dispute/timeout-check", headers=admin_headers)
    assert response.status_code == 200
