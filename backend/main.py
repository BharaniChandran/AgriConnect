from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional, Any, Dict
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
import recommendations
import predictor

# In-memory / mock persistent store for cross-environment testing
# (Works directly with Postgres models in memory or Supabase)
app = FastAPI(title="AgriConnect Maharashtra API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Handle /api prefix transparently for Vercel Serverless routing
@app.middleware("http")
async def handle_api_prefix(request, call_next):
    raw_path = request.scope.get("path", "")
    if raw_path.startswith("/api/"):
        request.scope["path"] = raw_path[4:]
    elif raw_path == "/api":
        request.scope["path"] = "/"
    return await call_next(request)

# Simulated in-memory store for fallback/demo consistency
STORE_USERS = {}
STORE_LOTS = {}
STORE_TRANSACTIONS = {}
STORE_DISPUTES = {}

# Seed initial demo data for Maharashtra pilot
def seed_demo_data():
    farmer_id = "farmer-101"
    buyer_id = "buyer-202"
    admin_id = "admin-999"

    STORE_USERS[farmer_id] = {
        "id": farmer_id,
        "name": "Ram Patil (Sahyadri Agro Farms)",
        "location": "Pimpalgaon, Nashik, Maharashtra",
        "phone": "+919822123456",
        "email": "farmer@agriconnect.com",
        "preferred_language": "mr",
        "role": "farmer",
        "is_admin": False,
        "password_hash": get_password_hash("password123")
    }

    STORE_USERS[buyer_id] = {
        "id": buyer_id,
        "name": "Mumbai Fresh Grocers Ltd.",
        "location": "Vashi APMC, Navi Mumbai, Maharashtra",
        "phone": "+919820012345",
        "email": "buyer@agriconnect.com",
        "preferred_language": "en",
        "role": "buyer",
        "is_admin": False,
        "password_hash": get_password_hash("password123")
    }

    STORE_USERS[admin_id] = {
        "id": admin_id,
        "name": "Platform Admin (AgriConnect)",
        "location": "Pune, Maharashtra",
        "phone": "+919999999999",
        "email": "admin@agriconnect.com",
        "preferred_language": "mr",
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
        "location": "Pimpalgaon APMC, Nashik",
        "price_per_kg": 28.5,
        "status": "available",
        "created_at": datetime.datetime.now(datetime.timezone.utc)
    }

    tx_id = 1
    STORE_TRANSACTIONS[tx_id] = {
        "id": tx_id,
        "farmer_id": farmer_id,
        "buyer_id": buyer_id,
        "lot_id": lot_id,
        "quantity": 1250.0,
        "price": 35625.0,
        "status": "delivered",
        "payment_status": "held",
        "razorpay_order_id": "order_mock_mh_101",
        "razorpay_payment_id": "pay_mock_mh_101",
        "created_at": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=2),
        "updated_at": datetime.datetime.now(datetime.timezone.utc)
    }

seed_demo_data()

# --- Root & Health ---
@app.get("/")
def root():
    return {
        "app": "AgriConnect API",
        "pilot_region": "Maharashtra",
        "pilot_district": "Nashik",
        "supported_languages": ["mr", "hi", "en", "gu", "ta", "te", "kn", "ml"],
        "status": "online"
    }


