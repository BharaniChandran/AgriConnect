from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Enum, Numeric, ForeignKey, DateTime, Text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone
import enum

# --- Database Setup ---
SQLALCHEMY_DATABASE_URL = "sqlite:///./agriconnect.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- Models ---
class UserType(str, enum.Enum):
    farmer = "farmer"
    buyer = "buyer"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    user_type = Column(Enum(UserType))
    name = Column(String)
    preferred_language = Column(String, default="en") # Added for i18n

class TransactionStatus(str, enum.Enum):
    offered = "offered"
    accepted = "accepted"
    in_transit = "in_transit"
    delivered = "delivered"
    paid = "paid"
    disputed = "disputed"
    resolved_partial_refund = "resolved_partial_refund"
    resolved_full_refund = "resolved_full_refund"
    resolved_buyer_accepts = "resolved_buyer_accepts"
    resolved_farmer_resale = "resolved_farmer_resale"

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id"))
    buyer_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Numeric)
    status = Column(Enum(TransactionStatus), default=TransactionStatus.offered)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class DisputeReason(str, enum.Enum):
    quality_mismatch = "quality_mismatch"
    quantity_mismatch = "quantity_mismatch"
    spoilage = "spoilage"
    wrong_item = "wrong_item"
    other = "other"

class DisputeStatus(str, enum.Enum):
    open = "open"
    under_review = "under_review"
    resolved = "resolved"

class DisputeResolution(str, enum.Enum):
    partial_refund = "partial_refund"
    full_refund = "full_refund"
    buyer_accepts = "buyer_accepts"
    farmer_resale = "farmer_resale"

class Dispute(Base):
    __tablename__ = "disputes"
    dispute_id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"))
    raised_by = Column(Enum(UserType))
    reason = Column(Enum(DisputeReason))
    description = Column(Text)
    rejected_quantity_kg = Column(Numeric)
    photo_urls = Column(Text) # Comma separated for simplicity in sqlite
    status = Column(Enum(DisputeStatus), default=DisputeStatus.open)
    resolution = Column(Enum(DisputeResolution), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    resolved_at = Column(DateTime, nullable=True)

Base.metadata.create_all(bind=engine)

# --- FastAPI App ---
app = FastAPI(title="AgriConnect API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Mock Payment Gateway Logic ---
def mock_payment_gateway_hold(amount: float):
    print(f"Holding payment of {amount}...")

def mock_payment_gateway_refund(amount: float):
    print(f"Refunding {amount} to buyer...")

def mock_payment_gateway_release(amount: float):
    print(f"Releasing {amount} to farmer...")

# --- Pydantic Schemas ---
class RejectRequest(BaseModel):
    reason: DisputeReason
    description: str
    rejected_quantity_kg: float
    photo_urls: List[str]

class ResolveRequest(BaseModel):
    resolution: DisputeResolution

# --- Endpoints ---
@app.get("/")
def root():
    return {"status": "ok"}

@app.post("/users/{user_id}/language")
def update_language(user_id: int, language: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.preferred_language = language
    db.commit()
    return {"message": "Language updated", "preferred_language": language}

@app.post("/transactions/{id}/reject")
def reject_transaction(id: int, req: RejectRequest, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(Transaction.id == id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if tx.status != TransactionStatus.delivered:
        raise HTTPException(status_code=400, detail="Only delivered transactions can be rejected")
    
    if req.reason in [DisputeReason.quality_mismatch, DisputeReason.spoilage] and not req.photo_urls:
        raise HTTPException(status_code=400, detail="Photos are required for quality issues or spoilage")
    
    # State machine transition
    tx.status = TransactionStatus.disputed
    
    # Create dispute
    dispute = Dispute(
        transaction_id=tx.id,
        raised_by=UserType.buyer, # Hardcoded for buyer path per task
        reason=req.reason,
        description=req.description,
        rejected_quantity_kg=req.rejected_quantity_kg,
        photo_urls=",".join(req.photo_urls),
        status=DisputeStatus.open
    )
    db.add(dispute)
    db.commit()
    
    # Notify farmer logic here...
    
    return {"message": "Transaction rejected, dispute opened"}

@app.get("/transactions/{id}/dispute")
def get_dispute(id: int, db: Session = Depends(get_db)):
    dispute = db.query(Dispute).filter(Dispute.transaction_id == id).first()
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")
    return {
        "dispute_id": dispute.dispute_id,
        "transaction_id": dispute.transaction_id,
        "reason": dispute.reason,
        "description": dispute.description,
        "rejected_quantity_kg": dispute.rejected_quantity_kg,
        "photo_urls": dispute.photo_urls.split(",") if dispute.photo_urls else [],
        "status": dispute.status,
        "resolution": dispute.resolution
    }

@app.post("/transactions/{id}/dispute/resolve")
def resolve_dispute(id: int, req: ResolveRequest, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(Transaction.id == id).first()
    dispute = db.query(Dispute).filter(Dispute.transaction_id == id).first()
    if not tx or not dispute:
        raise HTTPException(status_code=404, detail="Transaction or dispute not found")
    if tx.status != TransactionStatus.disputed:
        raise HTTPException(status_code=400, detail="Transaction is not disputed")
        
    dispute.resolution = req.resolution
    dispute.status = DisputeStatus.resolved
    dispute.resolved_at = datetime.now(timezone.utc)
    
    # Update transaction status and handle payments
    if req.resolution == DisputeResolution.full_refund:
        tx.status = TransactionStatus.resolved_full_refund
        mock_payment_gateway_refund(float(tx.amount))
    elif req.resolution == DisputeResolution.partial_refund:
        tx.status = TransactionStatus.resolved_partial_refund
        # Mocking partial refund calculation (e.g. 50% for simplicity, should be based on qty)
        mock_payment_gateway_refund(float(tx.amount) * 0.5)
        mock_payment_gateway_release(float(tx.amount) * 0.5)
    elif req.resolution in [DisputeResolution.buyer_accepts, DisputeResolution.farmer_resale]:
        tx.status = getattr(TransactionStatus, f"resolved_{req.resolution.value}")
        mock_payment_gateway_release(float(tx.amount))
        
    db.commit()
    return {"message": "Dispute resolved", "resolution": req.resolution}
    
@app.post("/uploads/dispute-evidence")
def upload_evidence(file: UploadFile = File(...)):
    # Mocking file upload
    if not file.content_type.startswith("image/"):
         raise HTTPException(status_code=400, detail="File must be an image")
    
    return {"url": f"https://mock-s3-bucket.com/uploads/{file.filename}"}
