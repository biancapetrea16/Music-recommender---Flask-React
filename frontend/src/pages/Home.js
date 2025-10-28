// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Home({ apiBaseUrl }) {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('userToken');

  useEffect(() => {
    if (!token) {
      // Dacă nu ești logat, te trimite la login
      navigate('/login');
      return;
    }

    const fetchSongs = async () => {
      try {
        const response = await axios.get(`${apiBaseUrl}/songs`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setSongs(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Eroare la preluarea pieselor:", error.response || error);
        // Dacă API-ul eșuează (ex: token invalid), deconectează
        localStorage.removeItem('userToken');
        navigate('/login');
      }
    };

    fetchSongs();
  }, [apiBaseUrl, navigate, token]);

  // Funcție pentru a adăuga/șterge o piesă din favorite
  const toggleFavorite = async (songId) => {
    try {
      const response = await axios.post(`${apiBaseUrl}/favorites`, { song_id: songId }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Actualizează starea locală a pieselor
      setSongs(prevSongs => 
        prevSongs.map(song =>
          song.id === songId ? { ...song, is_favorite: response.data.action === 'added' } : song
        )
      );
      alert(response.data.message);

    } catch (error) {
      console.error("Eroare la favorite:", error);
      alert('Eroare la actualizarea favoritei.');
    }
  };

  if (loading) {
    return <div>Se încarcă piesele...</div>;
  }

  return (
    <div>
      <h2>Toate Piesele</h2>
      <p>Click pe 💙 pentru a adăuga la favorite. (Esti logat ca user-ul cu token: {token.substring(0, 10)}...)</p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {songs.map(song => (
          <div key={song.id} style={{ border: '1px solid #ccc', padding: '15px', width: '250px' }}>
            <h4>{song.title}</h4>
            <p>Artist: {song.artist}</p>
            <p>Gen: **{song.genre}**</p>

            <button 
              onClick={() => toggleFavorite(song.id)}
              style={{ 
                cursor: 'pointer', 
                fontSize: '24px', 
                background: 'none', 
                border: 'none',
                color: song.is_favorite ? 'red' : 'lightgrey'
              }}
            >
              {song.is_favorite ? '❤️' : '🤍'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;