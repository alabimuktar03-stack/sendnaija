from flask import Flask, render_template
from .config import Config   # <-- This line is fixed

app = Flask(__name__, 
            template_folder='templates',
            static_folder='../frontend',
            static_url_path='/static')

app.config.from_object(Config)

# Import and register our routes
from .routes.orders import orders_bp   # <-- ALSO fix this line (add a dot)
app.register_blueprint(orders_bp)

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)