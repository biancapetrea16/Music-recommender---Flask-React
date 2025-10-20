# backend/routes.py

from flask import Blueprint, request, jsonify
# 1. Importăm db și bcrypt din noul __init__.py (nu din backend.app)
from backend import db, bcrypt 
from backend.models import User 
import jwt 
import datetime
from functools import wraps

# 1. Creează un Blueprint numit 'main_bp'
main_bp = Blueprint('main_bp', __name__)

# O funcție simplă pentru a obține SECRET_KEY din config
# (În producție ar trebui să fie citită dintr-o variabilă de mediu)
SECRET_KEY = "o_cheie_foarte_secreta_si_lunga" # Folosește cheia din config.py!

# --- DECORATOR PENTRU PROTECȚIA RUTELOR (necesar mai târziu) ---
# Funcție care verifică dacă utilizatorul este autentificat
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # JWT-ul ar trebui să fie trimis în header-ul "Authorization: Bearer <token>"
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]

        if not token:
            return jsonify({'message': 'Token lipsă!'}), 401

        try:
            # Decodează token-ul (verifică integritatea și expirarea)
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user = User.query.filter_by(id=data['user_id']).first()
        except:
            return jsonify({'message': 'Token invalid sau expirat!'}), 401

        return f(current_user, *args, **kwargs)

    return decorated
# -----------------------------------------------------------------


# 2. Rută API: Înregistrare (POST /register)
@main_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': 'Nume de utilizator și parolă sunt obligatorii!'}), 400

    # 1. Verifică dacă utilizatorul există deja
    if User.query.filter_by(username=username).first():
        return jsonify({'message': 'Nume de utilizator deja folosit!'}), 409

    # 2. Criptează parola înainte de stocare
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    # 3. Creează noul utilizator și salvează în baza de date
    new_user = User(username=username, password_hash=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'Înregistrare reușită!'}), 201


# 3. Rută API: Login (POST /login)
@main_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    # 1. Verifică dacă utilizatorul există și dacă parola se potrivește
    if user and bcrypt.check_password_hash(user.password_hash, password):
        # 2. Creează un token JWT
        token = jwt.encode({
            'user_id': user.id,
            # Setează expirarea (ex: 24 de ore)
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1) 
        }, SECRET_KEY, algorithm="HS256")
        
        # 3. Returnează token-ul către Frontend
        return jsonify({
            'message': 'Autentificare reușită!',
            'token': token
        }), 200
    
    return jsonify({'message': 'Date de autentificare invalide'}), 401


# 4. Rută API: Exemplu Protejat (GET /profile)
@main_bp.route('/profile', methods=['GET'])
@token_required # Aplică decoratorul de protecție
def profile(current_user):
    # Această funcție rulează DOAR dacă token-ul este valid
    return jsonify({
        'user_id': current_user.id,
        'username': current_user.username,
        'message': 'Bine ai venit în zona ta de profil protejată!'
    })