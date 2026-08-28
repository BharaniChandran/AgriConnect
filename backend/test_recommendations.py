import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_best_market_ranking_tomato():
    res = client.get("/recommendations/best-market?crop=Tomato&quantity=1000&farmer_location=Pimpalgaon, Nashik")
    assert res.status_code == 200, f"Error: {res.text}"
    data = res.json()
    
    assert data["crop"] == "Tomato"
    assert data["quantity_kg"] == 1000
    assert data["farmer_location"] == "Pimpalgaon, Nashik"
    assert "markets" in data
    assert len(data["markets"]) > 0
    
    markets = data["markets"]
    for i in range(len(markets) - 1):
        assert markets[i]["net_profit"] >= markets[i+1]["net_profit"]
    
    top_m = markets[0]
    assert "expected_price_per_kg" in top_m
    assert "distance_km" in top_m
    assert "transport_cost" in top_m
    assert "wastage_cost" in top_m
    assert "gross_revenue" in top_m
    assert "net_profit" in top_m
    assert "net_profit_per_kg" in top_m
    
    computed_net = round(top_m["gross_revenue"] - top_m["transport_cost"] - top_m["wastage_cost"], 2)
    assert abs(top_m["net_profit"] - computed_net) <= 0.05

def test_best_market_ranking_onion():
    res = client.get("/recommendations/best-market?crop=Onion&quantity=2500&farmer_location=Lasalgaon, Nashik")
    assert res.status_code == 200
    data = res.json()
    assert len(data["markets"]) >= 3
    assert data["top_market"] is not None

def test_best_market_validation_errors():
    res = client.get("/recommendations/best-market?crop=Tomato&quantity=-10&farmer_location=Nashik")
    assert res.status_code == 400
    
    res2 = client.get("/recommendations/best-market?crop=&quantity=100&farmer_location=Nashik")
    assert res2.status_code == 400

def test_buyer_match_ranking_tomato():
    res = client.get("/recommendations/buyer-match?crop=Tomato&quantity=1500&quality=Grade%20A&location=Pimpalgaon,%20Nashik")
    assert res.status_code == 200, f"Error: {res.text}"
    data = res.json()
    
    assert data["crop"] == "Tomato"
    assert data["quantity_kg"] == 1500
    assert data["quality"] == "Grade A"
    assert "buyers" in data
    assert len(data["buyers"]) > 0
    
    buyers = data["buyers"]
    # Check ranked by net_price_per_kg descending
    for i in range(len(buyers) - 1):
        assert buyers[i]["net_price_per_kg"] >= buyers[i+1]["net_price_per_kg"]
        
    top_buyer = buyers[0]
    assert "name" in top_buyer
    assert "location" in top_buyer
    assert "real_distance_km" in top_buyer
    assert "price_offered_per_kg" in top_buyer
    assert "net_price_per_kg" in top_buyer
    assert "net_payout" in top_buyer
    assert "distance_source" in top_buyer
    assert "match_score" in top_buyer
    assert "breakdown" in top_buyer
    assert 0 <= top_buyer["match_score"] <= 100

def test_buyer_match_radius_exclusion():
    # Pimpalgaon Nashik farmer with 60km radius should include local Nashik/Lasalgaon and exclude Nagpur (650km) and Kolhapur (400km)
    res = client.get("/recommendations/buyer-match?crop=Tomato&quantity=1500&location=Pimpalgaon,%20Nashik&radius_km=60")
    assert res.status_code == 200
    data = res.json()
    buyers = data["buyers"]
    
    # All returned buyers must be within 60km
    for b in buyers:
        assert b["real_distance_km"] <= 60.0
        assert "Nagpur" not in b["location"]
        assert "Kolhapur" not in b["location"]

