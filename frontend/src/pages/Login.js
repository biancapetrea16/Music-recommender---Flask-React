// src/pages/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login({ apiBaseUrl }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await axios.post(`${apiBaseUrl}/login`, {
        username: username,
        password: password
      });
      
      // Extrage token-ul din răspuns
      const token = response.data.token; 
      
      // STOCARE TOKEN: Salvează token-ul în Local Storage.
      // Aici e cheia persistenței sesiunii!
      localStorage.setItem('userToken', token); 
      
      setMessage(`Success: ${response.data.message}. Redirecționare la profil...`);
      setTimeout(() => navigate('/profile'), 1500); 
      
    } catch (error) {
      const errorMsg = error.response ? error.response.data.message : 'Eroare de rețea sau server';
      setMessage(`Error: ${errorMsg}`);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        {/* Input fields for username and password (similar to Register.js) */}
        <div>
          <label>Username:</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Loghează-te</button>
      </form>
      {message && <p style={{ color: message.startsWith('Error') ? 'red' : 'green' }}>{message}</p>}
    </div>
  );
}

export default Login;