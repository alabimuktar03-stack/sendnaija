import os
from flask import Flask, render_template
from .config import Config

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_FOLDER = os.path.join(BASE_DIR, 'frontend')
TEMPLATE_FOLDER = os.path.join(BASE_DIR, 'backend', 'templates')

app = Flask(__name__, 
            template_folder=TEMPLATE_FOLDER,
            static_folder=STATIC_FOLDER,
            static_url_path='/static')

app.config.from_object(Config)

from .routes.orders import orders_bp
from .routes.jobs import jobs_bp
from .routes.auth import auth_bp
from .routes.bookings import bookings_bp   # <-- NEW

app.register_blueprint(orders_bp)
app.register_blueprint(jobs_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(bookings_bp)   # <-- NEW

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)