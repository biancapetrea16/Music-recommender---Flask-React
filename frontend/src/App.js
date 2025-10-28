// src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Home from './pages/Home'; // NOU: Componenta Home pentru lista de piese
import './App.css'; 

// URL-ul de bază al API-ului Flask.
const API_BASE_URL = 'http://localhost:5000'; 

function App() {
  return (
    <Router>
      <div className="App">
        <nav>
          <ul>
            {/* Navigarea existentă */}
            <li><Link to="/">Home</Link></li> {/* ADAUGĂ Home în meniu */}
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/profile">Profile (Protected)</Link></li>
          </ul>
        </nav>

        <Routes>
          {/* RUTELE EXISTENTE (LOGIN, REGISTER, PROFILE) */}
          <Route path="/register" element={<Register apiBaseUrl={API_BASE_URL} />} />
          <Route path="/login" element={<Login apiBaseUrl={API_BASE_URL} />} />
          <Route path="/profile" element={<Profile apiBaseUrl={API_BASE_URL} />} />
          
          {/* RUTELE NOI (HOME/DASHBOARD) */}
          {/* Setează Home ca rută principală (/) și ca rută dedicată (/home) */}
          <Route path="/" element={<Home apiBaseUrl={API_BASE_URL} />} /> 
          <Route path="/home" element={<Home apiBaseUrl={API_BASE_URL} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;