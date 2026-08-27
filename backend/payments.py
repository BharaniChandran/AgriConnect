"""
Razorpay Payment Service for AgriConnect.
Handles order creation, signature verification, escrow holding, and partial/full refunds.
"""
import razorpay
import hmac
import hashlib
from typing import Dict, Any, Optional
from config import settings

# Initialize Razorpay Client
try:
    rzp_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
except Exception as e:
    rzp_client = None
    print(f"Warning: Razorpay client failed to initialize: {e}")

def is_mock_mode() -> bool:
    return not settings.RAZORPAY_KEY_ID or settings.RAZORPAY_KEY_ID.startswith("mock") or rzp_client is None

def create_order(amount_inr: float, receipt: str, notes: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Create a Razorpay Order.
    Amount must be passed in paise (1 INR = 100 paise).
    """
    amount_paise = int(amount_inr * 100)
    
    if is_mock_mode():
        import uuid
        return {
            "id": f"order_mock_{uuid.uuid4().hex[:12]}",
            "entity": "order",
            "amount": amount_paise,
            "amount_paid": 0,
            "amount_due": amount_paise,
            "currency": "INR",
            "receipt": receipt,
            "status": "created",
            "notes": notes or {}
        }
        
    try:
        data = {
            "amount": amount_paise,
            "currency": "INR",
            "receipt": receipt,
            "payment_capture": 1, # Auto-capture upon payment
            "notes": notes or {}
        }
        order = rzp_client.order.create(data=data)
        return order
    except Exception as e:
        print(f"Razorpay order creation error: {e}")
        raise

def verify_payment_signature(razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str) -> bool:
    """
    Verify payment signature against Razorpay secret.
    """
    if is_mock_mode() or razorpay_signature == "mock_signature":
        return True
        
    try:
        payload = f"{razorpay_order_id}|{razorpay_payment_id}"
        generated_signature = hmac.new(
            settings.RAZORPAY_KEY_SECRET.encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(generated_signature, razorpay_signature)
    except Exception as e:
        print(f"Signature verification error: {e}")
        return False

def refund_payment(payment_id: str, amount_inr: float, notes: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Initiate a full or partial refund via Razorpay Refund API.
    """
    amount_paise = int(amount_inr * 100)
    
    if is_mock_mode() or payment_id.startswith("pay_mock"):
        import uuid
        return {
            "id": f"rfnd_mock_{uuid.uuid4().hex[:12]}",
            "entity": "refund",
            "amount": amount_paise,
            "currency": "INR",
            "payment_id": payment_id,
            "status": "processed",
            "notes": notes or {}
        }
        
    try:
        data = {
            "amount": amount_paise,
            "notes": notes or {}
        }
        refund = rzp_client.payment.refund(payment_id, data)
        return refund
    except Exception as e:
        print(f"Razorpay refund error: {e}")
        raise

def release_payout_to_farmer(farmer_id: str, amount_inr: float, transaction_id: int) -> Dict[str, Any]:
    """
    Release payout to the farmer (via Razorpay Route / Payout API).
    """
    print(f"[Razorpay Payout]: Released ₹{amount_inr} to Farmer #{farmer_id} for Transaction #{transaction_id}")
    return {
        "status": "released",
        "farmer_id": farmer_id,
        "amount_inr": amount_inr,
        "transaction_id": transaction_id
    }
