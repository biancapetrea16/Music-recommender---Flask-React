# backend/recommender.py

import pandas as pd
from backend.models import Song, Favorite
from backend.app import create_app
from backend.config import Config
from sqlalchemy import create_engine
import random # Pentru a selecta aleatoriu din piese similare

# Obține setările de conexiune la baza de date din config.py
# NOTE: Pentru a rula funcția în afara contextului Flask, folosim SQLAlchemy direct
DB_URI = Config.SQLALCHEMY_DATABASE_URI
engine = create_engine(DB_URI)


def get_recommendations_for_user(user_id, num_recommendations=3):
    """
    Generează recomandări bazate pe genurile pieselor favorite (Content-Based).
    """

    # 1. Încărcarea datelor

    # Încărcăm toate piesele disponibile și favoritele utilizatorului
    all_songs_df = pd.read_sql(Song.__tablename__, engine)
    favorites_df = pd.read_sql(
        Favorite.__tablename__, 
        engine, 
        params={'user_id': user_id}, 
        index_col='id',
        # Query care filtrează favoritele doar pentru utilizatorul curent
        # Puteți folosi o sintaxă mai complexă pentru eficiență, dar aceasta este clară.
    )

    # Filtrează favoritele după user_id, deoarece `read_sql` nu suportă WHERE direct pe numele tabelului.
    favorites_df = favorites_df[favorites_df['user_id'] == user_id]

    # 2. Identificarea Genurilor Preferate

    if favorites_df.empty:
        # Cazul de bază: dacă nu are favorite, recomandă cele mai populare (sau aleatoriu)
        return random.sample(all_songs_df.to_dict('records'), num_recommendations)

    # Extrage ID-urile pieselor favorite
    favorite_song_ids = favorites_df['song_id'].tolist()

    # Obține detaliile pieselor favorite
    favorite_songs = all_songs_df[all_songs_df['id'].isin(favorite_song_ids)]

    # Identifică cel mai frecvent Gen (cel mai preferat de user)
    most_liked_genre = favorite_songs['genre'].mode()

    # Dacă există un gen preferat (modul nu este gol)
    if most_liked_genre.empty:
         # Cazul în care userul ascultă genuri unice, recomandă aleatoriu
        return random.sample(all_songs_df.to_dict('records'), num_recommendations)

    preferred_genre = most_liked_genre.iloc[0]

    # 3. Generarea Recomandărilor

    # Filtrează piesele care NU sunt deja în favorite, dar aparțin genului preferat
    recommendations = all_songs_df[
        (all_songs_df['genre'] == preferred_genre) & 
        (~all_songs_df['id'].isin(favorite_song_ids)) # Exclude piesele deja favorite
    ]

    if recommendations.empty:
        # Cazul în care userul a epuizat piesele din genul preferat,
        # recomandă aleatoriu din restul bazei de date (excluzând favoritele)
        other_songs = all_songs_df[~all_songs_df['id'].isin(favorite_song_ids)]
        recommendations = other_songs.sample(n=min(len(other_songs), num_recommendations))

    # Selectează N recomandări (sau mai puține, dacă nu există suficiente)
    final_recommendations_df = recommendations.head(num_recommendations)

    return final_recommendations_df.to_dict('records')

# Rulare de test (opțional)
if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        # Aici poți testa cu un ID de utilizator existent
        test_user_id = 1 
        recs = get_recommendations_for_user(test_user_id)
        print(f"Recomandări pentru user {test_user_id}: {recs}")