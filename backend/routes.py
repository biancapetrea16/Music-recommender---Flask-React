# backend/routes.py

from flask import Blueprint, request, jsonify
from backend import db, bcrypt 
from backend.models import User, Song, Favorite 
from backend.recommender import get_recommendations_for_user 

import jwt 
import datetime
from functools import wraps 
from sqlalchemy import or_
# NOU: Importăm Counter pentru a număra genurile
from collections import Counter

main_bp = Blueprint('main_bp', __name__)
SECRET_KEY = "o_cheie_foarte_secreta_si_lunga" 

# --- Decorator token_required (Rămâne neschimbat) ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # ... (logica existentă) ...
        token = None
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
             token = auth_header.split(" ")[1]
        
        if not token: return jsonify({'message': 'Token lipsă!'}), 401
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user = User.query.filter_by(id=data['user_id']).first()
            if not current_user: raise Exception("User not found")
        except Exception as e:
            print(f"Token validation error: {e}") 
            return jsonify({'message': 'Token invalid sau expirat!'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

# --- Auth routes (register/login - Rămân neschimbate) ---
@main_bp.route('/register', methods=['POST'])
def register():
    # ... (logica existentă) ...
    data = request.get_json(); username = data.get('username'); password = data.get('password')
    if not username or not password: return jsonify({'message': 'Lipsesc date!'}), 400
    if User.query.filter_by(username=username).first(): return jsonify({'message': 'Utilizator există!'}), 409
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(username=username, password_hash=hashed_password)
    db.session.add(new_user); db.session.commit()
    return jsonify({'message': 'Înregistrare reușită!'}), 201

@main_bp.route('/login', methods=['POST'])
def login():
    # ... (logica existentă) ...
    data = request.get_json(); username = data.get('username'); password = data.get('password')
    user = User.query.filter_by(username=username).first()
    if user and bcrypt.check_password_hash(user.password_hash, password):
        token = jwt.encode({'user_id': user.id, 'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)}, SECRET_KEY, algorithm="HS256")
        return jsonify({'message': 'Autentificare reușită!', 'token': token}), 200
    return jsonify({'message': 'Date invalide'}), 401


# --- PROFILE Route (ACTUALIZATĂ) ---
@main_bp.route('/profile', methods=['GET'])
@token_required
def profile(current_user):
    # 1. Preluăm piesele favorite (similar cu get_favorites)
    favorites = current_user.favorites
    favorite_songs_list = []
    genre_list = [] # Listă pentru a colecta genurile
    
    for fav in favorites:
        song = Song.query.get(fav.song_id)
        if song:
            favorite_songs_list.append({
                'id': song.id, 
                'title': song.title, 
                'artist': song.artist,
                'genre': song.genre,
                'danceability': song.danceability,
                'energy': song.energy,
                'tempo': song.tempo,
                'loudness': song.loudness,
                'valence': song.valence
            })
            if song.genre: # Adaugă genul la listă dacă există
                genre_list.append(song.genre)

    # 2. Calculăm cele mai frecvente genuri
    top_genres = []
    if genre_list:
        genre_counts = Counter(genre_list)
        # Obține top 3 genuri cele mai frecvente
        top_genres = [{'genre': genre, 'count': count} for genre, count in genre_counts.most_common(3)]

    # 3. Returnăm datele combinate
    return jsonify({
        'user_id': current_user.id, 
        'username': current_user.username,
        'favorite_songs': favorite_songs_list, # Lista de piese favorite
        'top_genres': top_genres # Lista genurilor de top
    }), 200


# --- Favorite routes (toggle/get - Rămân neschimbate) ---
@main_bp.route('/favorites', methods=['POST'])
@token_required
def toggle_favorite(current_user):
    # ... (logica existentă) ...
    data = request.get_json(); song_id = data.get('song_id')
    if not song_id: return jsonify({'message': 'Lipseste song_id'}), 400
    song = Song.query.get(song_id)
    if not song: return jsonify({'message': 'Piesa nu exista'}), 404
    favorite_entry = Favorite.query.filter_by(user_id=current_user.id, song_id=song_id).first()
    if favorite_entry:
        db.session.delete(favorite_entry); db.session.commit()
        return jsonify({'message': 'Eliminat din favorite', 'action': 'deleted'}), 200
    else:
        new_favorite = Favorite(user_id=current_user.id, song_id=song_id)
        db.session.add(new_favorite); db.session.commit()
        return jsonify({'message': 'Adaugat la favorite', 'action': 'added'}), 201

@main_bp.route('/favorites', methods=['GET'])
@token_required
def get_favorites(current_user):
    # ... (logica existentă, dar ruta /profile o face redundantă acum) ...
    favorites = current_user.favorites
    favorite_songs_list = []
    for fav in favorites:
        song = Song.query.get(fav.song_id)
        if song:
             favorite_songs_list.append({ 'id': song.id, 'title': song.title, 'artist': song.artist,'genre': song.genre, 'danceability': song.danceability, 'energy': song.energy, 'tempo': song.tempo, 'loudness': song.loudness, 'valence': song.valence })
    return jsonify(favorite_songs_list), 200

# --- SEARCH Route (Rămâne neschimbată) ---
@main_bp.route('/search', methods=['GET'])
@token_required
def search_songs(current_user):
    # ... (logica existentă) ...
    query_string = request.args.get('q', '').strip()
    if not query_string or len(query_string) < 3: return jsonify([]), 200
    search = f"%{query_string}%"
    songs = Song.query.filter(or_(Song.title.ilike(search), Song.artist.ilike(search), Song.genre.ilike(search))).limit(50).all() 
    favorite_song_ids = {fav.song_id for fav in current_user.favorites} 
    songs_list = [{'id': s.id, 'title': s.title, 'artist': s.artist, 'genre': s.genre, 'danceability': s.danceability, 'energy': s.energy, 'tempo': s.tempo, 'loudness': s.loudness, 'valence': s.valence, 'is_favorite': s.id in favorite_song_ids } for s in songs]
    return jsonify(songs_list), 200

# --- Recommendations Route (Rămâne neschimbată) ---
@main_bp.route('/recommendations', methods=['GET'])
@token_required
def get_recommendations(current_user):
    # ... (logica existentă) ...
    recommendations = get_recommendations_for_user(current_user.id, num_recommendations=5)
    return jsonify(recommendations), 200