# --- Auth Endpoints ---
@app.post("/auth/register", response_model=schemas.Token)
def register(req: schemas.UserAuthRequest):
    raw_id = (req.phone_or_email or "").strip()
    if not raw_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Phone or email is required")
        
    is_email = "@" in raw_id
    email = raw_id.lower() if is_email else f"{raw_id.replace('+', '')}@agriconnect.local"
    
    import ors_service
    loc_lat, loc_lng = ors_service.geocode_location_to_lat_lon(req.location or "Nashik, Maharashtra")

    supabase_uid = None
    admin_client = None
    try:
        admin_client = get_supabase_admin_client()
        sb_user_attrs = {
            "email": email,
            "password": req.password_or_otp or "Password123!",
            "email_confirm": True,
            "user_metadata": {
                "name": req.name or "Agri User",
                "role": req.role,
                "location": req.location or "Nashik, Maharashtra",
                "latitude": loc_lat,
                "longitude": loc_lng,
                "phone": raw_id,
                "preferred_language": req.preferred_language or "mr",
                "is_admin": req.role == "admin"
            }
        }
        if not is_email and raw_id.startswith("+"):
            sb_user_attrs["phone"] = raw_id

        sb_res = admin_client.auth.admin.create_user(sb_user_attrs)
        if sb_res and sb_res.user:
            supabase_uid = str(sb_res.user.id)
            print(f"Successfully created user '{email}' in Supabase Auth. ID: {supabase_uid}")
    except Exception as e:
        print(f"Supabase auth create_user note: {e}")
        # If user already registered in Supabase, fetch and update existing user ID
        try:
            if admin_client:
                users_list = admin_client.auth.admin.list_users()
                for u in users_list:
                    if (u.email and u.email.lower() == email.lower()) or getattr(u, "phone", None) == raw_id:
                        supabase_uid = str(u.id)
                        # Ensure email confirmation and password update
                        try:
                            admin_client.auth.admin.update_user_by_id(
                                supabase_uid,
                                {
                                    "email_confirm": True,
                                    "password": req.password_or_otp or "Password123!",
                                    "user_metadata": {
                                        "name": req.name or "Agri User",
                                        "role": req.role,
                                        "location": req.location or "Nashik, Maharashtra",
                                        "phone": raw_id,
                                        "preferred_language": req.preferred_language or "mr",
                                        "is_admin": req.role == "admin"
                                    }
                                }
                            )
                        except Exception as update_err:
                            print(f"Supabase update user note: {update_err}")
                        break
        except Exception as list_err:
            print(f"Supabase list users error: {list_err}")

    # Fallback ID if Supabase service was unreachable
    user_id = supabase_uid if supabase_uid else f"{req.role}-{uuid.uuid4().hex[:6]}"
    
    user_dict = {
        "id": user_id,
        "name": req.name or "Agri User",
        "location": req.location or "Nashik, Maharashtra",
        "latitude": loc_lat,
        "longitude": loc_lng,
        "phone": raw_id,
        "email": email if is_email else "",
        "preferred_language": req.preferred_language or "mr",
        "role": req.role,
        "is_admin": req.role == "admin",
        "password_hash": get_password_hash(req.password_or_otp or "Password123!")
    }
    STORE_USERS[user_id] = user_dict

    # Sync profile to Supabase database table if available
    if supabase_uid:
        try:
            admin_client = get_supabase_admin_client()
            table_name = "farmers" if req.role == "farmer" else "buyers"
            admin_client.table(table_name).upsert({
                "id": supabase_uid,
                "name": user_dict["name"],
                "location": user_dict["location"],
                "phone": user_dict["phone"],
                "preferred_language": user_dict["preferred_language"],
                "is_admin": user_dict["is_admin"]
            }).execute()
        except Exception as sync_err:
            print(f"Supabase profile table sync note: {sync_err}")

    token = create_access_token(data={
        "sub": user_id,
        "role": user_dict["role"],
        "name": user_dict["name"],
        "phone": user_dict["phone"],
        "email": email,
        "preferred_language": user_dict["preferred_language"],
        "is_admin": user_dict["is_admin"]
    })
    
    profile = schemas.UserProfileResponse(**user_dict)
    return {"access_token": token, "token_type": "bearer", "user": profile}

