from fastapi.testclient import TestClient
from main import app, seed_demo_data
import pytest

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_stores():
    seed_demo_data()

def test_register_and_login_full_flow():
    # 1. Register Farmer
    response = client.post("/auth/register", json={
        "name": "Test Farmer",
        "phone_or_email": "+919876500001",
        "password_or_otp": "password123",
        "role": "farmer",
        "location": "Thanjavur, Tamil Nadu",
        "preferred_language": "ta"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["phone"] == "+919876500001"
    assert data["user"]["preferred_language"] == "ta"

    # 2. Login Farmer
    response = client.post("/auth/login", json={
        "phone_or_email": "+919876500001",
        "password_or_otp": "password123",
        "role": "farmer"
    })
    assert response.status_code == 200
    token_data = response.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    # 3. Create Lot (Farmer)
    response = client.post("/lots", json={
        "crop": "Paddy (Ponni)",
        "quantity": 2000.0,
        "quality": "Grade A",
        "location": "Thanjavur Mandi",
        "price_per_kg": 26.5
    }, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    lot_data = response.json()
    assert lot_data["crop"] == "Paddy (Ponni)"
    lot_id = lot_data["lot_id"]

    # 4. Register Buyer
    response = client.post("/auth/register", json={
        "name": "Chennai Millers Ltd",
        "phone_or_email": "+919876500002",
        "password_or_otp": "password123",
        "role": "buyer",
        "location": "Chennai, Tamil Nadu",
        "preferred_language": "ta"
    })
    assert response.status_code == 200
    buyer_token = response.json()["access_token"]

    # 5. Purchase Lot (Buyer)
    response = client.post("/transactions", json={
        "lot_id": lot_id
    }, headers={"Authorization": f"Bearer {buyer_token}"})
    assert response.status_code == 200
    tx_data = response.json()
    assert tx_data["status"] == "in_transit"
    assert tx_data["payment_status"] == "held"
