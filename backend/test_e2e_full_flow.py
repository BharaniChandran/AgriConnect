"""
Comprehensive End-to-End Functional Test Suite for AgriConnect (Step 5).
Validates every stage of the real user journey for Maharashtra APMCs and Marathi default.
"""
import pytest
import uuid
import datetime
from fastapi.testclient import TestClient
from main import app
from database import get_supabase_admin_client

client = TestClient(app)

def test_step5_complete_end_to_end_flow():
    print("\n" + "="*75)
    print("STEP 5: COMPREHENSIVE END-TO-END SYSTEM FUNCTIONAL VERIFICATION (MAHARASHTRA)")
    print("="*75)

    # -------------------------------------------------------------------------
    # 1. LANGUAGE SELECTION & PERSISTENCE (MARATHI)
    # -------------------------------------------------------------------------
    farmer_email = f"farmer_e2e_{uuid.uuid4().hex[:6]}@agriconnect.com"
    farmer_pass = "FarmerPass2026!"
    
    print("\n[CHECK 1] Language Selection & Farmer Registration (Marathi)...")
    farmer_reg_res = client.post("/auth/register", json={
        "phone_or_email": farmer_email,
        "password_or_otp": farmer_pass,
        "role": "farmer",
        "name": "Ram Patil (Farmer)",
        "location": "Pimpalgaon, Nashik, Maharashtra",
        "preferred_language": "mr"
    })
    assert farmer_reg_res.status_code == 200, f"Farmer registration failed: {farmer_reg_res.text}"
    farmer_data = farmer_reg_res.json()
    farmer_token = farmer_data["access_token"]
    farmer_id = farmer_data["user"]["id"]
    farmer_headers = {"Authorization": f"Bearer {farmer_token}"}
    
    # Test Language update endpoint
    lang_res = client.post(f"/users/{farmer_id}/language?language=mr", headers=farmer_headers)
    assert lang_res.status_code == 200
    assert lang_res.json()["preferred_language"] == "mr"
    print("  -> PASS: Language selection persisted (Marathi - 'mr')")

    # -------------------------------------------------------------------------
    # 2. CROP ENTRY & INTELLIGENCE SUBMISSION
    # -------------------------------------------------------------------------
    print("\n[CHECK 2] Crop Entry & Listing Submission...")
    crop_name = "Tomato (Roma)"
    qty_kg = 1500.0
    quality_grade = "Grade A"
    farmer_loc = "Pimpalgaon APMC, Nashik"

    publish_res = client.post("/lots", json={
        "crop": crop_name,
        "quantity": qty_kg,
        "price_per_kg": 28.50,
        "quality": quality_grade,
        "location": farmer_loc
    }, headers=farmer_headers)
    assert publish_res.status_code == 200, f"Publish lot failed: {publish_res.text}"
    lot_data = publish_res.json()
    lot_id = lot_data["lot_id"]
    assert lot_data["status"] == "available"
    print(f"  -> PASS: Crop lot #{lot_id} submitted to Supabase crops_lots table ({qty_kg} kg @ INR {lot_data['price_per_kg']}/kg)")

    # -------------------------------------------------------------------------
    # 3. UNIFIED RECOMMENDATION RESULTS SCREEN
    # -------------------------------------------------------------------------
    print("\n[CHECK 3] Unified Recommendation Engine (Best Market + ML Price + Buyer Match)...")
    rec_res = client.get(f"/recommendations/unified?crop=Tomato&quantity={qty_kg}&quality={quality_grade}&location={farmer_loc}")
    assert rec_res.status_code == 200, f"Recommendation failed: {rec_res.text}"
    rec_data = rec_res.json()
    
    # 3a. Real ranked market & net profit
    assert rec_data["top_market"] is not None
    top_mkt = rec_data["top_market"]
    assert top_mkt["net_profit"] > 0
    assert top_mkt["expected_price_per_kg"] > 0
    assert top_mkt["transport_cost"] >= 0
    assert top_mkt["wastage_cost"] >= 0
    print(f"  -> PASS (Step 1): Top Mandi: {top_mkt['market']} (Net Profit: INR {top_mkt['net_profit']:,} / INR {top_mkt['net_profit_per_kg']}/kg)")

    # 3b. Real ML price trend
    assert "price_prediction" in rec_data
    pred = rec_data["price_prediction"]
    assert pred["current_price"] > 0
    assert len(pred["predicted_prices"]) == 3
    assert pred["price_trend"] in ["rising", "falling", "stable"]
    print(f"  -> PASS (Step 3): ML Price Forecast ({pred['model_type']}): Current INR {pred['current_price']}/kg -> Trend: '{pred['price_trend'].upper()}' ({pred['trend_advice']})")

    # 3c. Real ranked buyers
    assert "ranked_buyers" in rec_data
    buyers = rec_data["ranked_buyers"]
    assert len(buyers) > 0
    top_buyer = buyers[0]
    assert top_buyer["match_score"] > 0
    print(f"  -> PASS (Step 2): Ranked Buyers Match: Top Buyer '{top_buyer['name']}' ({top_buyer['match_score']}% match score)")

    # -------------------------------------------------------------------------
    # 4. BUYER MATCH SELECTION & TRANSACTION OFFER CREATION
    # -------------------------------------------------------------------------
    print("\n[CHECK 4] Selecting Buyer & Creating Transaction Offer in Supabase...")
    buyer_email = f"buyer_e2e_{uuid.uuid4().hex[:6]}@agriconnect.com"
    buyer_pass = "BuyerPass2026!"
    buyer_reg_res = client.post("/auth/register", json={
        "phone_or_email": buyer_email,
        "password_or_otp": buyer_pass,
        "role": "buyer",
        "name": "Nashik Agro Aggregators",
        "location": "Pimpalgaon APMC, Nashik, Maharashtra",
        "preferred_language": "mr"
    })
    assert buyer_reg_res.status_code == 200
    buyer_token = buyer_reg_res.json()["access_token"]
    buyer_headers = {"Authorization": f"Bearer {buyer_token}"}

    tx_res = client.post("/transactions", json={
        "lot_id": lot_id,
        "quantity": qty_kg
    }, headers=buyer_headers)
    assert tx_res.status_code == 200, f"Transaction creation failed: {tx_res.text}"
    tx_data = tx_res.json()
    tx_id = tx_data["id"]
    expected_total = qty_kg * 28.5 # 42,750.0
    assert tx_data["price"] == expected_total
    assert tx_data["payment_status"] == "held"
    print(f"  -> PASS: Transaction #{tx_id} written to Supabase transactions table (Total: INR {tx_data['price']:,}, Escrow: {tx_data['payment_status']})")

    # -------------------------------------------------------------------------
    # 5. PAYMENT CAPTURE & ESCROW HOLD (TEST MODE)
    # -------------------------------------------------------------------------
    print("\n[CHECK 5] Razorpay Escrow Payment Order Creation & Verification...")
    rzp_order_res = client.post("/payments/create-order", json={"transaction_id": tx_id}, headers=buyer_headers)
    assert rzp_order_res.status_code == 200
    rzp_order = rzp_order_res.json()
    assert rzp_order["amount"] == int(expected_total * 100) # Razorpay paisa format

    # Verify Payment Signature & Lock in Escrow
    rzp_verify_res = client.post("/payments/verify", json={
        "transaction_id": tx_id,
        "razorpay_order_id": rzp_order["id"],
        "razorpay_payment_id": f"pay_mock_e2e_{tx_id}",
        "razorpay_signature": "mock_sig_valid"
    }, headers=buyer_headers)
    assert rzp_verify_res.status_code == 200
    assert rzp_verify_res.json()["payment_status"] == "held"
    print(f"  -> PASS: Razorpay payment captured into Escrow (Payment ID: pay_mock_e2e_{tx_id}, Escrow Status: held)")

    # -------------------------------------------------------------------------
    # 6. MARK DELIVERED & REJECTION / DISPUTE FLOW
    # -------------------------------------------------------------------------
    print("\n[CHECK 6] Delivery Inspection & Buyer Rejection Flow...")
    # Simulate delivery arrival
    # Buyer rejects 150 kg due to transit bruising
    reject_res = client.post(f"/transactions/{tx_id}/reject", json={
        "reason": "quality_mismatch",
        "description": "150 kg crates bruised during transit, Grade A requirement not met.",
        "rejected_quantity_kg": 150.0,
        "photo_urls": ["https://qzblitdwibzwlzkasskp.supabase.co/storage/v1/object/public/dispute-evidence/sample.jpg"]
    }, headers=buyer_headers)
    assert reject_res.status_code == 200, f"Rejection failed: {reject_res.text}"
    dispute_data = reject_res.json()
    assert dispute_data["status"] == "open"
    assert dispute_data["rejected_quantity_kg"] == 150.0
    print(f"  -> PASS: Dispute #{dispute_data['dispute_id']} raised in Supabase disputes table (Reason: {dispute_data['reason']}, Status: open)")

    # -------------------------------------------------------------------------
    # 7. ADMIN DISPUTE RESOLUTION & SETTLEMENT
    # -------------------------------------------------------------------------
    print("\n[CHECK 7] Admin Dispute Investigation & Settlement...")
    admin_login_res = client.post("/auth/login", json={
        "phone_or_email": "+919999999999",
        "password_or_otp": "admin123",
        "role": "admin"
    })
    assert admin_login_res.status_code == 200
    admin_token = admin_login_res.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    resolve_res = client.post(f"/transactions/{tx_id}/dispute/resolve", json={
        "resolution": "partial_refund"
    }, headers=admin_headers)
    assert resolve_res.status_code == 200, f"Dispute resolution failed: {resolve_res.text}"
    resolved_info = resolve_res.json()
    assert resolved_info["resolution"] == "partial_refund"
    assert resolved_info["transaction_status"] == "paid"
    
    # 150 kg rejected out of 1500 kg = 10% refund (₹4,275), remainder released to farmer (₹38,475)
    assert resolved_info["refund_amount"] == 4275.0
    assert resolved_info["released_amount"] == 38475.0
    print(f"  -> PASS: Admin resolved dispute: INR {resolved_info['refund_amount']} refunded to buyer, INR {resolved_info['released_amount']} released to farmer.")

    print("\n" + "="*75)
    print("ALL 7 END-TO-END FUNCTIONAL CHECKS PASSED WITH ZERO ERRORS")
    print("="*75 + "\n")

if __name__ == "__main__":
    test_step5_complete_end_to_end_flow()
