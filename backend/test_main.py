from fastapi.testclient import TestClient
import pytest
from main import app, seed_demo_data

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_stores():
    seed_demo_data()

def test_root_status():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"
    assert response.json()["pilot_region"] == "Maharashtra"
    assert "mr" in response.json()["supported_languages"]

def test_register_and_login_farmer():
    reg_res = client.post("/auth/register", json={
        "phone_or_email": "+919822999888",
        "password_or_otp": "pass1234",
        "role": "farmer",
        "name": "Kashinath (Farmer)",
        "location": "Nashik, Maharashtra",
        "preferred_language": "mr"
    })
    assert reg_res.status_code == 200
    data = reg_res.json()
    assert "access_token" in data
    assert data["user"]["role"] == "farmer"
    assert data["user"]["preferred_language"] == "mr"

def test_create_and_list_crops():
    # Register & get token
    reg_res = client.post("/auth/register", json={
        "phone_or_email": "+919822111222",
        "password_or_otp": "pass1234",
        "role": "farmer",
        "name": "Sanjay Patil",
        "location": "Pimpalgaon APMC, Nashik",
        "preferred_language": "mr"
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer ${token}"}

    lot_res = client.post("/lots", json={
        "crop": "Tomato",
        "quantity": 500.0,
        "quality": "Grade A",
        "location": "Pimpalgaon APMC, Nashik",
        "price_per_kg": 28.5
    }, headers=headers)
    assert lot_res.status_code == 200
    assert lot_res.json()["crop"] == "Tomato"

    lots_list = client.get("/lots")
    assert lots_list.status_code == 200
    assert len(lots_list.json()) >= 1

def test_live_market_prices():
    res = client.get("/market-prices")
    assert res.status_code == 200
    prices = res.json()
    assert len(prices) > 0
    assert any(p["market"].startswith("Nashik") or p["market"].startswith("Mumbai") or p["market"].startswith("Pune") for p in prices)

def test_payment_order_creation_and_verification():
    # Create order
    order_res = client.post("/payments/create-order", json={"transaction_id": 1})
    assert order_res.status_code == 200
    order_data = order_res.json()
    assert "id" in order_data
    assert order_data["currency"] == "INR"

    # Verify payment
    verify_res = client.post("/payments/verify", json={
        "transaction_id": 1,
        "razorpay_order_id": order_data["id"],
        "razorpay_payment_id": "pay_mock_12345",
        "razorpay_signature": "mock_signature"
    })
    assert verify_res.status_code == 200
    assert verify_res.json()["payment_status"] == "held"
