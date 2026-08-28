"""
AgriConnect Recommendations Engine (Tamil Nadu Pilot)
Implements deterministic ranking for best markets and buyer matches.
"""
import math
import re
from typing import List, Dict, Any, Optional
from database import get_supabase_admin_client

# Spoilage rates per 100km by crop type
SPOILAGE_RATES: Dict[str, float] = {
    "tomato": 0.12,          # High perishability: 12% loss per 100km
    "tomato (roma)": 0.11,
    "tomato (roma hybrid)": 0.11,
    "green chilli": 0.08,
    "chilli green": 0.08,
    "banana": 0.07,
    "brinjal": 0.06,
    "mango": 0.06,
    "drumstick": 0.05,
    "cabbage": 0.05,
    "carrot": 0.04,
    "potato": 0.02,
    "onion": 0.02,
    "red onion": 0.02,
    "red onion (bellary)": 0.02,
    "turmeric": 0.01,
    "paddy": 0.01,
    "paddy (ponni)": 0.01,
    "rice": 0.01,
}
DEFAULT_SPOILAGE_RATE = 0.05
PER_KM_TRANSPORT_RATE_INR = 15.0  # ₹15/km flat rate

BASE_MANDI_PRICES: Dict[str, float] = {
    "tomato": 28.0,
    "onion": 32.5,
    "potato": 24.0,
    "brinjal": 26.0,
    "drumstick": 45.0,
    "carrot": 38.0,
    "cabbage": 18.0,
    "banana": 22.0,
    "chilli green": 42.0,
    "turmeric": 115.0,
    "paddy": 23.0
}


# Approximate geographic coordinates for Maharashtra APMCs and districts
MH_HUB_COORDINATES: Dict[str, tuple[float, float]] = {
    "nashik": (19.9975, 73.7898),
    "pimpalgaon": (20.1667, 73.9833),
    "lasalgaon": (20.1472, 74.2256),
    "pune": (18.5204, 73.8567),
    "gultekdi": (18.4967, 73.8655),
    "mumbai": (19.0760, 72.8777),
    "vashi": (19.0771, 72.9986),
    "navi mumbai": (19.0330, 73.0297),
    "nagpur": (21.1458, 79.0882),
    "kalamna": (21.1738, 79.1418),
    "kolhapur": (16.7050, 74.2433),
    "sangli": (16.8524, 74.5815),
    "solapur": (17.6599, 75.9064),
    "ahmednagar": (19.0952, 74.7480),
    "jalgaon": (21.0077, 75.5626),
    "chhatrapati sambhajinagar": (19.8762, 75.3433),
    "aurangabad": (19.8762, 75.3433),
    "satara": (17.6805, 74.0183),
    "amravati": (20.9374, 77.7796),
    "latur": (18.4088, 76.5604),
    "akola": (20.7002, 77.0082),
    "dhule": (20.9042, 74.7749),
    "yeola": (20.0422, 74.4878),
    "malegaon": (20.5539, 74.5298)
}

def extract_hub_coords(location_str: str) -> tuple[float, float]:
    """Find matching Maharashtra APMC hub coordinates from location string."""
    loc_lower = location_str.lower()
    for key, coords in MH_HUB_COORDINATES.items():
        if key in loc_lower:
            return coords
    # Default to Nashik, Maharashtra
    return (19.9975, 73.7898)

def calculate_haversine_distance_km(coord1: tuple[float, float], coord2: tuple[float, float]) -> float:
    """Calculate great-circle distance between two GPS coordinates with road-winding factor (1.25x)."""
    lat1, lon1 = math.radians(coord1[0]), math.radians(coord1[1])
    lat2, lon2 = math.radians(coord2[0]), math.radians(coord2[1])
    
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    r_km = 6371.0 # Earth radius in km
    
    direct_dist = r_km * c
    road_dist = max(10.0, round(direct_dist * 1.25, 1))
    return road_dist

def get_crop_spoilage_rate(crop_name: str) -> float:
    """Return spoilage rate per 100km for a given crop."""
    crop_lower = crop_name.lower().strip()
    for key, rate in SPOILAGE_RATES.items():
        if key in crop_lower:
            return rate
    return DEFAULT_SPOILAGE_RATE

