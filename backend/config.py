import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'o_cheie_foarte_secreta_si_lunga' 
    # Setează o cheie secretă complexă pentru producție!

    # Adresa bazei de date (schimbă datele cu cele folosite la Pasul 3)
    SQLALCHEMY_DATABASE_URI = 'postgresql://user1:parola1@localhost/recommender_db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
