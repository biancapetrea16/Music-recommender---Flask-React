// src/pages/Profile.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Componentă simplă pentru afișarea unei piese favorite
const FavoriteSongItem = ({ song }) => (
    <div style={{ border: '1px solid #eee', borderRadius: '5px', padding: '10px', marginBottom: '10px', backgroundColor: '#f9f9f9' }}>
        <h5 style={{ margin: '0 0 5px 0' }}>{song.title}</h5>
        <p style={{ margin: '0 0 5px 0', fontSize: '0.9em', color: '#555' }}>by {song.artist}</p>
        <p style={{ margin: 0, fontSize: '0.8em', color: '#888' }}>Genre: {song.genre || 'N/A'}</p>
    </div>
);

// Componentă pentru afișarea genurilor de top
const TopGenreItem = ({ genreData }) => (
    <li style={{ marginBottom: '5px', fontSize: '1.1em' }}>
        <span style={{ fontWeight: 'bold', color: '#007bff' }}>{genreData.genre}</span> ({genreData.count} songs)
    </li>
);

function Profile({ apiBaseUrl }) {
    // Stocăm toate datele de profil într-un singur obiect
    const [profileData, setProfileData] = useState({
        userId: null,
        username: '',
        favoriteSongs: [],
        topGenres: []
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const token = localStorage.getItem('userToken');

    const fetchProfileData = useCallback(async () => {
        if (!token) {
            navigate('/login');
            return;
        }
        setLoading(true);
        try {
            const response = await axios.get(`${apiBaseUrl}/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Actualizăm starea cu toate datele primite
            setProfileData({
                userId: response.data.user_id,
                username: response.data.username,
                favoriteSongs: response.data.favorite_songs || [],
                topGenres: response.data.top_genres || []
            });
        } catch (error) {
            console.error("Error fetching profile data:", error.response || error);
            localStorage.removeItem('userToken'); // Șterge token invalid
            navigate('/login');
        } finally {
            setLoading(false);
        }
    }, [apiBaseUrl, navigate, token]);

    useEffect(() => {
        fetchProfileData();
    }, [fetchProfileData]);

    const handleLogout = () => {
        localStorage.removeItem('userToken');
        navigate('/login');
    };

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading profile...</div>;
    }

    return (
        <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', paddingBottom: '15px', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>Profilul lui {profileData.username}</h2>
                <button onClick={handleLogout} style={{ padding: '8px 15px', cursor: 'pointer', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>
                    Logout
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                {/* Secțiunea Piese Favorite */}
                <div>
                    <h3 style={{ color: '#333' }}>Piesele Tale Favorite ({profileData.favoriteSongs.length})</h3>
                    {profileData.favoriteSongs.length > 0 ? (
                        <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
                            {profileData.favoriteSongs.map(song => (
                                <FavoriteSongItem key={song.id} song={song} />
                            ))}
                        </div>
                    ) : (
                        <p>Nu ai adăugat încă nicio piesă la favorite.</p>
                    )}
                </div>

                {/* Secțiunea Genuri de Top */}
                <div>
                    <h3 style={{ color: '#333' }}>Top Genuri Ascultate</h3>
                    {profileData.topGenres.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {profileData.topGenres.map((genreData, index) => (
                                <TopGenreItem key={index} genreData={genreData} />
                            ))}
                        </ul>
                    ) : (
                        <p>Adaugă piese la favorite pentru a vedea topul genurilor.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Profile;