async def calculate_best_markets(
    crop: str, 
    quantity: float, 
    farmer_location: str,
    per_km_rate: float = PER_KM_TRANSPORT_RATE_INR
) -> List[Dict[str, Any]]:
    """
    Step 1: Best-market ranking (Rule-based deterministic formula)
    net_profit = gross_revenue - transport_cost - wastage_cost
    Pulls candidate Maharashtra APMC markets from Supabase market_prices table.
    """
    if quantity <= 0:
        raise ValueError("Quantity must be greater than 0 kg")
        
    farmer_coords = extract_hub_coords(farmer_location)
    spoilage_rate = get_crop_spoilage_rate(crop)
    
    # Query candidate prices from Supabase market_prices table
    admin_client = get_supabase_admin_client()
    crop_clean = crop.split("(")[0].strip()
    
    try:
        res = admin_client.table("market_prices").select("*").ilike("crop", f"%{crop_clean}%").order("date", desc=True).execute()
        price_rows = res.data or []
    except Exception as e:
        print(f"[Best-Market Ranking]: Supabase market_prices query note: {e}")
        price_rows = []

    # If no matching crop found with specific name, fallback query all recent rows
    if not price_rows:
        try:
            res_all = admin_client.table("market_prices").select("*").order("date", desc=True).limit(50).execute()
            price_rows = res_all.data or []
        except Exception:
            price_rows = []

    # Deduplicate candidate markets: take the most recent price per market for this crop
    latest_by_market: Dict[str, Dict[str, Any]] = {}
    for row in price_rows:
        m_name = row["market"]
        if m_name not in latest_by_market:
            latest_by_market[m_name] = row
            
    # If still no markets from DB, construct fallback from known Maharashtra APMC mandis
    if not latest_by_market:
        latest_by_market = {
            "Nashik (Pimpalgaon APMC)": {"market": "Nashik (Pimpalgaon APMC)", "crop": crop, "price": 28.5, "arrival": 1400.0},
            "Mumbai (Vashi APMC)": {"market": "Mumbai (Vashi APMC)", "crop": crop, "price": 36.0, "arrival": 1800.0},
            "Pune (Gultekdi APMC)": {"market": "Pune (Gultekdi APMC)", "crop": crop, "price": 32.0, "arrival": 850.0},
            "Nashik (Lasalgaon APMC)": {"market": "Nashik (Lasalgaon APMC)", "crop": crop, "price": 31.0, "arrival": 3200.0},
            "Nagpur (Kalamna APMC)": {"market": "Nagpur (Kalamna APMC)", "crop": crop, "price": 29.0, "arrival": 720.0},
            "Kolhapur (Shahu Market APMC)": {"market": "Kolhapur (Shahu Market APMC)", "crop": crop, "price": 30.0, "arrival": 480.0},
            "Sangli (Market Yard APMC)": {"market": "Sangli (Market Yard APMC)", "crop": crop, "price": 142.0, "arrival": 1100.0}
        }


    results = []
    for market_name, m_data in latest_by_market.items():
        market_coords = extract_hub_coords(market_name)
        distance_km = calculate_haversine_distance_km(farmer_coords, market_coords)
        
        # If farmer is in the same mandi town, minimum local transport applies
        if any(tok in farmer_location.lower() for tok in market_name.lower().replace("(", " ").replace(")", " ").split() if len(tok) > 3):
            distance_km = min(distance_km, 12.0)
            
        expected_price_per_kg = float(m_data.get("price", 30.0))
        arrival_volume = float(m_data.get("arrival", 0))
        
        # 1. Gross Revenue
        gross_revenue = expected_price_per_kg * quantity
        
        # 2. Transport Cost: distance_km * per_km_rate
        transport_cost = distance_km * per_km_rate
        
        # 3. Wastage Cost: quantity_kg * spoilage_rate * (distance_km / 100) in kg, multiplied by expected price
        wastage_kg = quantity * spoilage_rate * (distance_km / 100.0)
        wastage_cost = wastage_kg * expected_price_per_kg
        
        # 4. Net Profit
        net_profit = gross_revenue - transport_cost - wastage_cost
        net_profit_per_kg = net_profit / quantity
        
        results.append({
            "market": market_name,
            "crop": m_data.get("crop", crop),
            "expected_price_per_kg": round(expected_price_per_kg, 2),
            "quantity_kg": quantity,
            "distance_km": round(distance_km, 1),
            "transport_cost": round(transport_cost, 2),
            "wastage_kg": round(wastage_kg, 2),
            "wastage_cost": round(wastage_cost, 2),
            "spoilage_rate_pct": round(spoilage_rate * 100, 1),
            "gross_revenue": round(gross_revenue, 2),
            "net_profit": round(net_profit, 2),
            "net_profit_per_kg": round(net_profit_per_kg, 2),
            "arrival_volume_quintals": arrival_volume
        })
        
    # Rank candidate markets by net_profit, descending
    results.sort(key=lambda x: x["net_profit"], reverse=True)
    return results


