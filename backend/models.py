from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Enum, Text, Numeric, Boolean, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database import Base
import enum
import datetime
import uuid

class TransactionStatus(str, enum.Enum):
    offered = "offered"
    accepted = "accepted"
    in_transit = "in_transit"
    delivered = "delivered"
    disputed = "disputed"
    resolved_partial_refund = "resolved_partial_refund"
    resolved_full_refund = "resolved_full_refund"
    resolved_buyer_accepts = "resolved_buyer_accepts"
    resolved_farmer_resale = "resolved_farmer_resale"
    paid = "paid"

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

class Farmer(Base):
    __tablename__ = "farmers"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    preferred_language = Column(String, default="mr")
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    lots = relationship("CropLot", back_populates="farmer")
    transactions = relationship("Transaction", back_populates="farmer", foreign_keys="Transaction.farmer_id")

class Buyer(Base):
    __tablename__ = "buyers"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    location = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    preferred_language = Column(String, default="mr")
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    transactions = relationship("Transaction", back_populates="buyer", foreign_keys="Transaction.buyer_id")

class CropLot(Base):
    __tablename__ = "crops_lots"
    lot_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    farmer_id = Column(String, ForeignKey("farmers.id", ondelete="CASCADE"), nullable=False)
    crop = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    quality = Column(String, nullable=False)
    location = Column(String, nullable=False)
    price_per_kg = Column(Float, nullable=False)
    status = Column(String, default="available") # available, offered, sold, cancelled
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    farmer = relationship("Farmer", back_populates="lots")
    transactions = relationship("Transaction", back_populates="lot")

class MarketPrice(Base):
    __tablename__ = "market_prices"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    market = Column(String, nullable=False, index=True)
    crop = Column(String, nullable=False, index=True)
    date = Column(DateTime, nullable=False, index=True)
    price = Column(Float, nullable=False)
    arrival = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    farmer_id = Column(String, ForeignKey("farmers.id"), nullable=False)
    buyer_id = Column(String, ForeignKey("buyers.id"), nullable=False)
    lot_id = Column(String, ForeignKey("crops_lots.lot_id"), nullable=True)
    quantity = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    status = Column(Enum(TransactionStatus), default=TransactionStatus.offered, index=True)
    payment_status = Column(String, default="pending") # pending, held, refunded_partial, refunded_full, released
    razorpay_order_id = Column(String, nullable=True)
    razorpay_payment_id = Column(String, nullable=True)
    razorpay_refund_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    farmer = relationship("Farmer", back_populates="transactions", foreign_keys=[farmer_id])
    buyer = relationship("Buyer", back_populates="transactions", foreign_keys=[buyer_id])
    lot = relationship("CropLot", back_populates="transactions")
    disputes = relationship("Dispute", back_populates="transaction")

class Dispute(Base):
    __tablename__ = "disputes"
    dispute_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id", ondelete="CASCADE"), nullable=False)
    raised_by = Column(String, nullable=False) # buyer, farmer
    reason = Column(Enum(DisputeReason), nullable=False)
    description = Column(Text, nullable=False)
    rejected_quantity_kg = Column(Float, nullable=False)
    photo_urls = Column(String, default="") # Comma-separated or JSON string for cross-db compatibility
    status = Column(Enum(DisputeStatus), default=DisputeStatus.open, index=True)
    resolution = Column(Enum(DisputeResolution), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    transaction = relationship("Transaction", back_populates="disputes")
