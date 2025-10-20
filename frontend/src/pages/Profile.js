// src/pages/Profile.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Profile({ apiBaseUrl }) {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('userToken');

      if (!token) {
        // Dacă nu există token, redirecționează la login
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(`${apiBaseUrl}/profile`, {
          // Trimiterea Token-ului către Flask în Header-ul Authorization: Bearer
          headers: {
            'Authorization': `Bearer ${token}` 
          }
        });
        
        setProfileData(response.data);
        setLoading(false);

      } catch (error) {
        // Dacă token-ul este invalid/expirat, Flask va da 401
        console.error("Eroare la preluarea profilului:", error.response || error);
        localStorage.removeItem('userToken'); // Șterge token-ul invalid
        navigate('/login'); // Redirecționează la login
      }
    };

    fetchProfile();
  }, [apiBaseUrl, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userToken'); // Șterge token-ul
    navigate('/login'); // Redirecționează
  };

  if (loading) {
    return <div>Se încarcă profilul...</div>;
  }

  return (
    <div>
      <h2>Profilul meu</h2>
      {profileData ? (
        <>
          <p>Salut, {profileData.username}!</p>
          <p>ID Utilizator: {profileData.user_id}</p>
          <p>{profileData.message}</p>
          <button onClick={handleLogout}>Logout</button>
          {/* Aici vei adăuga lista de piese favorite și RECOMANDĂRILE */}
        </>
      ) : (
        <p>Eroare la încărcarea datelor de profil.</p>
      )}
    </div>
  );
}

export default Profile;