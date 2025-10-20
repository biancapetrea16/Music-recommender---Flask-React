from flask import Flask
from backend.config import Config
from backend.models import db, User, Song, Favorite
# routes va fi importat mai târziu, în Pasul 2

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Inițializează baza de date cu aplicația Flask
    db.init_app(app)

    # Aici se pot înregistra Blueprint-uri pentru routes.py (Pasul 2)
    # from backend.routes import main_bp
    # app.register_blueprint(main_bp)

    return app

if __name__ == '__main__':
    app = create_app()

    # Creează tabelele în baza de date la prima rulare (IMPORTANT)
    with app.app_context():
        db.create_all()
        print("Tabelele bazei de date au fost create sau sunt deja existente.")
        
    app.run(debug=True)
