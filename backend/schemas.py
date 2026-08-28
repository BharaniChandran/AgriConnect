from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional, List
from datetime import datetime

# --- Auth & User Schemas ---
class UserAuthRequest(BaseModel):
    phone_or_email: str
    password_or_otp: str
    role: str = "farmer" # "farmer" or "buyer"
    name: Optional[str] = "Agri User"
    location: Optional[str] = "Nashik, Maharashtra"
    preferred_language: str = "mr"

class UserProfileResponse(BaseModel):
    id: str
    name: str
    location: str
    phone: str
    preferred_language: str
    role: str
    is_admin: bool = False
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Optional[UserProfileResponse] = None

# --- Crop / Lot Schemas ---
class CropLotCreate(BaseModel):
    crop: str
    quantity: float = Field(..., gt=0)
    quality: str = "Grade A"
    location: str = "Pimpalgaon APMC, Nashik"
    price_per_kg: float = Field(..., gt=0)


class CropLotResponse(BaseModel):
    lot_id: str
    farmer_id: str
    crop: str
    quantity: float
    quality: str
    location: str
    price_per_kg: float
    status: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- Market Price Schemas ---
class MarketPriceResponse(BaseModel):
    id: int
    market: str
    crop: str
    date: datetime
    price: float
    arrival: float
    model_config = ConfigDict(from_attributes=True)

# --- Transaction Schemas ---
class TransactionCreate(BaseModel):
    lot_id: str
    quantity: Optional[float] = None # defaults to full lot quantity

class TransactionResponse(BaseModel):
    id: int
    farmer_id: str
    buyer_id: str
    lot_id: Optional[str] = None
    quantity: float
    price: float
    status: str
    payment_status: str
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

# --- Dispute Schemas ---
class DisputeCreate(BaseModel):
    reason: str # quality_mismatch, quantity_mismatch, spoilage, wrong_item, other
    description: str
    rejected_quantity_kg: float = Field(..., gt=0)
    photo_urls: List[str] = Field(default_factory=list)

    @field_validator("photo_urls")
    @classmethod
    def validate_photos_for_quality_spoilage(cls, v, info):
        # We also validate in the endpoint logic against reason
        return v

class DisputeResponse(BaseModel):
    dispute_id: int
    transaction_id: int
    raised_by: str
    reason: str
    description: str
    rejected_quantity_kg: float
    photo_urls: str
    status: str
    resolution: Optional[str] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)

class DisputeResolve(BaseModel):
    resolution: str # partial_refund, full_refund, buyer_accepts, farmer_resale

# --- Payment & Razorpay Schemas ---
class RazorpayOrderCreate(BaseModel):
    transaction_id: int

class RazorpayPaymentVerify(BaseModel):
    transaction_id: int
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
