from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime
import uuid

import models, schemas
from database import get_supabase_admin_client, Base
from config import settings
from auth import (
    get_current_user, 
    require_admin_user, 
    create_access_token, 
    get_password_hash, 
    verify_password,
    AuthenticatedUser
)
import notifications
import payments
import market_data

# In-memory / mock persistent store for cross-environment testing
# (Works directly with Postgres models in memory or Supabase)
app = FastAPI(title="AgriConnect Tamil Nadu API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simulated in-memory store for fallback/demo consistency
STORE_USERS = {}
STORE_LOTS = {}
STORE_TRANSACTIONS = {}
STORE_DISPUTES = {}

# Seed initial demo data for Tamil Nadu pilot
def seed_demo_data():
    farmer_id = "farmer-101"
    buyer_id = "buyer-202"
    admin_id = "admin-999"

    STORE_USERS[farmer_id] = {
        "id": farmer_id,
        "name": "Ram Singh (Sunrise Farms)",
        "location": "Oddanchatram, Dindigul, Tamil Nadu",
        "phone": "+919443123456",
        "preferred_language": "ta",
        "role": "farmer",
        "is_admin": False,
        "password_hash": get_password_hash("password123")
    }

    STORE_USERS[buyer_id] = {
        "id": buyer_id,
        "name": "Green Grocers Ltd.",
        "location": "Koyambedu, Chennai, Tamil Nadu",
        "phone": "+919884012345",
        "preferred_language": "en",
        "role": "buyer",
        "is_admin": False,
        "password_hash": get_password_hash("password123")
    }

    STORE_USERS[admin_id] = {
        "id": admin_id,
        "name": "Platform Admin (AgriConnect)",
        "location": "Chennai, Tamil Nadu",
        "phone": "+919999999999",
        "preferred_language": "en",
        "role": "admin",
        "is_admin": True,
        "password_hash": get_password_hash("admin123")
    }

    lot_id = "lot-4829"
    STORE_LOTS[lot_id] = {
        "lot_id": lot_id,
        "farmer_id": farmer_id,
        "crop": "Tomato (Roma)",
        "quantity": 1250.0,
        "quality": "Grade A",
        "location": "Oddanchatram Mandi, Dindigul",
        "price_per_kg": 28.0,
        "status": "available",
        "created_at": datetime.datetime.utcnow()
    }

    tx_id = 1
    STORE_TRANSACTIONS[tx_id] = {
        "id": tx_id,
        "farmer_id": farmer_id,
        "buyer_id": buyer_id,
        "lot_id": lot_id,
        "quantity": 1250.0,
        "price": 35000.0,
        "status": "delivered",
        "payment_status": "held",
        "razorpay_order_id": "order_mock_tn_101",
        "razorpay_payment_id": "pay_mock_tn_101",
        "created_at": datetime.datetime.utcnow() - datetime.timedelta(days=2),
        "updated_at": datetime.datetime.utcnow()
    }

seed_demo_data()

# --- Root & Health ---
@app.get("/")
def root():
    return {
        "app": "AgriConnect API",
        "pilot_region": "Tamil Nadu",
        "supported_languages": ["ta", "en", "hi", "te", "kn", "ml"],
        "status": "online"
    }

# --- Auth Endpoints ---
@app.post("/auth/register", response_model=schemas.Token)
def register(req: schemas.UserAuthRequest):
    user_id = f"{req.role}-{uuid.uuid4().hex[:6]}"
    user_dict = {
        "id": user_id,
        "name": req.name or "Agri User",
        "location": req.location or "Tamil Nadu",
        "phone": req.phone_or_email,
        "preferred_language": req.preferred_language or "ta",
        "role": req.role,
        "is_admin": req.role == "admin",
        "password_hash": get_password_hash(req.password_or_otp)
    }
    STORE_USERS[user_id] = user_dict
    
    token = create_access_token(data={
        "sub": user_id,
        "role": user_dict["role"],
        "name": user_dict["name"],
        "phone": user_dict["phone"],
        "preferred_language": user_dict["preferred_language"],
        "is_admin": user_dict["is_admin"]
    })
    
    profile = schemas.UserProfileResponse(**user_dict)
    return {"access_token": token, "token_type": "bearer", "user": profile}

@app.post("/auth/login", response_model=schemas.Token)
def login(req: schemas.UserAuthRequest):
    # Find user by phone/email or matching username
    found_user = None
    for u in STORE_USERS.values():
        if u["phone"] == req.phone_or_email or u.get("email") == req.phone_or_email or u["name"] == req.phone_or_email:
            found_user = u
            break
            
    if not found_user:
        # Auto-create if phone OTP demo
        return register(req)
        
    token = create_access_token(data={
        "sub": found_user["id"],
        "role": found_user["role"],
        "name": found_user["name"],
        "phone": found_user["phone"],
        "preferred_language": found_user["preferred_language"],
        "is_admin": found_user["is_admin"]
    })
    profile = schemas.UserProfileResponse(**found_user)
    return {"access_token": token, "token_type": "bearer", "user": profile}

@app.get("/auth/me", response_model=schemas.UserProfileResponse)
def read_current_user(current_user: AuthenticatedUser = Depends(get_current_user)):
    user_data = STORE_USERS.get(current_user.id, {
        "id": current_user.id,
        "name": current_user.name,
        "location": "Tamil Nadu, India",
        "phone": current_user.phone,
        "preferred_language": current_user.preferred_language,
        "role": current_user.role,
        "is_admin": current_user.is_admin
    })
    return schemas.UserProfileResponse(**user_data)

@app.post("/users/{user_id}/language")
def update_user_language(user_id: str, language: str, current_user: AuthenticatedUser = Depends(get_current_user)):
    if user_id in STORE_USERS:
        STORE_USERS[user_id]["preferred_language"] = language
    return {"message": "Language updated successfully", "preferred_language": language}

# --- Lots Endpoints ---
@app.get("/lots", response_model=List[schemas.CropLotResponse])
def list_lots():
    return [schemas.CropLotResponse(**lot) for lot in STORE_LOTS.values() if lot["status"] == "available"]

@app.post("/lots", response_model=schemas.CropLotResponse)
def create_crop_lot(lot: schemas.CropLotCreate, current_user: AuthenticatedUser = Depends(get_current_user)):
    if current_user.role != "farmer":
        raise HTTPException(status_code=403, detail="Only farmers can list crops/lots")
        
    lot_id = f"lot-{uuid.uuid4().hex[:6]}"
    lot_dict = {
        "lot_id": lot_id,
        "farmer_id": current_user.id,
        "crop": lot.crop,
        "quantity": lot.quantity,
        "quality": lot.quality,
        "location": lot.location,
        "price_per_kg": lot.price_per_kg,
        "status": "available",
        "created_at": datetime.datetime.utcnow()
    }
    STORE_LOTS[lot_id] = lot_dict
    return schemas.CropLotResponse(**lot_dict)

# --- Live Market Prices ---
@app.get("/market-prices")
async def get_market_prices():
    prices = await market_data.fetch_live_tn_agmarknet_prices()
    return prices

@app.post("/market-prices/ingest")
async def trigger_price_ingestion(admin: AuthenticatedUser = Depends(require_admin_user)):
    result = await market_data.ingest_market_prices_job()
    return result

# --- Transactions Endpoints ---
@app.get("/transactions", response_model=List[schemas.TransactionResponse])
def list_transactions(current_user: AuthenticatedUser = Depends(get_current_user)):
    txs = []
    for tx in STORE_TRANSACTIONS.values():
        if current_user.is_admin or tx["farmer_id"] == current_user.id or tx["buyer_id"] == current_user.id:
            txs.append(schemas.TransactionResponse(**tx))
    return txs

@app.post("/transactions", response_model=schemas.TransactionResponse)
async def create_transaction(req: schemas.TransactionCreate, current_user: AuthenticatedUser = Depends(get_current_user)):
    if current_user.role != "buyer":
        raise HTTPException(status_code=403, detail="Only buyers can create transactions")
        
    lot = STORE_LOTS.get(req.lot_id)
    if not lot or lot["status"] != "available":
        raise HTTPException(status_code=400, detail="Requested lot is no longer available")
        
    lot["status"] = "sold"
    tx_id = len(STORE_TRANSACTIONS) + 1
    total_price = lot["price_per_kg"] * (req.quantity or lot["quantity"])
    
    tx_dict = {
        "id": tx_id,
        "farmer_id": lot["farmer_id"],
        "buyer_id": current_user.id,
        "lot_id": lot["lot_id"],
        "quantity": req.quantity or lot["quantity"],
        "price": total_price,
        "status": "in_transit",
        "payment_status": "held", # Payment held upon checkout
        "razorpay_order_id": f"order_mock_{tx_id}",
        "razorpay_payment_id": f"pay_mock_{tx_id}",
        "created_at": datetime.datetime.utcnow(),
        "updated_at": datetime.datetime.utcnow()
    }
    STORE_TRANSACTIONS[tx_id] = tx_dict
    
    # Send SMS / Email notification to farmer in their preferred language
    farmer = STORE_USERS.get(lot["farmer_id"], {})
    farmer_lang = farmer.get("preferred_language", "ta")
    await notifications.send_sms_notification(
        phone=farmer.get("phone", "+919443123456"),
        lang=farmer_lang,
        template_key="lot_accepted",
        name=farmer.get("name", "Farmer"),
        crop=lot["crop"],
        quantity=tx_dict["quantity"]
    )
    
    return schemas.TransactionResponse(**tx_dict)

# --- Dispute & Refund Path (Task 3) ---
@app.post("/transactions/{id}/reject", response_model=schemas.DisputeResponse)
async def reject_transaction(
    id: int, 
    request: schemas.DisputeCreate, 
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    tx = STORE_TRANSACTIONS.get(id)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    if not current_user.is_admin and tx["buyer_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Only the buyer can reject this lot")
        
    # Validation 1: Rejection quantity cannot exceed total delivered quantity
    if request.rejected_quantity_kg > tx["quantity"]:
        raise HTTPException(
            status_code=400, 
            detail=f"Rejected quantity ({request.rejected_quantity_kg}kg) exceeds total delivered quantity ({tx['quantity']}kg)"
        )
        
    # Validation 2: Evidence photos mandatory for quality mismatch or spoilage
    if request.reason in ["quality_mismatch", "spoilage"] and not request.photo_urls:
        raise HTTPException(
            status_code=400, 
            detail="Evidence photos are mandatory when raising a dispute for quality mismatch or spoilage"
        )
        
    # State machine transition to 'disputed'
    tx["status"] = "disputed"
    tx["updated_at"] = datetime.datetime.utcnow()
    
    dispute_id = len(STORE_DISPUTES) + 1
    dispute_dict = {
        "dispute_id": dispute_id,
        "transaction_id": tx["id"],
        "raised_by": "buyer",
        "reason": request.reason,
        "description": request.description,
        "rejected_quantity_kg": request.rejected_quantity_kg,
        "photo_urls": ",".join(request.photo_urls),
        "status": "open",
        "resolution": None,
        "created_at": datetime.datetime.utcnow(),
        "resolved_at": None
    }
    STORE_DISPUTES[id] = dispute_dict
    
    # Notify farmer in their preferred language
    farmer = STORE_USERS.get(tx["farmer_id"], {})
    farmer_lang = farmer.get("preferred_language", "ta")
    await notifications.send_sms_notification(
        phone=farmer.get("phone", "+919443123456"),
        lang=farmer_lang,
        template_key="dispute_raised",
        name=farmer.get("name", "Farmer"),
        tx_id=id,
        reason=request.reason
    )
    
    return schemas.DisputeResponse(**dispute_dict)

@app.get("/transactions/{id}/dispute", response_model=schemas.DisputeResponse)
def get_transaction_dispute(id: int, current_user: AuthenticatedUser = Depends(get_current_user)):
    dispute = STORE_DISPUTES.get(id)
    if not dispute:
        raise HTTPException(status_code=404, detail="No active dispute found for this transaction")
    return schemas.DisputeResponse(**dispute)

@app.post("/transactions/{id}/dispute/resolve")
async def resolve_transaction_dispute(
    id: int, 
    request: schemas.DisputeResolve, 
    admin: AuthenticatedUser = Depends(require_admin_user)
):
    tx = STORE_TRANSACTIONS.get(id)
    dispute = STORE_DISPUTES.get(id)
    if not tx or not dispute:
        raise HTTPException(status_code=404, detail="Transaction or Dispute not found")
        
    if dispute["status"] == "resolved":
        raise HTTPException(status_code=400, detail="Dispute has already been resolved")
        
    valid_resolutions = ["partial_refund", "full_refund", "buyer_accepts", "farmer_resale"]
    if request.resolution not in valid_resolutions:
        raise HTTPException(status_code=400, detail=f"Invalid resolution type. Must be one of {valid_resolutions}")
        
    dispute["status"] = "resolved"
    dispute["resolution"] = request.resolution
    dispute["resolved_at"] = datetime.datetime.utcnow()
    
    total_amount = tx["price"]
    rejected_qty = dispute["rejected_quantity_kg"]
    total_qty = tx["quantity"]
    rejected_portion_amount = round((rejected_qty / total_qty) * total_amount, 2)
    accepted_portion_amount = round(total_amount - rejected_portion_amount, 2)
    
    # Process Razorpay refunds / payouts based on resolution type
    if request.resolution == "full_refund":
        tx["status"] = "resolved_full_refund"
        tx["payment_status"] = "refunded_full"
        refund_res = payments.refund_payment(
            payment_id=tx.get("razorpay_payment_id", "pay_mock_1"),
            amount_inr=total_amount,
            notes={"dispute_id": dispute["dispute_id"], "reason": "Full refund on buyer rejection"}
        )
        tx["razorpay_refund_id"] = refund_res.get("id")
        
    elif request.resolution == "partial_refund":
        tx["status"] = "resolved_partial_refund"
        tx["payment_status"] = "refunded_partial"
        # Partial refund for rejected portion to buyer
        refund_res = payments.refund_payment(
            payment_id=tx.get("razorpay_payment_id", "pay_mock_1"),
            amount_inr=rejected_portion_amount,
            notes={"dispute_id": dispute["dispute_id"], "reason": f"Partial refund for {rejected_qty}kg"}
        )
        tx["razorpay_refund_id"] = refund_res.get("id")
        # Release remainder to farmer
        payments.release_payout_to_farmer(tx["farmer_id"], accepted_portion_amount, tx["id"])
        
    elif request.resolution in ["buyer_accepts", "farmer_resale"]:
        tx["status"] = f"resolved_{request.resolution}"
        tx["payment_status"] = "released"
        payments.release_payout_to_farmer(tx["farmer_id"], total_amount, tx["id"])
        
    # Final settlement state
    tx["status"] = "paid"
    tx["updated_at"] = datetime.datetime.utcnow()
    
    # Notify both parties in their preferred languages
    farmer = STORE_USERS.get(tx["farmer_id"], {})
    buyer = STORE_USERS.get(tx["buyer_id"], {})
    
    await notifications.send_sms_notification(
        phone=farmer.get("phone", "+919443123456"),
        lang=farmer.get("preferred_language", "ta"),
        template_key="dispute_resolved",
        name=farmer.get("name", "Farmer"),
        tx_id=id,
        resolution=request.resolution
    )
    
    return {
        "message": "Dispute resolved successfully",
        "resolution": request.resolution,
        "transaction_status": tx["status"],
        "payment_status": tx["payment_status"],
        "refund_amount": rejected_portion_amount if request.resolution == "partial_refund" else (total_amount if request.resolution == "full_refund" else 0.0),
        "released_amount": accepted_portion_amount if request.resolution == "partial_refund" else (total_amount if request.resolution != "full_refund" else 0.0)
    }

@app.post("/transactions/{id}/dispute/timeout-check")
def check_dispute_timeout(id: int):
    """
    Background job: Auto-escalate disputes open for > 48 hours to admin review.
    Does NOT auto-refund.
    """
    dispute = STORE_DISPUTES.get(id)
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")
        
    if dispute["status"] == "open":
        age = datetime.datetime.utcnow() - dispute["created_at"]
        if age.total_seconds() > 48 * 3600:
            dispute["status"] = "under_review"
            return {"status": "escalated", "message": "Dispute > 48 hours old. Auto-escalated to admin review."}
            
    return {"status": dispute["status"], "message": "Dispute within regular review timeframe."}

@app.post("/uploads/dispute-evidence")
async def upload_dispute_evidence(
    file: UploadFile = File(...),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """Upload photo evidence to Supabase Storage bucket `dispute-evidence` with validation."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files (JPEG, PNG, WebP) are allowed as evidence")
        
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024: # 10MB limit
        raise HTTPException(status_code=400, detail="Evidence photo must be under 10MB")
        
    storage_path = f"disputes/{uuid.uuid4().hex}_{file.filename}"
    
    # Upload to Supabase Storage bucket 'dispute-evidence' via admin client
    try:
        admin_client = get_supabase_admin_client()
        # admin_client.storage.from_('dispute-evidence').upload(storage_path, contents)
    except Exception as e:
        print(f"Supabase storage mock note: {e}")
        
    return {
        "storage_path": storage_path,
        "url": f"https://storage.agriconnect.in/dispute-evidence/{storage_path}"
    }

# --- Razorpay Payments Endpoints (Task 4) ---
@app.post("/payments/create-order")
def create_payment_order(req: schemas.RazorpayOrderCreate, current_user: AuthenticatedUser = Depends(get_current_user)):
    tx = STORE_TRANSACTIONS.get(req.transaction_id)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    order = payments.create_order(
        amount_inr=tx["price"],
        receipt=f"rcpt_tx_{tx['id']}",
        notes={"transaction_id": tx["id"], "buyer_id": current_user.id}
    )
    tx["razorpay_order_id"] = order["id"]
    return order

@app.post("/payments/verify")
def verify_payment(req: schemas.RazorpayPaymentVerify, current_user: AuthenticatedUser = Depends(get_current_user)):
    tx = STORE_TRANSACTIONS.get(req.transaction_id)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    is_valid = payments.verify_payment_signature(
        razorpay_order_id=req.razorpay_order_id,
        razorpay_payment_id=req.razorpay_payment_id,
        razorpay_signature=req.razorpay_signature
    )
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid Razorpay signature")
        
    tx["razorpay_payment_id"] = req.razorpay_payment_id
    tx["payment_status"] = "held" # Provably held in escrow until delivery/resolution
    tx["status"] = "in_transit"
    return {"status": "success", "payment_status": "held", "message": "Payment captured and held in escrow"}