@app.post("/auth/login", response_model=schemas.Token)
def login(req: schemas.UserAuthRequest):
    raw_id = (req.phone_or_email or "").strip()
    if not raw_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Phone or email address is required."
        )

    is_email = "@" in raw_id
    email = raw_id.lower() if is_email else f"{raw_id.replace('+', '')}@agriconnect.local"
    clean_phone = raw_id.replace(" ", "").replace("-", "")

    # 1. Search in-memory store (by phone, clean phone suffix, email, or name)
    found_user = None
    for u in STORE_USERS.values():
        u_phone = (u.get("phone") or "").replace(" ", "").replace("-", "")
        u_email = (u.get("email") or "").lower()
        if (
            u_phone == clean_phone 
            or (clean_phone and len(clean_phone) >= 10 and u_phone.endswith(clean_phone[-10:]))
            or u_email == raw_id.lower()
            or u_email == email.lower()
            or u.get("name", "").lower() == raw_id.lower()
        ):
            found_user = u
            break
            
    # 2. Search Supabase Auth
    if not found_user:
        try:
            admin_client = get_supabase_admin_client()
            users_list = admin_client.auth.admin.list_users()
            for u in users_list:
                u_phone = getattr(u, "phone", "") or ""
                u_email = (u.email or "").lower()
                if (
                    u_email == email.lower() 
                    or u_email == raw_id.lower() 
                    or (clean_phone and len(clean_phone) >= 10 and u_phone.replace(" ", "").endswith(clean_phone[-10:]))
                ):
                    meta = u.user_metadata or {}
                    role = meta.get("role", req.role or "farmer")
                    user_dict = {
                        "id": str(u.id),
                        "name": meta.get("name", req.name or "Agri User"),
                        "location": meta.get("location", "Nashik, Maharashtra"),
                        "phone": meta.get("phone", raw_id),
                        "email": u.email,
                        "preferred_language": meta.get("preferred_language", "mr"),
                        "role": role,
                        "is_admin": meta.get("is_admin", role == "admin"),
                        "password_hash": get_password_hash(req.password_or_otp or "Password123!")
                    }
                    STORE_USERS[str(u.id)] = user_dict
                    found_user = user_dict
                    break
        except Exception as e:
            print(f"Supabase auth login lookup note: {e}")

    # 3. Search Supabase database tables (farmers / buyers)
    if not found_user:
        try:
            admin_client = get_supabase_admin_client()
            for table in ["farmers", "buyers"]:
                res = admin_client.table(table).select("*").or_(f"phone.eq.{raw_id},name.ilike.%{raw_id}%").execute()
                if res.data and len(res.data) > 0:
                    row = res.data[0]
                    role = "farmer" if table == "farmers" else "buyer"
                    user_dict = {
                        "id": str(row["id"]),
                        "name": row.get("name", "Agri User"),
                        "location": row.get("location", "Nashik, Maharashtra"),
                        "phone": row.get("phone", raw_id),
                        "email": email if is_email else "",
                        "preferred_language": row.get("preferred_language", "mr"),
                        "role": role,
                        "is_admin": row.get("is_admin", False),
                        "password_hash": get_password_hash(req.password_or_otp or "Password123!")
                    }
                    STORE_USERS[str(row["id"])] = user_dict
                    found_user = user_dict
                    break
        except Exception as db_err:
            print(f"Supabase DB login lookup note: {db_err}")

    # 4. User not found -> check if this is an auto-registration scenario or return error
    if not found_user:
        # If user is not found, return 401 Unauthorized so the user can register
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account not found. Please create an account first."
        )

    # 5. Verify Password
    stored_hash = found_user.get("password_hash")
    input_pass = req.password_or_otp or ""
    # Allow valid bcrypt hash match OR demo universal passwords
    is_valid_pass = False
    if stored_hash and verify_password(input_pass, stored_hash):
        is_valid_pass = True
    elif input_pass in ("password123", "admin123", "pass1234", "Password123!", "123456"):
        is_valid_pass = True

    if not is_valid_pass:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email/phone or password."
        )
        
    token = create_access_token(data={
        "sub": found_user["id"],
        "role": found_user["role"],
        "name": found_user["name"],
        "phone": found_user["phone"],
        "email": found_user.get("email", email),
        "preferred_language": found_user["preferred_language"],
        "is_admin": found_user["is_admin"]
    })
    profile = schemas.UserProfileResponse(**found_user)
    return {"access_token": token, "token_type": "bearer", "user": profile}

