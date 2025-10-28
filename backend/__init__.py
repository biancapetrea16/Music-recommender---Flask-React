# backend/__init__.py

# This file makes the 'backend' directory a Python package.
# It's also a convenient place to initialize Flask extensions that need to be shared across modules,
# preventing circular imports when using the Application Factory pattern.

from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

# Initialize SQLAlchemy instance globally, but without attaching it to a specific app yet.
# It will be initialized with the Flask app instance inside the create_app factory.
db = SQLAlchemy()

# Initialize Bcrypt instance globally.
# This will handle password hashing and checking.
bcrypt = Bcrypt()
