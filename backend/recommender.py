# backend/recommender.py

import pandas as pd
from backend.models import Song, Favorite # Make sure Song and Favorite are imported
from backend.config import Config
from sqlalchemy import create_engine
import random 

# Database connection using the correct URI from Config
DB_URI = Config.SQLALCHEMY_DATABASE_URI
engine = create_engine(DB_URI)

def get_recommendations_for_user(user_id, num_recommendations=5):
    """
    Generates recommendations based on the most frequent genres in the user's favorites.
    Includes the 'genre' field in the output.
    """
    
    # 1. Load Data
    try:
        all_songs_df = pd.read_sql_table(Song.__tablename__, engine)
        
        # Fetch only song_ids for the current user's favorites
        favorites_query = f"SELECT song_id FROM {Favorite.__tablename__} WHERE user_id = {user_id}"
        favorites_df = pd.read_sql_query(favorites_query, engine)
        
    except Exception as e:
        print(f"Error loading data from database: {e}")
        # Return random songs if DB read fails
        try:
            sample_songs = pd.read_sql_query(f"SELECT * FROM {Song.__tablename__} ORDER BY RANDOM() LIMIT {num_recommendations}", engine)
            return sample_songs.to_dict('records')
        except:
             return [] # Return empty list if even random fails

    if favorites_df.empty:
        # If no favorites, recommend highly popular (or random) songs WITH genre
        print(f"User {user_id} has no favorites. Recommending random songs.")
        random_songs = all_songs_df.sample(n=min(len(all_songs_df), num_recommendations))
        # Ensure genre is included
        return random_songs.to_dict('records') 

    # Extract favorite song IDs
    favorite_song_ids = favorites_df['song_id'].tolist()
    
    # Get details of favorite songs including genre
    favorite_songs_details_df = all_songs_df[all_songs_df['id'].isin(favorite_song_ids)]

    if favorite_songs_details_df.empty or 'genre' not in favorite_songs_details_df.columns:
        print(f"Could not retrieve favorite song details or genre column missing. Recommending random.")
        random_songs = all_songs_df[~all_songs_df['id'].isin(favorite_song_ids)].sample(n=min(len(all_songs_df)-len(favorite_song_ids), num_recommendations))
        return random_songs.to_dict('records')

    # 2. Identify Preferred Genres
    # Find the most common genre(s) in favorites
    top_genres = favorite_songs_details_df['genre'].mode()

    if top_genres.empty:
         # If genres are too diverse or missing, fall back to random
        print(f"No dominant genre found for user {user_id}. Recommending random.")
        random_songs = all_songs_df[~all_songs_df['id'].isin(favorite_song_ids)].sample(n=min(len(all_songs_df)-len(favorite_song_ids), num_recommendations))
        return random_songs.to_dict('records')
        
    # Use the first top genre if multiple have the same frequency
    preferred_genre = top_genres.iloc[0] 
    print(f"User {user_id}'s preferred genre identified as: {preferred_genre}")

    # 3. Generate Recommendations
    
    # Find songs NOT in favorites that match the preferred genre
    recommendations_df = all_songs_df[
        (all_songs_df['genre'] == preferred_genre) & 
        (~all_songs_df['id'].isin(favorite_song_ids)) # Exclude already favorited songs
    ]

    if recommendations_df.empty:
        # If no songs found in the preferred genre, recommend random songs (excluding favorites)
        print(f"No new songs found in genre '{preferred_genre}'. Recommending random (excluding favorites).")
        other_songs = all_songs_df[~all_songs_df['id'].isin(favorite_song_ids)]
        # Ensure we don't try to sample more than available
        num_to_sample = min(len(other_songs), num_recommendations)
        if num_to_sample > 0:
             recommendations_df = other_songs.sample(n=num_to_sample)
        else:
             return [] # No other songs left to recommend


    # Select N recommendations randomly from the filtered list
    final_num_recs = min(len(recommendations_df), num_recommendations)
    final_recommendations_df = recommendations_df.sample(n=final_num_recs)
    
    # Convert to list of dictionaries, ensuring genre is present
    result = final_recommendations_df.to_dict('records')
    print(f"Generated {len(result)} recommendations for user {user_id}.")
    
    return result

# Optional: Test block (requires Flask app context)
# if __name__ == '__main__':
#     from backend.app import create_app
#     app = create_app()
#     with app.app_context():
#         test_user_id = 1 # Replace with a valid user ID who has favorites
#         recs = get_recommendations_for_user(test_user_id)
#         print(f"Recommendations for user {test_user_id}:")
#         for rec in recs:
#             print(f"- {rec.get('title')} by {rec.get('artist')} (Genre: {rec.get('genre')})")

