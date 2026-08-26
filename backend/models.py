from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum, Text
from sqlalchemy.orm import relationship
from database import Base
import enum
import datetime

class TransactionStatus(str, enum.Enum):
    offered = "offered"
    accepted = "accepted"
    in_transit = "in_transit"
    delivered = "delivered"
    paid = "paid"
    disputed = "disputed"

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

class ResolutionType(str, enum.Enum):
    partial_refund = "partial_refund"
    full_refund = "full_refund"
    buyer_accepts = "buyer_accepts"
    farmer_resale = "farmer_resale"

class Farmer(Base):
    __tablename__ = "farmers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    preferred_language = Column(String, default="en")

class Buyer(Base):
    __tablename__ = "buyers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    preferred_language = Column(String, default="en")

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmers.id"))
    buyer_id = Column(Integer, ForeignKey("buyers.id"))
    crop_name = Column(String)
    quantity_kg = Column(Float)
    price_per_kg = Column(Float)
    status = Column(Enum(TransactionStatus), default=TransactionStatus.offered)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    farmer = relationship("Farmer")
    buyer = relationship("Buyer")
    disputes = relationship("Dispute", back_populates="transaction")

class Dispute(Base):
    __tablename__ = "disputes"
    dispute_id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"))
    raised_by = Column(String) # "buyer" or "farmer"
    reason = Column(Enum(DisputeReason))
    description = Column(Text)
    rejected_quantity_kg = Column(Float)
    photo_urls = Column(String) # Comma separated for simplicity in SQLite
    status = Column(Enum(DisputeStatus), default=DisputeStatus.open)
    resolution = Column(Enum(ResolutionType), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    transaction = relationship("Transaction", back_populates="disputes")
