# backend/seed_db.py

import pandas as pd
from backend.app import create_app
from backend.models import db, Song, User, Favorite 
from sqlalchemy.exc import IntegrityError 

app = create_app()

# Use the renamed file name
CSV_FILE_PATH = 'data.csv' 
# Import all rows, the dataset seems manageable
# ROWS_TO_IMPORT = 30000 

with app.app_context():
    print(f"--- Starting database reset and population from {CSV_FILE_PATH} ---")
    
    # 1. Drop and recreate tables (ESSENTIAL for schema change)
    db.drop_all() 
    db.create_all()
    print("Tables dropped and recreated with the new schema.")

    # 2. Read and prepare data using Pandas
    try:
        df = pd.read_csv(CSV_FILE_PATH, encoding='utf-8', on_bad_lines='skip') 
        print(f"CSV loaded successfully. Found columns: {list(df.columns)}")
    except FileNotFoundError:
        print(f"ERROR: CSV file '{CSV_FILE_PATH}' not found. Make sure it's in the root directory.")
        exit()
    except Exception as e:
        print(f"ERROR reading CSV: {e}. Check file format.")
        exit()
        
    # Define required columns based on the new CSV
    # Renaming based on 'high_popularity_spotify_data.csv' structure
    column_mapping = {
        'track_name': 'title',
        'track_artist': 'artist',
        'playlist_genre': 'genre',
        'danceability': 'danceability',
        'energy': 'energy',
        'tempo': 'tempo',
        'loudness': 'loudness',
        'valence': 'valence'
    }
    
    # Check if all needed source columns exist
    source_cols = list(column_mapping.keys())
    missing_cols = [col for col in source_cols if col not in df.columns]
    if missing_cols:
        print(f"ERROR: The CSV file is missing required columns: {missing_cols}. Please check the CSV structure.")
        exit()

    # Rename and select columns
    df = df.rename(columns=column_mapping)
    required_db_cols = list(column_mapping.values())
    
    # Clean data: drop rows with missing essential info, remove duplicates
    df_final = df[required_db_cols].dropna(subset=['title', 'artist', 'genre']).drop_duplicates(subset=['title', 'artist'])
    
    # Convert types if necessary (Pandas usually handles floats well)
    numeric_cols = ['danceability', 'energy', 'tempo', 'loudness', 'valence']
    for col in numeric_cols:
        df_final[col] = pd.to_numeric(df_final[col], errors='coerce') # Convert non-numeric to NaN
    df_final = df_final.dropna(subset=numeric_cols) # Drop rows where conversion failed
    
    # Limit rows if needed (uncomment if import takes too long)
    # df_final = df_final.head(ROWS_TO_IMPORT)

    print(f"Preparing to insert {len(df_final)} unique songs into the database...")

    # 3. Insert data (in batches)
    count = 0
    batch_size = 2000 
    
    for index, row in df_final.iterrows():
        new_song = Song(
            title=str(row['title']), # Ensure string
            artist=str(row['artist']), # Ensure string
            genre=str(row['genre']),   # Ensure string
            danceability=row['danceability'],
            energy=row['energy'],
            tempo=row['tempo'],
            loudness=row['loudness'],
            valence=row['valence']
        )
        db.session.add(new_song)
        count += 1
        
        if count % batch_size == 0:
            try:
                db.session.commit()
                print(f"Inserted batch of {batch_size} songs... ({count}/{len(df_final)})")
            except Exception as e:
                db.session.rollback()
                print(f"ERROR committing batch {count // batch_size}: {e}")
                break 

    # Final commit
    if count % batch_size != 0:
         try:
            db.session.commit()
         except Exception as e:
            db.session.rollback()
            print(f"ERROR on final commit: {e}")

    print(f"SUCCESS: Processed {count} songs.")