def test_buyer_match_net_price_reordering():
    # Verify that ranking reorders by net price to farmer (price_offered - transport_cost - wastage_cost)
    res = client.get("/recommendations/buyer-match?crop=Tomato&quantity=1000&location=Pimpalgaon,%20Nashik&radius_km=500")
    assert res.status_code == 200
    buyers = res.json()["buyers"]
    assert len(buyers) >= 2
    
    for i in range(len(buyers) - 1):
        assert buyers[i]["net_price_per_kg"] >= buyers[i+1]["net_price_per_kg"]

def test_buyer_match_coordinate_parameters():
    # Pass explicit farmer_lat and farmer_lng for Nashik (20.1667, 73.9833)
    res = client.get("/recommendations/buyer-match?crop=Tomato&quantity=1200&farmer_lat=20.1667&farmer_lng=73.9833&radius_km=150")
    assert res.status_code == 200
    data = res.json()
    assert data["farmer_lat"] == 20.1667
    assert data["farmer_lng"] == 73.9833
    assert len(data["buyers"]) > 0

def test_buyer_match_validation_errors():
    res = client.get("/recommendations/buyer-match?crop=&quantity=500")
    assert res.status_code == 400
    
    res2 = client.get("/recommendations/buyer-match?crop=Tomato&quantity=-50")
    assert res2.status_code == 400

def test_price_prediction_serving_tomato():
    res = client.get("/predictions/price?crop=Tomato&market=Nashik%20(Pimpalgaon%20APMC)&days_ahead=3")
    assert res.status_code == 200, f"Error: {res.text}"
    data = res.json()
    
    assert data["crop"] == "Tomato"
    assert data["market"] == "Nashik (Pimpalgaon APMC)"
    assert "current_price" in data
    assert "predicted_prices" in data
    assert len(data["predicted_prices"]) == 3
    assert "price_trend" in data
    assert data["price_trend"] in ["rising", "falling", "stable"]
    assert "trend_advice" in data
    assert "mae_accuracy_inr" in data
    
    for p in data["predicted_prices"]:
        assert "day" in p
        assert "date" in p
        assert "predicted_price" in p
        assert p["predicted_price"] > 0

def test_price_prediction_onion_lasalgaon():
    res = client.get("/predictions/price?crop=Onion&market=Nashik%20(Lasalgaon%20APMC)&days_ahead=3")
    assert res.status_code == 200
    data = res.json()
    assert len(data["predicted_prices"]) == 3
    assert data["current_price"] > 0

def test_price_prediction_validation_errors():
    res = client.get("/predictions/price?crop=&market=Pune")
    assert res.status_code == 400
    
    res2 = client.get("/predictions/price?crop=Tomato&market=")
    assert res2.status_code == 400

def test_unified_recommendation_flow():
    res = client.get("/recommendations/unified?crop=Tomato&quantity=1500&quality=Grade%20A&location=Pimpalgaon,%20Nashik&radius_km=100")
    assert res.status_code == 200, f"Error: {res.text}"
    data = res.json()
    
    # 1. Best market data present
    assert data["top_market"] is not None
    assert "net_profit" in data["top_market"]
    assert data["top_market"]["net_profit"] > 0
    assert len(data["all_markets"]) > 1
    
    # 2. Price prediction data present
    assert "price_prediction" in data
    assert "predicted_prices" in data["price_prediction"]
    assert len(data["price_prediction"]["predicted_prices"]) == 3
    assert data["price_prediction"]["price_trend"] in ["rising", "falling", "stable"]
    assert "trend_advice" in data["price_prediction"]
    
    # 3. Ranked buyers present
    assert "ranked_buyers" in data
    assert len(data["ranked_buyers"]) > 0
    assert data["ranked_buyers"][0]["net_price_per_kg"] > 0
    
    # 4. Summary card present
    assert "summary" in data
    assert "best_market_name" in data["summary"]
    assert "expected_net_profit" in data["summary"]
    assert "trend_advice" in data["summary"]
    assert "top_buyer_name" in data["summary"]
