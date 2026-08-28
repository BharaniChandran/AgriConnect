"""
HeiGIT OpenRouteService (ORS) Matrix & Geocoding Service with Aggressive Caching & Haversine Fallback.
Provides road driving distances, travel durations, and geocoding for Maharashtra APMC farmers and buyers.
"""
import time
import math
import httpx
from typing import List, Tuple, Dict, Any, Optional
from config import settings

# 24-hour in-memory TTL distance cache: (src_lon, src_lat, dst_lon, dst_lat) -> (distance_km, duration_mins, timestamp)
_ORS_MATRIX_CACHE: Dict[Tuple[float, float, float, float], Tuple[float, float, float]] = {}
CACHE_TTL_SECONDS = 86400  # 24 Hours

# Maharashtra APMC & District Coordinates: name -> (latitude, longitude)
MH_COORDINATES: Dict[str, Tuple[float, float]] = {
    # Pilot District: Nashik
    "nashik": (19.9975, 73.7898),
    "pimpalgaon": (20.1667, 73.9833),
    "lasalgaon": (20.1472, 74.2256),
    "yeola": (20.0422, 74.4878),
    "malegaon": (20.5539, 74.5298),
    "sinnar": (19.8456, 73.9961),
    "dindori": (20.1983, 73.8344),
    "kalwan": (20.4900, 73.9700),
    "satana": (20.5894, 74.2044),
    "chandwad": (20.3275, 74.2403),
    
    # Major Maharashtra APMC Terminal & Regional Hubs
    "pune": (18.5204, 73.8567),
    "gultekdi": (18.4967, 73.8655),
    "manchar": (19.0064, 73.9458),
    "junnar": (19.2081, 73.8767),
    "shirur": (18.8282, 74.3756),
    "baramati": (18.1519, 74.5772),
    
    "mumbai": (19.0760, 72.8777),
    "vashi": (19.0771, 72.9986),
    "navi mumbai": (19.0330, 73.0297),
    "kalyan": (19.2403, 73.1305),
    "thane": (19.2183, 72.9781),
    "palghar": (19.6967, 72.7699),
    
    "nagpur": (21.1458, 79.0882),
    "kalamna": (21.1738, 79.1418),
    "amravati": (20.9374, 77.7796),
    "akola": (20.7002, 77.0082),
    "yavatmal": (20.3888, 78.1204),
    "wardha": (20.7453, 78.6022),
    
    "kolhapur": (16.7050, 74.2433),
    "shahu market": (16.7050, 74.2433),
    "sangli": (16.8524, 74.5815),
    "satara": (17.6805, 74.0183),
    "karad": (17.2867, 74.1833),
    "solapur": (17.6599, 75.9064),
    
    "ahmednagar": (19.0952, 74.7480),
    "shrirampur": (19.6175, 74.6561),
    "rahuri": (19.3900, 74.6500),
    "kopargaon": (19.8900, 74.4800),
    "sangamner": (19.5700, 74.2100),
    
    "jalgaon": (21.0077, 75.5626),
    "dhule": (20.9042, 74.7749),
    "nandurbar": (21.3700, 74.2400),
    "chhatrapati sambhajinagar": (19.8762, 75.3433),
    "aurangabad": (19.8762, 75.3433),
    "jalna": (19.8410, 75.8864),
    "nanded": (19.1383, 77.3210),
    "latur": (18.4088, 76.5604),
    "parbhani": (19.2608, 76.7748),
    "beed": (18.9891, 75.7601),
    "osmanabad": (18.1856, 76.0419),
    "dharashiv": (18.1856, 76.0419),
    "buldhana": (20.5292, 76.1843),
    "bhandara": (21.1713, 79.6542),
    "gondia": (21.4604, 80.1961),
    "chandrapur": (19.9615, 79.2961),
    "gadchiroli": (20.1809, 80.0034),
    "ratnagiri": (16.9902, 73.3120),
    "sindhudurg": (16.1167, 73.7000),
    "raigad": (18.5158, 73.1818)
}

def geocode_location_to_lat_lon(location_str: str) -> Tuple[float, float]:
    """
    Resolve address text to (latitude, longitude).
    Checks known Maharashtra APMC hub coordinates first, falls back to Nashik / Maharashtra center.
    """
    if not location_str:
        return (19.9975, 73.7898) # Default to Nashik, Maharashtra
        
    loc_lower = location_str.lower()
    for key, coords in MH_COORDINATES.items():
        if key in loc_lower:
            return coords
            
    # Default Maharashtra central coordinates (near Nashik / Pune corridor)
    return (19.7515, 75.7139)

