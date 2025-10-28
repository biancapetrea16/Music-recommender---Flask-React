import os

class Config:
    """
    Configuration class for the Flask application.
    Loads settings from environment variables or uses default values.
    """
    # Secret key for session management, CSRF protection, etc.
    # It's important to use a strong, unique secret key in production, loaded from environment variables.
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'a_very_long_and_secret_default_key' 
    
    # Database connection URI
    # Format: postgresql://username:password@host:port/database_name
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'postgresql://user1:parola1@localhost/recommender_db'
        
    # Disable modification tracking for SQLAlchemy, as it's often not needed and consumes resources.
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # You can add other configurations here, like mail server settings, etc.
