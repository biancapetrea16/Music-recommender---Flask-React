#from flask_sqlalchemy import SQLAlchemy
# 'db' va fi inițializat în app.py
from backend import db

#db = SQLAlchemy()

# Tabelul pentru Utilizatori
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    
    # Relație: un user poate avea multe favorite
    favorites = db.relationship('Favorite', backref='user', lazy=True)

# Tabelul pentru Piese Muzicale
class Song(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    artist = db.Column(db.String(100), nullable=False)
    genre = db.Column(db.String(50))
    # Aici poți adăuga coloane pentru ML: year, tempo, energy, etc.

# Tabelul de legătură (ce piese îi plac unui user)
class Favorite(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    song_id = db.Column(db.Integer, db.ForeignKey('song.id'), nullable=False)
