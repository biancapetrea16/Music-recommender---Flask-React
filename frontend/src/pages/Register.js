// src/pages/Register.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register({ apiBaseUrl }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await axios.post(`${apiBaseUrl}/register`, {
        username: username,
        password: password
      });
      
      // Dacă înregistrarea a avut succes (Status 201)
      setMessage(`Success: ${response.data.message}. Redirecționare la login...`);
      setTimeout(() => navigate('/login'), 2000); // Redirecționează după 2 secunde
      
    } catch (error) {
      // Afișează mesajul de eroare de la Flask (ex: 'Nume de utilizator deja folosit!')
      const errorMsg = error.response ? error.response.data.message : 'Eroare de rețea sau server';
      setMessage(`Error: ${errorMsg}`);
    }
  };

  return (
    <div>
      <h2>Înregistrare</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label>Password:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button type="submit">Înregistrează-te</button>
      </form>
      {message && <p style={{ color: message.startsWith('Error') ? 'red' : 'green' }}>{message}</p>}
    </div>
  );
}

export default Register;