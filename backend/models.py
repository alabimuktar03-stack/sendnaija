import sqlite3

DATABASE_PATH = 'database/sendnaija.db'

def get_db_connection():
    """Connect to the SQLite database."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Create the riders table."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS riders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT UNIQUE NOT NULL,
            vehicle TEXT NOT NULL,
            is_online INTEGER DEFAULT 1,
            rating REAL DEFAULT 4.5
        )
    ''')
    
    conn.commit()
    conn.close()
    print("✅ Database created successfully!")

def get_online_riders():
    """Fetch all riders who are online."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT id, name, vehicle, rating 
        FROM riders 
        WHERE is_online = 1
    ''')
    riders = cursor.fetchall()
    conn.close()
    return [dict(rider) for rider in riders]

def register_rider(name, phone, vehicle):
    """Register a new rider."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            INSERT INTO riders (name, phone, vehicle, is_online)
            VALUES (?, ?, ?, 1)
        ''', (name, phone, vehicle))
        conn.commit()
        rider_id = cursor.lastrowid
        conn.close()
        return {'success': True, 'rider_id': rider_id}
    except sqlite3.IntegrityError:
        conn.close()
        return {'success': False, 'error': 'Phone number already registered'}