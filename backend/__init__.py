# backend/__init__.py

from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

# Inițializează instanțele, dar nu le atașa la nicio aplicație (Factory Pattern)
db = SQLAlchemy()
bcrypt = Bcrypt()