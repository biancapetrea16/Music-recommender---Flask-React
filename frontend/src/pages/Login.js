// frontend/src/pages/Login.js

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Import Link

function Login({ apiBaseUrl }) {
  // State for form inputs and messages
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(''); // For success/error feedback
  const [isLoading, setIsLoading] = useState(false); // Loading indicator

  const navigate = useNavigate(); // Hook for programmatic navigation

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setMessage(''); // Clear previous messages
    setIsLoading(true); // Show loading indicator

    try {
      // Send POST request to the backend /login endpoint
      const response = await axios.post(`${apiBaseUrl}/login`, {
        username: username,
        password: password
      });
      
      // Extract the JWT token from the response
      const token = response.data.token; 
      
      // Store the token in localStorage for session persistence
      // NOTE: For better security in production, consider HttpOnly cookies or more secure storage.
      localStorage.setItem('userToken', token); 
      
      setMessage(`Success: ${response.data.message}. Redirecting to home...`); // English message
      // Redirect to the home page after a short delay
      setTimeout(() => navigate('/home'), 1500); // Navigate to '/home' or '/'
      
    } catch (error) {
      // Handle login errors (e.g., invalid credentials, network issues)
      const errorMsg = error.response ? error.response.data.message : 'Network or server error'; // English message
      setMessage(`Error: ${errorMsg}`); // English message
    } finally {
        setIsLoading(false); // Hide loading indicator
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', textAlign: 'center' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label htmlFor="username" style={{ display: 'block', marginBottom: '5px' }}>Username:</label>
          <input 
            type="text" 
            id="username"
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
          <input 
            type="password" 
            id="password"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={{ width: '100%', padding: '10px', boxSizing: 'border-box' }}
          />
        </div>
        <button 
            type="submit" 
            disabled={isLoading} // Disable button while loading
            style={{ padding: '10px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          {isLoading ? 'Logging in...' : 'Login'} {/* English button text */}
        </button>
      </form>
      {/* Display success or error messages */}
      {message && (
          <p style={{ marginTop: '15px', color: message.startsWith('Error') ? 'red' : 'green' }}>
              {message}
          </p>
      )}
       {/* Link to Registration Page */}
       <p style={{ marginTop: '20px' }}>
            Don't have an account? <Link to="/register">Register here</Link> {/* English link text */}
      </p>
    </div>
  );
}

export default Login;
