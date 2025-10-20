# backend/app.py (Versiunea Corectată)

from flask import Flask
from flask_cors import CORS
from backend.config import Config
# 1. Importăm direct din noul __init__.py
from backend import db, bcrypt 


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # 2. Inițializează extensiile cu aplicația
    db.init_app(app)
    bcrypt.init_app(app) 
    CORS(app) 

    # 3. Mutăm importul routes AICI (pentru a evita ciclul)
    from backend.routes import main_bp
    app.register_blueprint(main_bp) 

    return app

if __name__ == '__main__':
    app = create_app()

    # Creează tabelele în baza de date la prima rulare
    with app.app_context():
        # ... restul codului ...
        db.create_all()
        print("Tabelele bazei de date au fost create sau sunt deja existente.")
        
    app.run(debug=True)