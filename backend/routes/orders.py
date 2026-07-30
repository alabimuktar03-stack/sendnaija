from flask import Blueprint, request, jsonify
import random

orders_bp = Blueprint('orders', __name__, url_prefix='/api')

@orders_bp.route('/quotes', methods=['POST'])
def get_quotes():
    """
    Week 1: Transparent Pricing
    Returns 3 fixed rider quotes for the given pickup and dropoff.
    """
    data = request.get_json()
    pickup = data.get('pickup')
    dropoff = data.get('dropoff')

    # Simple validation
    if not pickup or not dropoff:
        return jsonify({'error': 'Pickup and dropoff are required'}), 400

    # Generate 3 dummy quotes with random prices between ₦1,500 and ₦4,500
    # In the future, these will come from real riders
    riders = [
        {'name': 'Adebayo', 'vehicle': 'Bike', 'rating': 4.8},
        {'name': 'Chidi', 'vehicle': 'Van', 'rating': 4.5},
        {'name': 'Emeka', 'vehicle': 'Bike', 'rating': 4.9}
    ]

    quotes = []
    for rider in riders:
        price = random.randint(1500, 4500)
        # Round to nearest 100 for a cleaner look
        price = round(price / 100) * 100
        quotes.append({
            'rider_name': rider['name'],
            'vehicle': rider['vehicle'],
            'rating': rider['rating'],
            'price': price,
            'estimated_time': f"{random.randint(15, 45)} mins"
        })

    return jsonify({'quotes': quotes})