@app.get("/auth/me", response_model=schemas.UserProfileResponse)
def read_current_user(current_user: AuthenticatedUser = Depends(get_current_user)):
    # 1. Check in-memory store
    if current_user.id in STORE_USERS:
        return schemas.UserProfileResponse(**STORE_USERS[current_user.id])
        
    # 2. Check Supabase DB table
    try:
        admin_client = get_supabase_admin_client()
        table_name = "farmers" if current_user.role == "farmer" else "buyers"
        res = admin_client.table(table_name).select("*").eq("id", current_user.id).execute()
        if res.data and len(res.data) > 0:
            row = res.data[0]
            user_data = {
                "id": str(row["id"]),
                "name": row.get("name", current_user.name),
                "location": row.get("location", "Nashik, Maharashtra"),
                "phone": row.get("phone", current_user.phone),
                "preferred_language": row.get("preferred_language", current_user.preferred_language or "mr"),
                "role": current_user.role,
                "is_admin": row.get("is_admin", current_user.is_admin)
            }
            STORE_USERS[current_user.id] = user_data
            return schemas.UserProfileResponse(**user_data)
    except Exception as e:
        print(f"Supabase auth/me lookup note: {e}")

    # 3. Fallback to claims in token
    user_data = {
        "id": current_user.id,
        "name": current_user.name,
        "location": "Nashik, Maharashtra",
        "phone": current_user.phone,
        "preferred_language": current_user.preferred_language or "mr",
        "role": current_user.role,
        "is_admin": current_user.is_admin
    }
    STORE_USERS[current_user.id] = user_data
    return schemas.UserProfileResponse(**user_data)

@app.post("/users/{user_id}/language")
def update_user_language(user_id: str, language: str, current_user: AuthenticatedUser = Depends(get_current_user)):
    if user_id in STORE_USERS:
        STORE_USERS[user_id]["preferred_language"] = language
    return {"message": "Language updated successfully", "preferred_language": language}

def is_valid_uuid(val: Any) -> bool:
    if not val or not isinstance(val, str):
        return False
    try:
        uuid.UUID(val)
        return True
    except ValueError:
        return False

def sync_user_to_supabase_profile(user_id: str, role: str, name: str = "", location: str = "", phone: str = "", preferred_language: str = "mr"):
    """Ensure user profile is present in Supabase farmers or buyers table."""
    if not is_valid_uuid(user_id):
        return
    try:
        admin_client = get_supabase_admin_client()
        table_name = "farmers" if role == "farmer" else "buyers"
        admin_client.table(table_name).upsert({
            "id": user_id,
            "name": name or "Agri User",
            "location": location or "Nashik, Maharashtra",
            "phone": phone or "+919822123456",
            "preferred_language": preferred_language or "mr",
            "is_admin": role == "admin"
        }).execute()
    except Exception as e:
        print(f"Supabase profile sync note: {e}")


# --- Lots Endpoints ---
@app.get("/lots", response_model=List[schemas.CropLotResponse])
def list_lots():
    # Sync from Supabase crops_lots table
    try:
        admin_client = get_supabase_admin_client()
        res = admin_client.table("crops_lots").select("*").eq("status", "available").execute()
        if res and res.data:
            for r in res.data:
                STORE_LOTS[r["lot_id"]] = r
    except Exception as e:
        print(f"Supabase list_lots sync note: {e}")

    return [schemas.CropLotResponse(**lot) for lot in STORE_LOTS.values() if lot.get("status") == "available"]

@app.post("/lots", response_model=schemas.CropLotResponse)
def create_crop_lot(lot: schemas.CropLotCreate, current_user: AuthenticatedUser = Depends(get_current_user)):
    if current_user.role != "farmer":
        raise HTTPException(status_code=403, detail="Only farmers can list crops/lots")
        
    lot_uuid = str(uuid.uuid4())
    lot_dict = {
        "lot_id": lot_uuid,
        "farmer_id": current_user.id,
        "crop": lot.crop,
        "quantity": lot.quantity,
        "quality": lot.quality,
        "location": lot.location,
        "price_per_kg": lot.price_per_kg,
        "status": "available",
        "created_at": datetime.datetime.utcnow()
    }
    STORE_LOTS[lot_uuid] = lot_dict

    # Sync to Supabase crops_lots table
    try:
        admin_client = get_supabase_admin_client()
        farmer_uid = current_user.id if is_valid_uuid(current_user.id) else None
        if farmer_uid:
            sync_user_to_supabase_profile(farmer_uid, current_user.role, current_user.name, phone=current_user.phone)
            admin_client.table("crops_lots").insert({
                "lot_id": lot_uuid,
                "farmer_id": farmer_uid,
                "crop": lot.crop,
                "quantity": float(lot.quantity),
                "quality": lot.quality,
                "location": lot.location,
                "price_per_kg": float(lot.price_per_kg),
                "status": "available"
            }).execute()
            print(f"Successfully synced lot '{lot.crop}' ({lot_uuid}) to Supabase DB 'crops_lots'")
    except Exception as e:
        print(f"Supabase lot insert sync note: {e}")

    return schemas.CropLotResponse(**lot_dict)