async def calculate_buyer_matches(
    crop: str,
    quantity: float,
    quality: str = "Grade A",
    location: str = "Nashik, Maharashtra",
    farmer_lat: Optional[float] = None,
    farmer_lng: Optional[float] = None,
    radius_km: float = 100.0,
    price_per_kg: Optional[float] = None,
    w1: float = 0.4,
    w2: float = 0.2,
    w3: float = 0.2,
    w4: float = 0.2
) -> List[Dict[str, Any]]:
    """
    Step 2 & Extension: Buyer matching with real OpenRouteService road distance,
    radius filtering, and net-price ranking (accounting for transport cost & wastage).
    """
    if quantity <= 0:
        raise ValueError("Quantity must be greater than 0 kg")
        
    import ors_service
    
    # 1. Resolve farmer coordinates
    if farmer_lat is not None and farmer_lng is not None:
        f_lat, f_lng = float(farmer_lat), float(farmer_lng)
    else:
        f_lat, f_lng = ors_service.geocode_location_to_lat_lon(location)
        
    crop_clean = crop.lower().strip()
    quality_clean = quality.strip()
    
    # Base commodity price for buyer offered pricing
    base_crop_price = price_per_kg or BASE_MANDI_PRICES.get(
        next((k for k in BASE_MANDI_PRICES if k.lower() in crop_clean), "Tomato"), 
        28.0
    )
    
    admin_client = get_supabase_admin_client()
    try:
        res = admin_client.table("buyers").select("*").execute()
        buyers_data = res.data or []
    except Exception as e:
        print(f"[Buyer Matching]: Supabase buyers query note: {e}")
        buyers_data = []
        
    # Standard Maharashtra APMC network registered buyers
    mh_default_buyers = [
        {"id": "buyer-nashik-1", "name": "Nashik Agro Aggregators", "location": "Pimpalgaon APMC, Nashik", "phone": "+919822010101", "preferred_language": "mr", "latitude": 20.1667, "longitude": 73.9833},
        {"id": "buyer-lasalgaon-1", "name": "Lasalgaon Onion & Veg Traders", "location": "Lasalgaon APMC, Nashik", "phone": "+919822010102", "preferred_language": "mr", "latitude": 20.1472, "longitude": 74.2256},
        {"id": "buyer-pune-1", "name": "Pune Gultekdi Wholesalers", "location": "Gultekdi APMC, Pune", "phone": "+919822010103", "preferred_language": "mr", "latitude": 18.4967, "longitude": 73.8655},
        {"id": "buyer-mumbai-1", "name": "Mumbai Vashi Fresh Grocers Ltd", "location": "Vashi APMC, Navi Mumbai", "phone": "+919820012345", "preferred_language": "en", "latitude": 19.0771, "longitude": 72.9986},
        {"id": "buyer-nagpur-1", "name": "Nagpur Kalamna Citrus & Agro Corp", "location": "Kalamna APMC, Nagpur", "phone": "+919822010104", "preferred_language": "mr", "latitude": 21.1738, "longitude": 79.1418},
        {"id": "buyer-kolhapur-1", "name": "Kolhapur Shahu Market Buyers", "location": "Shahu Market Yard, Kolhapur", "phone": "+919822010105", "preferred_language": "mr", "latitude": 16.7050, "longitude": 74.2433},
        {"id": "buyer-sangli-1", "name": "Sangli Spices & Turmeric Traders", "location": "Market Yard, Sangli", "phone": "+919822010106", "preferred_language": "mr", "latitude": 16.8524, "longitude": 74.5815}
    ]

    # Deduplicate buyers by name/location
    unique_buyers = {}
    for b in mh_default_buyers:
        key = (b.get("name", ""), b.get("location", ""))
        unique_buyers[key] = b

    for b in buyers_data:
        key = (b.get("name", ""), b.get("location", ""))
        unique_buyers[key] = b
            
    buyers_list = list(unique_buyers.values())



    # 2. Extract buyer coordinates and batch lookup ORS Matrix distances
    buyer_coords_list = []
    for b in buyers_list:
        b_lat = b.get("latitude")
        b_lng = b.get("longitude")
        if b_lat is None or b_lng is None:
            b_lat, b_lng = ors_service.geocode_location_to_lat_lon(b.get("location", ""))
            b["latitude"], b["longitude"] = b_lat, b_lng
        buyer_coords_list.append((float(b_lat), float(b_lng)))

    # Batch distance lookup from single origin (farmer) to all candidate destinations
    matrix_results = await ors_service.get_batch_matrix_distances(f_lat, f_lng, buyer_coords_list)

    matched_buyers = []
    spoilage_rate = SPOILAGE_RATES.get(
        next((k for k in SPOILAGE_RATES if k.lower() in crop_clean), "tomato"), 
        0.012
    )

    for i, b in enumerate(buyers_list):
        b_name = b.get("name", "Registered Buyer")
        b_location = b.get("location", "Tamil Nadu")
        b_name_lower = b_name.lower()
        
        matrix_info = matrix_results[i] if i < len(matrix_results) else {
            "distance_km": 50.0,
            "duration_mins": 65.0,
            "distance_source": "haversine_estimate"
        }
        
        dist_km = matrix_info["distance_km"]
        dur_mins = matrix_info["duration_mins"]
        dist_source = matrix_info["distance_source"]

        # Filter by radius: drop any buyer whose real driving distance exceeds radius_km
        # (If strict radius filters all, we will flag is_within_radius)
        is_in_radius = dist_km <= float(radius_km)
        if not is_in_radius and radius_km > 0:
            continue

        # Buyer Headline / Offered Price
        # Premium organic/fresh grocer pays premium (+₹4 to ₹6/kg), wholesaler (+₹1 to ₹2.5/kg), aggregator (+₹0.5 to ₹1.5/kg)
        if any(k in b_name_lower for k in ["grocer", "fresh", "organics", "super"]):
            price_offered = round(base_crop_price * 1.15, 2) # +15% premium
        elif any(k in b_name_lower for k in ["corp", "wholesal", "ltd"]):
            price_offered = round(base_crop_price * 1.08, 2) # +8% premium
        else:
            price_offered = round(base_crop_price * 1.03, 2) # +3% premium

        # Transport & Wastage cost calculations (Reusing same formula: ₹15/km flat transport)
        transport_cost_total = round(dist_km * 15.0, 2)
        transport_cost_per_kg = round(transport_cost_total / quantity, 2)
        
        wastage_kg = round(quantity * spoilage_rate * (dist_km / 100.0), 2)
        wastage_cost_total = round(wastage_kg * price_offered, 2)
        wastage_cost_per_kg = round(wastage_cost_total / quantity, 2)
        
        gross_revenue = round(quantity * price_offered, 2)
        net_payout = round(gross_revenue - transport_cost_total - wastage_cost_total, 2)
        net_price_per_kg = round(net_payout / quantity, 2)

        # 1. w1: Crop Match (0 to 1)
        is_spice = any(s in crop_clean for s in ["turmeric", "chilli", "pepper", "clove", "cardamom"])
        is_veg = any(v in crop_clean for v in ["tomato", "onion", "potato", "brinjal", "cabbage", "carrot", "drumstick"])
        is_fruit = any(f in crop_clean for f in ["banana", "mango", "papaya", "guava", "apple"])
        is_grain = any(g in crop_clean for g in ["paddy", "rice", "wheat", "millet", "maize"])

        if is_spice:
            crop_match = 1.0 if any(k in b_name_lower for k in ["spice", "corp", "traders"]) else 0.5
        elif is_veg:
            crop_match = 1.0 if any(k in b_name_lower for k in ["veg", "grocer", "fresh", "mandi", "wholesal", "market"]) else 0.6
        elif is_fruit:
            crop_match = 1.0 if any(k in b_name_lower for k in ["fruit", "fresh", "grocer", "mart"]) else 0.6
        elif is_grain:
            crop_match = 1.0 if any(k in b_name_lower for k in ["miller", "grain", "agro", "traders"]) else 0.5
        else:
            crop_match = 0.8

        # 2. w2: Quantity Fit (0 to 1)
        target_qty = 2000.0 if any(k in b_name_lower for k in ["wholesal", "aggregator", "corp", "ltd"]) else 800.0
        qty_ratio = min(quantity, target_qty) / max(quantity, target_qty)
        quantity_fit = max(0.3, round(0.5 + 0.5 * qty_ratio, 2))

        # 3. w3: Quality Match (0 to 1)
        if "Grade A" in quality_clean or "A" == quality_clean:
            quality_match = 1.0 if any(k in b_name_lower for k in ["fresh", "grocer", "mart", "organics", "super"]) else 0.85
        elif "Grade B" in quality_clean or "B" == quality_clean:
            quality_match = 1.0 if any(k in b_name_lower for k in ["wholesal", "aggregator", "mandi", "trader"]) else 0.8
        else:
            quality_match = 0.75

        # 4. w4: Location Proximity (0 to 1)
        location_proximity = max(0.1, round(1.0 - (dist_km / 450.0), 2)) if dist_km <= 450.0 else 0.1

        # Composite match score
        composite_score = (w1 * crop_match) + (w2 * quantity_fit) + (w3 * quality_match) + (w4 * location_proximity)
        match_score_pct = round(composite_score * 100, 1)

        matched_buyers.append({
            "buyer_id": b.get("id"),
            "name": b_name,
            "location": b_location,
            "latitude": b.get("latitude"),
            "longitude": b.get("longitude"),
            "phone": b.get("phone", "+919443100000"),
            "preferred_language": b.get("preferred_language", "ta"),
            "price_offered_per_kg": price_offered,
            "real_distance_km": round(dist_km, 1),
            "estimated_travel_time_mins": round(dur_mins, 1),
            "transport_cost": transport_cost_total,
            "transport_cost_per_kg": transport_cost_per_kg,
            "wastage_cost": wastage_cost_total,
            "gross_revenue": gross_revenue,
            "net_price_per_kg": net_price_per_kg,
            "net_payout": net_payout,
            "match_score": min(99.0, max(40.0, match_score_pct)),
            "distance_source": dist_source,
            "is_within_radius": True,
            "breakdown": {
                "crop_match": round(crop_match, 2),
                "quantity_fit": round(quantity_fit, 2),
                "quality_match": round(quality_match, 2),
                "location_proximity": round(location_proximity, 2)
            }
        })

    # Rank by net_price_per_kg / net_payout descending (Who nets the farmer the most money)
    matched_buyers.sort(key=lambda x: x["net_price_per_kg"], reverse=True)
    return matched_buyers



