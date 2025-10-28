# backend/seed_db.py

from backend.app import create_app
from backend.models import db, Song

app = create_app()

# 5 piese de test cu Gen (feature important pentru Pasul 5 - ML)
seed_songs = [
    {'title': 'Bohemian Rhapsody', 'artist': 'Queen', 'genre': 'Rock'},
    {'title': 'Smells Like Teen Spirit', 'artist': 'Nirvana', 'genre': 'Grunge'},
    {'title': 'Billie Jean', 'artist': 'Michael Jackson', 'genre': 'Pop'},
    {'title': 'Shape of You', 'artist': 'Ed Sheeran', 'genre': 'Pop'},
    {'title': 'Stairway to Heaven', 'artist': 'Led Zeppelin', 'genre': 'Rock'}
]

with app.app_context():
    print("Se populează baza de date cu piese (dacă sunt noi)...")

    # Verifică dacă există deja piese în DB pentru a evita duplicarea la fiecare rulare
    if Song.query.count() == 0:
        for data in seed_songs:
            song = Song(title=data['title'], artist=data['artist'], genre=data['genre'])
            db.session.add(song)

        db.session.commit()
        print(f"S-au adăugat {len(seed_songs)} piese noi.")
    else:
        print(f"Baza de date conține deja {Song.query.count()} piese. Nu se adaugă duplicat.")