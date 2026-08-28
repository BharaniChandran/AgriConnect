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
        "location": "Pimpalgaon, Nashik, Maharashtra",
        "preferred_language": "mr"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["phone"] == "+919876500001"
    assert data["user"]["preferred_language"] == "mr"

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
        "crop": "Tomato (Roma)",
        "quantity": 2000.0,
        "quality": "Grade A",
        "location": "Pimpalgaon APMC, Nashik",
        "price_per_kg": 28.5
    }, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    lot_data = response.json()
    assert lot_data["crop"] == "Tomato (Roma)"
    lot_id = lot_data["lot_id"]

    # 4. Register Buyer
    response = client.post("/auth/register", json={
        "name": "Mumbai Fresh Millers Ltd",
        "phone_or_email": "+919876500002",
        "password_or_otp": "password123",
        "role": "buyer",
        "location": "Vashi APMC, Navi Mumbai",
        "preferred_language": "mr"
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

def test_email_registration_and_login():
    # Register with email
    reg_res = client.post("/auth/register", json={
        "name": "Anand Organic Exports",
        "phone_or_email": "anand.trader@agriconnect.in",
        "password_or_otp": "SecurePass2026!",
        "role": "buyer",
        "location": "Pune APMC, Maharashtra",
        "preferred_language": "en"
    })
    assert reg_res.status_code == 200
    assert "access_token" in reg_res.json()
    assert reg_res.json()["user"]["email"] == "anand.trader@agriconnect.in"

    # Login with email
    login_res = client.post("/auth/login", json={
        "phone_or_email": "anand.trader@agriconnect.in",
        "password_or_otp": "SecurePass2026!"
    })
    assert login_res.status_code == 200
    assert login_res.json()["user"]["role"] == "buyer"

def test_login_invalid_password():
    # Register user
    client.post("/auth/register", json={
        "name": "Kailas Patil",
        "phone_or_email": "+919833001122",
        "password_or_otp": "MySecretPass999",
        "role": "farmer"
    })
    
    # Try invalid password
    bad_login = client.post("/auth/login", json={
        "phone_or_email": "+919833001122",
        "password_or_otp": "TotallyWrongPassword"
    })
    assert bad_login.status_code == 401
    assert "Invalid" in bad_login.json()["detail"]

def test_login_unregistered_user():
    bad_login = client.post("/auth/login", json={
        "phone_or_email": "+919999000099",
        "password_or_otp": "AnyPassword"
    })
    assert bad_login.status_code == 401
    assert "Account not found" in bad_login.json()["detail"]

def test_demo_quick_logins():
    # Farmer quick login
    f_res = client.post("/auth/login", json={
        "phone_or_email": "+919822123456",
        "password_or_otp": "password123"
    })
    assert f_res.status_code == 200
    assert f_res.json()["user"]["role"] == "farmer"

    # Buyer quick login
    b_res = client.post("/auth/login", json={
        "phone_or_email": "+919820012345",
        "password_or_otp": "password123"
    })
    assert b_res.status_code == 200
    assert b_res.json()["user"]["role"] == "buyer"

    # Admin quick login
    a_res = client.post("/auth/login", json={
        "phone_or_email": "+919999999999",
        "password_or_otp": "admin123"
    })
    assert a_res.status_code == 200
    assert a_res.json()["user"]["role"] == "admin"

def test_session_validation_me():
    # Login as demo farmer
    f_res = client.post("/auth/login", json={
        "phone_or_email": "+919822123456",
        "password_or_otp": "password123"
    })
    token = f_res.json()["access_token"]

    # Validate /auth/me with valid token
    me_res = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["phone"] == "+919822123456"

    # Validate /auth/me with invalid token
    bad_me = client.get("/auth/me", headers={"Authorization": "Bearer invalid_gibberish_token"})
    assert bad_me.status_code == 401
