from flask import Blueprint, request, jsonify
from backend.models import register_rider, get_online_riders

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new rider."""
    data = request.get_json()
    
    name = data.get('name')
    phone = data.get('phone')
    vehicle = data.get('vehicle')
    
    if not name or not phone or not vehicle:
        return jsonify({'error': 'Name, phone, and vehicle are required'}), 400
    
    result = register_rider(name, phone, vehicle)
    
    if result['success']:
        return jsonify({'message': 'Rider registered!', 'rider_id': result['rider_id']}), 201
    else:
        return jsonify({'error': result['error']}), 400

@auth_bp.route('/riders', methods=['GET'])
def list_riders():
    """Get all online riders."""
    riders = get_online_riders()
    return jsonify({'riders': riders})