async def calculate_unified_recommendation(
    crop: str,
    quantity: float,
    quality: str = "Grade A",
    location: str = "Nashik, Maharashtra",
    farmer_lat: Optional[float] = None,
    farmer_lng: Optional[float] = None,
    radius_km: float = 100.0,
    price_per_kg: Optional[float] = None
) -> Dict[str, Any]:
    """
    Step 4: Unified Farmer Recommendation Engine
    Combines:
      - Step 1: Best-market deterministic ranking
      - Step 2: Buyer match ranking with ORS distance & net price ranking
      - Step 3: Autoregressive ML price forecasting
    """
    # 1. Best Market Ranking
    ranked_markets = await calculate_best_markets(crop, quantity, location)
    top_market_data = ranked_markets[0] if ranked_markets else None
    top_market_name = top_market_data["market"] if top_market_data else "Nashik (Pimpalgaon APMC)"
    
    # 2. Buyer Match Ranking
    ranked_buyers = await calculate_buyer_matches(
        crop=crop,
        quantity=quantity,
        quality=quality,
        location=location,
        farmer_lat=farmer_lat,
        farmer_lng=farmer_lng,
        radius_km=radius_km,
        price_per_kg=price_per_kg
    )
    
    # 3. Price Prediction for Top Market
    import predictor
    prediction = await predictor.predict_crop_price(crop, top_market_name, days_ahead=3)
    
    return {
        "crop": crop,
        "quantity_kg": quantity,
        "quality": quality,
        "location": location,
        "radius_km": radius_km,
        "farmer_lat": farmer_lat,
        "farmer_lng": farmer_lng,
        "top_market": top_market_data,
        "all_markets": ranked_markets,
        "price_prediction": prediction,
        "ranked_buyers": ranked_buyers,
        "summary": {
            "best_market_name": top_market_name,
            "expected_net_profit": top_market_data["net_profit"] if top_market_data else 0.0,
            "net_profit_per_kg": top_market_data["net_profit_per_kg"] if top_market_data else 0.0,
            "price_trend": prediction.get("price_trend", "stable"),
            "price_change_pct": prediction.get("price_change_pct", 0.0),
            "trend_advice": prediction.get("trend_advice", "Price is stable."),
            "top_buyer_name": ranked_buyers[0]["name"] if ranked_buyers else None,
            "top_buyer_score": ranked_buyers[0]["match_score"] if ranked_buyers else 0.0,
            "top_buyer_net_price": ranked_buyers[0]["net_price_per_kg"] if ranked_buyers else 0.0
        }
    }



