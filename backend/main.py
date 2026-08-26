from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import datetime

import models, schemas
from database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AgriConnect API")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/transactions/", response_model=schemas.TransactionResponse)
def create_transaction(transaction: schemas.TransactionCreate, db: Session = Depends(get_db)):
    db_transaction = models.Transaction(**transaction.dict())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@app.post("/transactions/{id}/reject", response_model=schemas.DisputeResponse)
def reject_transaction(id: int, request: schemas.RejectRequest, db: Session = Depends(get_db)):
    tx = db.query(models.Transaction).filter(models.Transaction.id == id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    if tx.status not in [models.TransactionStatus.delivered, models.TransactionStatus.disputed]:
        raise HTTPException(status_code=400, detail="Transaction must be delivered to be rejected")
    
    if request.rejected_quantity_kg > tx.quantity_kg:
        raise HTTPException(status_code=400, detail="Cannot reject more than total quantity")
    
    if request.reason in [models.DisputeReason.quality_mismatch, models.DisputeReason.spoilage] and not request.photo_urls:
        raise HTTPException(status_code=400, detail="Photos are required for quality/spoilage disputes")
        
    tx.status = models.TransactionStatus.disputed
    
    # Store photos as comma separated string for simple SQLite demo
    photo_urls_str = ",".join(request.photo_urls)
    
    dispute = models.Dispute(
        transaction_id=tx.id,
        raised_by="buyer",
        reason=request.reason,
        description=request.description,
        rejected_quantity_kg=request.rejected_quantity_kg,
        photo_urls=photo_urls_str,
        status=models.DisputeStatus.open
    )
    db.add(dispute)
    db.commit()
    db.refresh(dispute)
    
    # Mocking Notification here:
    # print(f"Mock Notification: SMS/Email sent to farmer in preferred language: {tx.farmer.preferred_language}")
    
    return dispute

@app.get("/transactions/{id}/dispute", response_model=schemas.DisputeResponse)
def get_dispute(id: int, db: Session = Depends(get_db)):
    dispute = db.query(models.Dispute).filter(models.Dispute.transaction_id == id).order_by(models.Dispute.created_at.desc()).first()
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")
    return dispute

@app.post("/transactions/{id}/dispute/resolve")
def resolve_dispute(id: int, request: schemas.ResolveRequest, db: Session = Depends(get_db)):
    dispute = db.query(models.Dispute).filter(models.Dispute.transaction_id == id).order_by(models.Dispute.created_at.desc()).first()
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")
    
    if dispute.status == models.DisputeStatus.resolved:
        raise HTTPException(status_code=400, detail="Dispute already resolved")
        
    dispute.status = models.DisputeStatus.resolved
    dispute.resolution = request.resolution
    dispute.resolved_at = datetime.datetime.utcnow()
    
    tx = db.query(models.Transaction).filter(models.Transaction.id == dispute.transaction_id).first()
    tx.status = models.TransactionStatus.paid # Move to paid state after resolution
    
    db.commit()
    
    return {"message": "Dispute resolved successfully", "resolution": request.resolution}

@app.post("/transactions/{id}/dispute/timeout-check")
def timeout_check(id: int, db: Session = Depends(get_db)):
    # Background job simulation
    dispute = db.query(models.Dispute).filter(models.Dispute.transaction_id == id).order_by(models.Dispute.created_at.desc()).first()
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")
    
    if dispute.status == models.DisputeStatus.open:
        time_elapsed = datetime.datetime.utcnow() - dispute.created_at
        if time_elapsed.total_seconds() > 48 * 3600:
            dispute.status = models.DisputeStatus.under_review # Auto-escalate to admin review
            db.commit()
            return {"message": "Dispute escalated to admin review"}
            
    return {"message": "No action needed"}

@app.post("/uploads/dispute-evidence")
def upload_evidence():
    # Mocking file upload since SQLite is just a local DB for this demo
    # In a real app we'd use UploadFile and save to S3/GCS
    import uuid
    fake_url = f"https://storage.agriconnect.com/evidence/{uuid.uuid4()}.jpg"
    return {"url": fake_url}
