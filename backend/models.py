from backend import db

# User model remains the same
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    favorites = db.relationship('Favorite', backref='user', lazy=True)

# Song model updated for the new dataset
class Song(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False) 
    artist = db.Column(db.String(255), nullable=False)
    # >>>>> INCLUDE GENRE COLUMN <<<<<
    genre = db.Column(db.String(100)) # Based on playlist_genre
    
    # Include key musical features
    danceability = db.Column(db.Float)
    energy = db.Column(db.Float)
    tempo = db.Column(db.Float)
    loudness = db.Column(db.Float)
    valence = db.Column(db.Float)
    
# Favorite model remains the same
class Favorite(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    song_id = db.Column(db.Integer, db.ForeignKey('song.id'), nullable=False)

