import os
import requests
from flask import Blueprint, request, jsonify
from backend.models import get_online_riders

orders_bp = Blueprint('orders', __name__, url_prefix='/api')

# Load Google Maps API Key from .env
API_KEY = os.getenv('GOOGLE_MAPS_API_KEY')

# Pricing Configuration
PRICE_PER_KM = 200  # ₦200 per kilometer
BASE_FEE = 200      # ₦200 base fee

def get_distance_and_duration(origin, destination):
    """
    Calls the NEW Google Routes API to get distance and duration.
    This replaces the old legacy Distance Matrix API.
    """
    if not API_KEY:
        print("❌ ERROR: GOOGLE_MAPS_API_KEY is not set in .env file!")
        return None, None

    # Clean up locations
    origin = origin.strip()
    destination = destination.strip()

    # The NEW API endpoint (not legacy)
    url = "https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix"

    # Required headers for the new API
    headers = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'originIndex,destinationIndex,duration,distanceMeters,status'
    }

    # Request body for the new API
    payload = {
        "origins": [{"waypoint": {"address": origin}}],
        "destinations": [{"waypoint": {"address": destination}}],
        "travelMode": "DRIVE"
    }

    print(f"📡 Calling Google Routes API: {origin} → {destination}")

    try:
        response = requests.post(url, json=payload, headers=headers)
        data = response.json()

        # The new API returns a list of results
        if isinstance(data, list) and len(data) > 0:
            element = data[0]
            
            # Check if the route was found
            if element.get('status') == 'OK':
                distance_meters = element.get('distanceMeters')
                duration_seconds = element.get('duration')
                
                if distance_meters and duration_seconds:
                    distance_km = round(distance_meters / 1000, 1)
                    minutes = int(duration_seconds // 60)
                    duration_text = f"{minutes} mins"
                    print(f"✅ Distance: {distance_km} km, Duration: {duration_text}")
                    return distance_km, duration_text
                else:
                    print(f"⚠️ Missing distance or duration data")
                    return None, None
            else:
                print(f"⚠️ Element Status: {element.get('status')}")
                return None, None
        else:
            # Check for error in response
            error_msg = data.get('error', {}).get('message', 'Unknown error')
            print(f"⚠️ API Error: {error_msg}")
            print(f"📦 Full Response: {data}")
            return None, None

    except Exception as e:
        print(f"❌ Error calling Google Routes API: {e}")
        return None, None

def calculate_price(distance_km):
    """Calculate delivery price: (distance × ₦200) + ₦200 base fee."""
    raw_price = (distance_km * PRICE_PER_KM) + BASE_FEE
    return round(raw_price / 100) * 100

@orders_bp.route('/quotes', methods=['POST'])
def get_quotes():
    data = request.get_json()
    pickup = data.get('pickup')
    dropoff = data.get('dropoff')

    if not pickup or not dropoff:
        return jsonify({'error': 'Pickup and dropoff are required'}), 400

    # 1. Get distance using Google Routes API
    distance_km, duration_text = get_distance_and_duration(pickup, dropoff)

    # Fallback: If Google API fails, use a default distance for testing
    if distance_km is None:
        print("⚠️ Google API failed. Using fallback distance: 10.0 km for testing.")
        distance_km = 10.0
        duration_text = "25 mins"
        # If you want to strictly require Google Maps, uncomment the lines below:
        # return jsonify({
        #     'error': 'Could not calculate distance. Please check your locations.',
        #     'quotes': []
        # }), 404

    # 2. Fetch online riders from database
    real_riders = get_online_riders()

    if not real_riders:
        return jsonify({
            'error': 'No riders are currently online. Please try again later.',
            'quotes': []
        }), 404

    # 3. Calculate fixed price
    final_price = calculate_price(distance_km)

    # 4. Generate quotes (same price for all riders)
    quotes = []
    selected_riders = real_riders[:3]  # Show first 3 online riders

    for rider in selected_riders:
        quotes.append({
            'rider_id': rider['id'],
            'rider_name': rider['name'],
            'vehicle': rider['vehicle'],
            'rating': rider['rating'],
            'price': final_price,
            'distance': f"{distance_km} km",
            'estimated_time': duration_text
        })

    return jsonify({
        'quotes': quotes,
        'route_info': {
            'distance': f"{distance_km} km",
            'duration': duration_text
        }
    })