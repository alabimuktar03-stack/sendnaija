from flask import Blueprint, request, jsonify
import random

# Create a Blueprint for job-related routes
jobs_bp = Blueprint('jobs', __name__, url_prefix='/api')

# Simulated rider pool (in a real app, this comes from a database)
rider_pool = [
    {'id': 1, 'name': 'Adebayo', 'vehicle': 'Bike', 'rating': 4.8},
    {'id': 2, 'name': 'Chidi', 'vehicle': 'Van', 'rating': 4.5},
    {'id': 3, 'name': 'Emeka', 'vehicle': 'Bike', 'rating': 4.9},
    {'id': 4, 'name': 'Fatima', 'vehicle': 'Car', 'rating': 4.7}
]

# In-memory job storage (resets when server restarts - fine for MVP)
jobs = []
job_counter = 1

@jobs_bp.route('/broadcast', methods=['POST'])
def broadcast_job():
    """
    Week 2: Instant Rider Broadcast
    Accepts a job, simulates notifying riders, and returns assigned riders.
    """
    global job_counter
    data = request.get_json()
    
    pickup = data.get('pickup')
    dropoff = data.get('dropoff')
    item = data.get('item', 'Package')  # Default to "Package" if not provided

    # Validate required fields
    if not pickup or not dropoff:
        return jsonify({'error': 'Pickup and dropoff locations are required'}), 400

    # Simulate: Randomly select 2 or 3 available riders from the pool
    num_riders = random.randint(2, 3)
    assigned_riders = random.sample(rider_pool, num_riders)

    # Create the job record
    new_job = {
        'id': job_counter,
        'pickup': pickup,
        'dropoff': dropoff,
        'item': item,
        'status': 'dispatched',  # 'pending', 'dispatched', 'delivered'
        'assigned_riders': assigned_riders
    }
    jobs.append(new_job)
    job_counter += 1

    # Return the job details and the assigned riders to the frontend
    return jsonify({
        'message': 'Job broadcasted successfully!',
        'job_id': new_job['id'],
        'riders': assigned_riders
    })