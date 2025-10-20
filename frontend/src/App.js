// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import './App.css'; // Să păstrăm CSS-ul standard

// URL-ul de bază al API-ului Flask. Important pentru Axios.
const API_BASE_URL = 'http://localhost:5000'; 

function App() {
  return (
    <Router>
      <div className="App">
        <nav>
          <ul>
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/profile">Profile (Protected)</Link></li>
          </ul>
        </nav>

        <Routes>
          <Route path="/register" element={<Register apiBaseUrl={API_BASE_URL} />} />
          <Route path="/login" element={<Login apiBaseUrl={API_BASE_URL} />} />
          <Route path="/profile" element={<Profile apiBaseUrl={API_BASE_URL} />} />
          <Route path="/" element={<h1>Bine ai venit la Music Recommender!</h1>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;