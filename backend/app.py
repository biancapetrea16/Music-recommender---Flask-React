# backend/app.py

from flask import Flask
from flask_cors import CORS
from backend.config import Config
# Import db and bcrypt instances from the package's __init__.py
from backend import db, bcrypt 

def create_app(config_class=Config):
    """
    Application Factory Function.
    Creates and configures the Flask application instance.
    """
    app = Flask(__name__)
    # Load configuration from the Config object (from config.py)
    app.config.from_object(config_class)

    # Initialize extensions with the Flask app instance
    db.init_app(app)
    bcrypt.init_app(app) 
    
    # Initialize CORS (Cross-Origin Resource Sharing)
    # Allows requests from the React frontend (running on a different port)
    CORS(app) 

    # Import and register the Blueprint containing the API routes
    # This import is done *inside* the factory function to avoid circular imports
    from backend.routes import main_bp
    app.register_blueprint(main_bp) 

    # Return the configured Flask app instance
    return app

# This block runs only when the script is executed directly (e.g., python -m backend.app)
if __name__ == '__main__':
    # Create the Flask app instance using the factory
    app = create_app()

    # Create database tables if they don't exist
    # Use app.app_context() to ensure database operations have access to the app configuration
    with app.app_context():
        # This will check the database and create tables defined in models.py if needed
        db.create_all()
        print("Database tables created or already exist.") # English message
        
    # Run the Flask development server
    # debug=True enables automatic reloading on code changes and provides a debugger
    app.run(debug=True) # host='0.0.0.0' could be added to make it accessible on the network
