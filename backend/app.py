from flask import Flask, render_template
from .config import Config

# Import your blueprints
from .routes.orders import orders_bp
from .routes.jobs import jobs_bp   # <-- NEW

app = Flask(__name__, 
            template_folder='templates',
            static_folder='../frontend',
            static_url_path='/static')

app.config.from_object(Config)

# Register the blueprints
app.register_blueprint(orders_bp)
app.register_blueprint(jobs_bp)   # <-- NEW

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)