# --- Live Market Prices ---
@app.get("/market-prices")
async def get_market_prices():
    prices = await market_data.fetch_live_mh_agmarknet_prices()
    return prices

@app.post("/market-prices/ingest")
async def trigger_price_ingestion(admin: AuthenticatedUser = Depends(require_admin_user)):
    result = await market_data.ingest_market_prices_job()
    return result

# --- Step 1: Best-Market Ranking (Deterministic Rule-Based) ---
@app.get("/recommendations/best-market")
async def get_best_market_ranking(
    crop: str, 
    quantity: float, 
    farmer_location: str,
    per_km_rate: Optional[float] = 15.0
):
    """
    Returns candidate markets ranked by net profit:
    net_profit = gross_revenue - transport_cost - wastage_cost
    Pulls candidate market prices from live Supabase market_prices table.
    """
    if quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than 0 kg")
    if not crop.strip():
        raise HTTPException(status_code=400, detail="Crop parameter is required")
    if not farmer_location.strip():
        raise HTTPException(status_code=400, detail="Farmer location is required")
        
    try:
        ranked_markets = await recommendations.calculate_best_markets(
            crop=crop.strip(),
            quantity=quantity,
            farmer_location=farmer_location.strip(),
            per_km_rate=per_km_rate or 15.0
        )
        return {
            "crop": crop,
            "quantity_kg": quantity,
            "farmer_location": farmer_location,
            "top_market": ranked_markets[0]["market"] if ranked_markets else None,
            "max_net_profit": ranked_markets[0]["net_profit"] if ranked_markets else 0.0,
            "markets": ranked_markets
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate best-market ranking: {str(e)}")

# --- Step 2: Buyer Matching (ORS Real Distance & Net Price Ranking) ---
@app.get("/recommendations/buyer-match")
async def get_buyer_match_ranking(
    crop: str,
    quantity: float,
    quality: Optional[str] = "Grade A",
    location: Optional[str] = "Nashik, Maharashtra",
    farmer_lat: Optional[float] = None,
    farmer_lng: Optional[float] = None,
    radius_km: Optional[float] = 100.0,
    price_per_kg: Optional[float] = None
):
    """
    Finds buyers within real driving distance (ORS Matrix / Haversine fallback),
    filters by radius_km, and ranks by net price to farmer (price_offered - transport_cost - wastage_cost).
    """
    if quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than 0 kg")
    if not crop.strip():
        raise HTTPException(status_code=400, detail="Crop parameter is required")
        
    try:
        matched_buyers = await recommendations.calculate_buyer_matches(
            crop=crop.strip(),
            quantity=quantity,
            quality=quality or "Grade A",
            location=location or "Nashik, Maharashtra",
            farmer_lat=farmer_lat,
            farmer_lng=farmer_lng,
            radius_km=radius_km if radius_km is not None else 100.0,
            price_per_kg=price_per_kg
        )
        return {
            "crop": crop,
            "quantity_kg": quantity,
            "quality": quality,
            "location": location,
            "radius_km": radius_km if radius_km is not None else 100.0,
            "farmer_lat": farmer_lat,
            "farmer_lng": farmer_lng,
            "top_buyer": matched_buyers[0]["name"] if matched_buyers else None,
            "top_net_price_per_kg": matched_buyers[0]["net_price_per_kg"] if matched_buyers else 0.0,
            "top_net_payout": matched_buyers[0]["net_payout"] if matched_buyers else 0.0,
            "buyers": matched_buyers
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to calculate buyer match ranking: {str(e)}")


# --- Step 3: Price Prediction (ML Serving & Scheduled Retraining) ---
@app.get("/predictions/price")
async def get_price_prediction(
    crop: str,
    market: str,
    days_ahead: Optional[int] = 3
):
    """
    ML Serving: Loads saved model artifact and predicts next 1-3 day prices for crop at market.
    """
    if not crop.strip():
        raise HTTPException(status_code=400, detail="Crop parameter is required")
    if not market.strip():
        raise HTTPException(status_code=400, detail="Market parameter is required")
        
    try:
        prediction_result = await predictor.predict_crop_price(
            crop=crop.strip(),
            market=market.strip(),
            days_ahead=min(7, max(1, days_ahead or 3))
        )
        return prediction_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Price prediction error: {str(e)}")

@app.post("/predictions/retrain")
def trigger_model_retraining(background_tasks: BackgroundTasks, admin: AuthenticatedUser = Depends(require_admin_user)):
    """
    Scheduled / On-Demand Retraining: Retrains price prediction model on latest Supabase market_prices data.
    """
    def retrain_task():
        train_price_model.train_and_evaluate()
        predictor.reload_model_artifact()

    background_tasks.add_task(retrain_task)
    return {
        "status": "training_initiated",
        "message": "Model retraining job queued in background on latest Agmarknet market prices.",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }

# --- Step 4: Unified Farmer Recommendation Flow ---
@app.get("/recommendations/unified")
async def get_unified_recommendation(
    crop: str,
    quantity: float,
    quality: Optional[str] = "Grade A",
    location: Optional[str] = "Nashik, Maharashtra",
    farmer_lat: Optional[float] = None,
    farmer_lng: Optional[float] = None,
    radius_km: Optional[float] = 100.0,
    price_per_kg: Optional[float] = None
):
    """
    Unified Endpoint: Returns top market ranking, net profit, ML price forecast trend, and ranked buyers.
    """
    if quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than 0 kg")
    if not crop.strip():
        raise HTTPException(status_code=400, detail="Crop parameter is required")
        
    try:
        result = await recommendations.calculate_unified_recommendation(
            crop=crop.strip(),
            quantity=quantity,
            quality=quality or "Grade A",
            location=location or "Nashik, Maharashtra",
            farmer_lat=farmer_lat,
            farmer_lng=farmer_lng,
            radius_km=radius_km if radius_km is not None else 100.0,
            price_per_kg=price_per_kg
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unified recommendation failed: {str(e)}")






# --- Transactions Endpoints ---
@app.get("/transactions", response_model=List[schemas.TransactionResponse])
def list_transactions(current_user: AuthenticatedUser = Depends(get_current_user)):
    # Sync from Supabase transactions table
    try:
        admin_client = get_supabase_admin_client()
        res = admin_client.table("transactions").select("*").execute()
        if res and res.data:
            for r in res.data:
                STORE_TRANSACTIONS[r["id"]] = r
    except Exception as e:
        print(f"Supabase list_transactions sync note: {e}")

    txs = []
    for tx in STORE_TRANSACTIONS.values():
        if current_user.is_admin or tx.get("farmer_id") == current_user.id or tx.get("buyer_id") == current_user.id:
            txs.append(schemas.TransactionResponse(**tx))
    return txs

@app.post("/transactions", response_model=schemas.TransactionResponse)
async def create_transaction(req: schemas.TransactionCreate, current_user: AuthenticatedUser = Depends(get_current_user)):
    if current_user.role != "buyer":
        raise HTTPException(status_code=403, detail="Only buyers can create transactions")
        
    lot = STORE_LOTS.get(req.lot_id)
    if not lot:
        # Check Supabase crops_lots table
        try:
            admin_client = get_supabase_admin_client()
            res = admin_client.table("crops_lots").select("*").eq("lot_id", req.lot_id).execute()
            if res and res.data:
                lot = res.data[0]
                STORE_LOTS[req.lot_id] = lot
        except Exception as e:
            print(f"Supabase lot lookup note: {e}")

    if not lot:
        # Fallback create demo lot if not found
        lot = {
            "lot_id": req.lot_id,
            "farmer_id": "farmer-101",
            "crop": "Tomato (Roma)",
            "quantity": 500.0,
            "price_per_kg": 28.0,
            "status": "sold"
        }
        STORE_LOTS[req.lot_id] = lot
    else:
        lot["status"] = "sold"

    tx_id = len(STORE_TRANSACTIONS) + 1
    total_price = float(lot["price_per_kg"]) * float(req.quantity or lot["quantity"])
    
    tx_dict = {
        "id": tx_id,
        "farmer_id": lot["farmer_id"],
        "buyer_id": current_user.id,
        "lot_id": lot["lot_id"],
        "quantity": float(req.quantity or lot["quantity"]),
        "price": total_price,
        "status": "in_transit",
        "payment_status": "held", # Payment held upon checkout
        "razorpay_order_id": f"order_mock_{tx_id}",
        "razorpay_payment_id": f"pay_mock_{tx_id}",
        "created_at": datetime.datetime.utcnow(),
        "updated_at": datetime.datetime.utcnow()
    }

    # Sync to Supabase transactions table
    try:
        admin_client = get_supabase_admin_client()
        farmer_uid = lot["farmer_id"] if is_valid_uuid(lot.get("farmer_id")) else None
        buyer_uid = current_user.id if is_valid_uuid(current_user.id) else None
        lot_uuid = lot["lot_id"] if is_valid_uuid(lot.get("lot_id")) else None

        if farmer_uid and buyer_uid:
            sync_user_to_supabase_profile(buyer_uid, current_user.role, current_user.name, phone=current_user.phone)
            tx_res = admin_client.table("transactions").insert({
                "farmer_id": farmer_uid,
                "buyer_id": buyer_uid,
                "lot_id": lot_uuid,
                "quantity": tx_dict["quantity"],
                "price": tx_dict["price"],
                "status": "in_transit",
                "payment_status": "held",
                "razorpay_order_id": tx_dict["razorpay_order_id"],
                "razorpay_payment_id": tx_dict["razorpay_payment_id"]
            }).execute()
            if tx_res.data and len(tx_res.data) > 0:
                tx_id = tx_res.data[0]["id"]
                tx_dict["id"] = tx_id
                print(f"Successfully synced transaction #{tx_id} to Supabase DB 'transactions'")
                
        if lot_uuid:
            admin_client.table("crops_lots").update({"status": "sold"}).eq("lot_id", lot_uuid).execute()
    except Exception as e:
        print(f"Supabase transaction insert sync note: {e}")

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

@app.post("/transactions/{id}/accept")
async def accept_transaction(
    id: int, 
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    tx = STORE_TRANSACTIONS.get(id)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
        
    if not current_user.is_admin and tx.get("buyer_id") != current_user.id:
        raise HTTPException(status_code=403, detail="Only the buyer can accept this delivery")
        
    tx["status"] = "delivered"
    tx["payment_status"] = "released"
    tx["updated_at"] = datetime.datetime.utcnow()
    
    # Release payment to farmer
    payments.release_payout_to_farmer(tx["farmer_id"], float(tx["price"]), tx["id"])
    
    # Sync to Supabase
    try:
        admin_client = get_supabase_admin_client()
        admin_client.table("transactions").update({
            "status": "delivered",
            "payment_status": "released",
            "updated_at": datetime.datetime.utcnow().isoformat()
        }).eq("id", id).execute()
    except Exception as e:
        print(f"Supabase transaction accept sync note: {e}")
        
    # Send notification to farmer
    farmer = STORE_USERS.get(tx["farmer_id"], {})
    farmer_lang = farmer.get("preferred_language", "ta")
    lot = STORE_LOTS.get(tx["lot_id"], {})
    crop_name = lot.get("crop", "Produce")
    
    await notifications.send_sms_notification(
        phone=farmer.get("phone", "+919443123456"),
        lang=farmer_lang,
        template_key="payment_released",
        name=farmer.get("name", "Farmer"),
        crop=crop_name,
        amount=tx["price"]
    )
    
    return {
        "message": "Delivery accepted and payment released to farmer successfully",
        "status": "delivered",
        "payment_status": "released",
        "transaction": tx
    }

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
        
    if not current_user.is_admin and tx.get("buyer_id") != current_user.id:
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

    # Sync to Supabase disputes and transactions tables
    try:
        admin_client = get_supabase_admin_client()
        admin_client.table("transactions").update({
            "status": "disputed",
            "updated_at": datetime.datetime.utcnow().isoformat()
        }).eq("id", tx["id"]).execute()
        
        sb_disp = admin_client.table("disputes").insert({
            "transaction_id": tx["id"],
            "raised_by": "buyer",
            "reason": request.reason,
            "description": request.description,
            "rejected_quantity_kg": float(request.rejected_quantity_kg),
            "photo_urls": request.photo_urls,
            "status": "open"
        }).execute()
        if sb_disp.data and len(sb_disp.data) > 0:
            dispute_dict["dispute_id"] = sb_disp.data[0]["dispute_id"]
            print(f"Successfully synced dispute #{dispute_dict['dispute_id']} to Supabase DB 'disputes'")
    except Exception as e:
        print(f"Supabase dispute sync note: {e}")
    
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
        # Check Supabase disputes table
        try:
            admin_client = get_supabase_admin_client()
            res = admin_client.table("disputes").select("*").eq("transaction_id", id).execute()
            if res and res.data:
                dispute = res.data[0]
                STORE_DISPUTES[id] = dispute
        except Exception as e:
            print(f"Supabase dispute lookup note: {e}")

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
        
    if dispute.get("status") == "resolved":
        raise HTTPException(status_code=400, detail="Dispute has already been resolved")
        
    valid_resolutions = ["partial_refund", "full_refund", "buyer_accepts", "farmer_resale"]
    if request.resolution not in valid_resolutions:
        raise HTTPException(status_code=400, detail=f"Invalid resolution type. Must be one of {valid_resolutions}")
        
    dispute["status"] = "resolved"
    dispute["resolution"] = request.resolution
    dispute["resolved_at"] = datetime.datetime.utcnow()
    
    total_amount = float(tx["price"])
    rejected_qty = float(dispute["rejected_quantity_kg"])
    total_qty = float(tx["quantity"])
    rejected_portion_amount = round((rejected_qty / total_qty) * total_amount, 2)
    accepted_portion_amount = round(total_amount - rejected_portion_amount, 2)
    
    # Process Razorpay refunds / payouts based on resolution type
    if request.resolution == "full_refund":
        tx["status"] = "resolved_full_refund"
        tx["payment_status"] = "refunded_full"
        refund_res = payments.refund_payment(
            payment_id=tx.get("razorpay_payment_id", "pay_mock_1"),
            amount_inr=total_amount,
            notes={"dispute_id": dispute.get("dispute_id", id), "reason": "Full refund on buyer rejection"}
        )
        tx["razorpay_refund_id"] = refund_res.get("id")
        
    elif request.resolution == "partial_refund":
        tx["status"] = "resolved_partial_refund"
        tx["payment_status"] = "refunded_partial"
        # Partial refund for rejected portion to buyer
        refund_res = payments.refund_payment(
            payment_id=tx.get("razorpay_payment_id", "pay_mock_1"),
            amount_inr=rejected_portion_amount,
            notes={"dispute_id": dispute.get("dispute_id", id), "reason": f"Partial refund for {rejected_qty}kg"}
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
    
    # Sync resolution to Supabase
    try:
        admin_client = get_supabase_admin_client()
        admin_client.table("disputes").update({
            "status": "resolved",
            "resolution": request.resolution,
            "resolved_at": datetime.datetime.utcnow().isoformat()
        }).eq("transaction_id", id).execute()
        
        admin_client.table("transactions").update({
            "status": "paid",
            "payment_status": tx["payment_status"],
            "razorpay_refund_id": tx.get("razorpay_refund_id"),
            "updated_at": datetime.datetime.utcnow().isoformat()
        }).eq("id", id).execute()
        print(f"Successfully synced dispute resolution for Tx #{id} to Supabase DB")
    except Exception as e:
        print(f"Supabase dispute resolve sync note: {e}")

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
    public_url = f"{settings.SUPABASE_URL}/storage/v1/object/public/dispute-evidence/{storage_path}"
    try:
        admin_client = get_supabase_admin_client()
        admin_client.storage.from_('dispute-evidence').upload(
            storage_path, 
            contents, 
            file_options={"content-type": file.content_type}
        )
    except Exception as e:
        print(f"Supabase storage upload note: {e}")
        
    return {
        "storage_path": storage_path,
        "url": public_url
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

# --- Static Frontend Serving for Production Unified Deployment ---
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(dist_dir):
    assets_dir = os.path.join(dist_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa_frontend(full_path: str):
        # Exclude internal API or documentation paths
        if full_path.startswith("docs") or full_path.startswith("redoc") or full_path.startswith("openapi.json"):
            raise HTTPException(status_code=404, detail="Not Found")
        file_path = os.path.join(dist_dir, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        index_file = os.path.join(dist_dir, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
        raise HTTPException(status_code=404, detail="Page not found")

