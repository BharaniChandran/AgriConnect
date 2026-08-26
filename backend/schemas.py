from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from models import TransactionStatus, DisputeReason, DisputeStatus, ResolutionType

class TransactionBase(BaseModel):
    farmer_id: int
    buyer_id: int
    crop_name: str
    quantity_kg: float
    price_per_kg: float

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    id: int
    status: TransactionStatus
    created_at: datetime
    
    class Config:
        orm_mode = True

class RejectRequest(BaseModel):
    reason: DisputeReason
    description: str
    rejected_quantity_kg: float
    photo_urls: List[str]

class ResolveRequest(BaseModel):
    resolution: ResolutionType

class DisputeResponse(BaseModel):
    dispute_id: int
    transaction_id: int
    raised_by: str
    reason: DisputeReason
    description: str
    rejected_quantity_kg: float
    photo_urls: str
    status: DisputeStatus
    resolution: Optional[ResolutionType]
    created_at: datetime
    resolved_at: Optional[datetime]

    class Config:
        orm_mode = True
