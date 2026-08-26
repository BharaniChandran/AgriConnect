import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from main import app, get_db
from models import Base, TransactionStatus, DisputeReason, DisputeStatus, ResolutionType, Farmer, Buyer, Transaction
from database import SQLALCHEMY_DATABASE_URL

SQLALCHEMY_DATABASE_URL_TEST = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL_TEST, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    # Create test data
    farmer = Farmer(name="Test Farmer")
    buyer = Buyer(name="Test Buyer")
    db.add_all([farmer, buyer])
    db.commit()
    db.refresh(farmer)
    db.refresh(buyer)
    
    # Create transaction
    tx = Transaction(
        farmer_id=farmer.id,
        buyer_id=buyer.id,
        crop_name="Tomato",
        quantity_kg=1000,
        price_per_kg=20,
        status=TransactionStatus.delivered
    )
    db.add(tx)
    db.commit()
    db.close()
    
    yield

def test_reject_transaction_creates_dispute():
    # Attempt to reject with photos
    response = client.post("/transactions/1/reject", json={
        "reason": DisputeReason.spoilage,
        "description": "Some tomatoes are spoiled",
        "rejected_quantity_kg": 200,
        "photo_urls": ["http://test.com/photo1.jpg"]
    })
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == DisputeStatus.open
    assert data["rejected_quantity_kg"] == 200
    assert data["photo_urls"] == "http://test.com/photo1.jpg"

def test_reject_without_photos_fails():
    response = client.post("/transactions/1/reject", json={
        "reason": DisputeReason.quality_mismatch,
        "description": "Bad quality",
        "rejected_quantity_kg": 100,
        "photo_urls": []
    })
    
    assert response.status_code == 400
    assert "Photos are required" in response.json()["detail"]

def test_resolve_dispute():
    # 1. Reject it
    client.post("/transactions/1/reject", json={
        "reason": DisputeReason.quantity_mismatch,
        "description": "Short by 50kg",
        "rejected_quantity_kg": 50,
        "photo_urls": []
    })
    
    # 2. Resolve it
    response = client.post("/transactions/1/dispute/resolve", json={
        "resolution": ResolutionType.partial_refund
    })
    
    assert response.status_code == 200
    assert response.json()["resolution"] == ResolutionType.partial_refund
    
    # 3. Check if transaction is paid
    db = TestingSessionLocal()
    tx = db.query(Transaction).filter(Transaction.id == 1).first()
    assert tx.status == TransactionStatus.paid
    db.close()
