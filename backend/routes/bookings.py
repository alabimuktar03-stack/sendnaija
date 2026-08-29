from flask import Blueprint, request, jsonify
from datetime import datetime

bookings_bp = Blueprint('bookings', __name__, url_prefix='/api')

# In-memory booking storage (will reset when server restarts)
bookings = []
booking_counter = 1

@bookings_bp.route('/book', methods=['POST'])
def create_booking():
    """Create a new booking."""
    global booking_counter
    data = request.get_json()

    rider_id = data.get('rider_id')
    rider_name = data.get('rider_name')
    pickup = data.get('pickup')
    dropoff = data.get('dropoff')
    price = data.get('price')
    estimated_time = data.get('estimated_time')

    # Validate required fields
    if not all([rider_id, rider_name, pickup, dropoff, price]):
        return jsonify({'error': 'Missing required booking fields'}), 400

    # Create the booking record
    new_booking = {
        'id': booking_counter,
        'rider_id': rider_id,
        'rider_name': rider_name,
        'pickup': pickup,
        'dropoff': dropoff,
        'price': price,
        'estimated_time': estimated_time,
        'status': 'confirmed',  # 'confirmed', 'en_route', 'delivered', 'cancelled'
        'created_at': datetime.now().isoformat()
    }
    bookings.append(new_booking)
    booking_counter += 1

    return jsonify({
        'message': 'Booking confirmed!',
        'booking': new_booking
    }), 201

@bookings_bp.route('/bookings', methods=['GET'])
def list_bookings():
    """Get all bookings (for testing)."""
    return jsonify({'bookings': bookings})