// frontend/src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Home from './pages/Home';
import './App.css'; // Importăm stilurile globale

const API_BASE_URL = 'http://localhost:5000';

const isAuthenticated = () => !!localStorage.getItem('userToken');

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const handleLogout = () => {
    localStorage.removeItem('userToken');
    window.location.href = '/login';
  };

  return (
    <Router>
      <div className="App">
        {/* --- STYLED NAVIGATION BAR --- */}
        <nav style={{ 
            backgroundColor: '#800020', /* Burgundy color */
            padding: '15px 0', 
            marginBottom: '30px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)' /* Added subtle shadow */
         }}>
          <ul style={{ listStyle: 'none', display: 'flex', justifyContent: 'center', margin: 0, padding: 0 }}>
            {isAuthenticated() ? (
              <>
                {/* Links visible when logged in */}
                <li style={{ margin: '0 20px' }}>
                  <Link to="/home" style={{ color: '#FFFFFF', fontSize: '1.2em', fontWeight: 'bold' }}>Home</Link> {/* White, larger text */}
                </li>
                <li style={{ margin: '0 20px' }}>
                  <Link to="/profile" style={{ color: '#FFFFFF', fontSize: '1.2em', fontWeight: 'bold' }}>Profile</Link> {/* White, larger text */}
                </li>
                <li style={{ margin: '0 20px' }}>
                  <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', fontSize: '1.2em', fontWeight: 'bold' }}> {/* White, larger text */}
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                {/* Links visible when logged out */}
                <li style={{ margin: '0 20px' }}>
                  <Link to="/login" style={{ color: '#FFFFFF', fontSize: '1.2em', fontWeight: 'bold' }}>Login</Link> {/* White, larger text */}
                </li>
                <li style={{ margin: '0 20px' }}>
                  <Link to="/register" style={{ color: '#FFFFFF', fontSize: '1.2em', fontWeight: 'bold' }}>Register</Link> {/* White, larger text */}
                </li>
              </>
            )}
          </ul>
        </nav>
        {/* --- END STYLED NAVIGATION BAR --- */}

        {/* --- Application Routes --- */}
        <Routes>
          <Route path="/register" element={<Register apiBaseUrl={API_BASE_URL} />} />
          <Route path="/login" element={<Login apiBaseUrl={API_BASE_URL} />} />
          <Route 
            path="/home" 
            element={<ProtectedRoute><Home apiBaseUrl={API_BASE_URL} /></ProtectedRoute>} 
          />
          <Route 
            path="/profile" 
            element={<ProtectedRoute><Profile apiBaseUrl={API_BASE_URL} /></ProtectedRoute>} 
          />
          <Route 
            path="/" 
            element={isAuthenticated() ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />} 
          />
          <Route path="*" element={<h1>404 - Page Not Found</h1>} /> 
        </Routes>
      </div>
    </Router>
  );
}

export default App;