def calculate_haversine_distance_km(
    origin_lat: float, origin_lon: float, 
    dest_lat: float, dest_lon: float
) -> float:
    """Great-circle distance with road-winding multiplier (1.25x)."""
    lat1, lon1 = math.radians(origin_lat), math.radians(origin_lon)
    lat2, lon2 = math.radians(dest_lat), math.radians(dest_lon)
    
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    r_km = 6371.0
    
    direct_dist = r_km * c
    road_dist = max(5.0, round(direct_dist * 1.25, 1))
    return road_dist

async def get_batch_matrix_distances(
    farmer_lat: float,
    farmer_lng: float,
    destinations: List[Tuple[float, float]] # List of (dest_lat, dest_lng)
) -> List[Dict[str, Any]]:
    """
    Calculates driving distances and travel durations from a single farmer location
    to a list of candidate buyer locations across Maharashtra.
    
    Uses OpenRouteService Matrix API with batching and 24-hour cache.
    Falls back gracefully to Haversine distance with 'distance_source: haversine_estimate'.
    """
    if not destinations:
        return []

    now = time.time()
    results: List[Optional[Dict[str, Any]]] = [None] * len(destinations)
    uncached_indices: List[int] = []

    # 1. Check cache for each destination
    f_lon_round, f_lat_round = round(farmer_lng, 4), round(farmer_lat, 4)
    for i, (d_lat, d_lng) in enumerate(destinations):
        d_lon_round, d_lat_round = round(d_lng, 4), round(d_lat, 4)
        cache_key = (f_lon_round, f_lat_round, d_lon_round, d_lat_round)
        
        if cache_key in _ORS_MATRIX_CACHE:
            cached_dist, cached_dur, cached_time = _ORS_MATRIX_CACHE[cache_key]
            if now - cached_time < CACHE_TTL_SECONDS:
                results[i] = {
                    "distance_km": cached_dist,
                    "duration_mins": cached_dur,
                    "distance_source": "openrouteservice_matrix (cached)"
                }
                continue
                
        uncached_indices.append(i)

    # 2. If all were cached, return immediately
    if not uncached_indices:
        return [r for r in results if r is not None]

    # 3. Call OpenRouteService Matrix API for uncached pairs
    api_key = settings.ORS_API_KEY or settings.MAPS_API_KEY
    ors_succeeded = False

    if api_key and not api_key.startswith("mock"):
        ors_locations = [[farmer_lng, farmer_lat]]
        for idx in uncached_indices:
            d_lat, d_lng = destinations[idx]
            ors_locations.append([d_lng, d_lat])

        ors_body = {
            "locations": ors_locations,
            "sources": [0],
            "destinations": list(range(1, len(ors_locations))),
            "metrics": ["distance", "duration"]
        }
        
        headers = {
            "Authorization": api_key,
            "Content-Type": "application/json"
        }
        url = "https://api.openrouteservice.org/v2/matrix/driving-car"

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(url, json=ors_body, headers=headers)
                if resp.status_code == 200:
                    matrix_data = resp.json()
                    distances = matrix_data.get("distances", [[]])[0]
                    durations = matrix_data.get("durations", [[]])[0]
                    
                    if distances and len(distances) == len(uncached_indices):
                        for j, idx in enumerate(uncached_indices):
                            dist_meters = distances[j]
                            dur_seconds = durations[j] if durations and j < len(durations) else 0.0
                            
                            dist_km = round(dist_meters / 1000.0, 1) if dist_meters is not None else calculate_haversine_distance_km(farmer_lat, farmer_lng, destinations[idx][0], destinations[idx][1])
                            dur_mins = round(dur_seconds / 60.0, 1) if dur_seconds is not None else round((dist_km / 45.0) * 60.0, 1)
                            
                            d_lat, d_lng = destinations[idx]
                            cache_key = (f_lon_round, f_lat_round, round(d_lng, 4), round(d_lat, 4))
                            _ORS_MATRIX_CACHE[cache_key] = (dist_km, dur_mins, now)
                            
                            results[idx] = {
                                "distance_km": dist_km,
                                "duration_mins": dur_mins,
                                "distance_source": "openrouteservice_matrix"
                            }
                        ors_succeeded = True
        except Exception as e:
            print(f"[ORS Matrix Service]: API request note: {e}. Utilizing haversine fallback.")

    # 4. Fallback to Haversine for any remaining uncached pairs
    if not ors_succeeded:
        for idx in uncached_indices:
            d_lat, d_lng = destinations[idx]
            dist_km = calculate_haversine_distance_km(farmer_lat, farmer_lng, d_lat, d_lng)
            dur_mins = round((dist_km / 45.0) * 60.0, 1)
            
            results[idx] = {
                "distance_km": dist_km,
                "duration_mins": dur_mins,
                "distance_source": "haversine_estimate"
            }

    return [r for r in results if r is not None]
