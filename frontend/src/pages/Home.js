// src/pages/Home.js

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000'; // Definește URL-ul aici sau folosește prop-ul

function Home({ apiBaseUrl = API_BASE_URL }) {
  const [songs, setSongs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('userToken');

  // Funcție unificată pentru a prelua ambele seturi de date
  const fetchAllData = useCallback(async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      // 1. Preluarea Tuturor Pieselor
      const songsResponse = await axios.get(`${apiBaseUrl}/songs`, { headers });
      setSongs(songsResponse.data);

      // 2. Preluarea Recomandărilor
      const recsResponse = await axios.get(`${apiBaseUrl}/recommendations`, { headers });
      setRecommendations(recsResponse.data);
      
      setLoading(false);
    } catch (error) {
      console.error("Eroare la preluarea datelor:", error.response || error);
      if (error.response && error.response.status === 401) {
          localStorage.removeItem('userToken');
          navigate('/login');
      } else {
          setLoading(false);
      }
    }
  }, [apiBaseUrl, navigate, token]);


  useEffect(() => {
    // Apelăm funcția de preluare la montarea componentei
    fetchAllData();
  }, [fetchAllData]);


  // Funcție corectată pentru a adăuga/șterge o piesă din favorite
  const toggleFavorite = async (songId) => {
    if (!token) return navigate('/login'); // Verificare de siguranță

    try {
      const response = await axios.post(`${apiBaseUrl}/favorites`, { song_id: songId }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const action = response.data.action;

      // 1. Actualizează Starea Piesei în Lista de Piese (pentru a schimba inima imediat)
      setSongs(prevSongs => 
        prevSongs.map(song =>
          song.id === songId ? { ...song, is_favorite: action === 'added' } : song
        )
      );
      
      // 2. Reîncarcă NEAPĂRAT recomandările, deoarece favoritele s-au schimbat.
      // (dar folosește funcția fetchAllData, nu reload-ul paginii!)
      fetchAllData();

    } catch (error) {
      console.error("Eroare la favorite:", error.response || error);
      alert('Eroare la actualizarea favoritei. Vă rugăm să reîncercați.');
    }
  };


  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Se încarcă datele...</div>;
  }

  // --- JSX RENDER ---
  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ color: '#007bff', borderBottom: '2px solid #007bff', paddingBottom: '10px' }}>
        ✨ Recomandări pentru Tine ({recommendations.length})
      </h2>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '40px' }}>
        {recommendations.length > 0 ? (
            recommendations.map(song => (
                <div key={`rec-${song.id}`} style={{ border: '2px dashed #007bff', borderRadius: '8px', padding: '15px', width: '280px', backgroundColor: '#e6f7ff' }}>
                    <p style={{ fontWeight: 'bold' }}>{song.title}</p>
                    <p>Artist: {song.artist}</p>
                    <p>Gen: *{song.genre}*</p>
                    <button onClick={() => toggleFavorite(song.id)} style={{ padding: '8px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
                        Adaugă la Favorite
                    </button>
                </div>
            ))
        ) : (
             <p>Începe să adaugi piese la favorite pentru a primi primele recomandări!</p>
        )}
      </div>

      <hr />

      <h2>Toate Piesele ({songs.length})</h2>
      <p>Click pe inimă pentru a modifica lista de favorite:</p>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {songs.map(song => (
          <div key={song.id} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px', width: '280px' }}>
             <h4>{song.title}</h4>
             <p>Artist: {song.artist}</p>
             <p>Gen: **{song.genre}**</p>
             <button 
                onClick={() => toggleFavorite(song.id)}
                style={{ cursor: 'pointer', fontSize: '24px', background: 'none', border: 'none', color: song.is_favorite ? 'red' : 'lightgrey' }}
             >
                {/* Afiseaza inima rosie/alba in functie de starea locala */}
                {song.is_favorite ? '❤️' : '🤍'}
             </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;