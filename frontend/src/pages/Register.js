// frontend/src/pages/Register.js

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Import Link

function Register({ apiBaseUrl }) {
  // State for form inputs and messages
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(''); // For success/error feedback
  const [isLoading, setIsLoading] = useState(false); // Loading indicator

  const navigate = useNavigate(); // Hook for programmatic navigation

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setMessage(''); // Clear previous messages
    setIsLoading(true); // Show loading indicator

    // Basic client-side validation (optional but recommended)
    if (password.length < 6) {
        setMessage('Error: Password must be at least 6 characters long.'); // English message
        setIsLoading(false);
        return;
    }

    try {
      // Send POST request to the backend /register endpoint
      const response = await axios.post(`${apiBaseUrl}/register`, {
        username: username,
        password: password
      });
      
      // If registration is successful (Status 201 Created)
      setMessage(`Success: ${response.data.message}. Redirecting to login...`); // English message
      // Redirect to the login page after a short delay
      setTimeout(() => navigate('/login'), 2000); 
      
    } catch (error) {
      // Handle registration errors (e.g., username taken, network issues)
      const errorMsg = error.response ? error.response.data.message : 'Network or server error'; // English message
      setMessage(`Error: ${errorMsg}`); // English message
    } finally {
        setIsLoading(false); // Hide loading indicator
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', textAlign: 'center' }}>
      <h2>Register</h2>
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
            style={{ padding: '10px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          {isLoading ? 'Registering...' : 'Register'} {/* English button text */}
        </button>
      </form>
      {/* Display success or error messages */}
      {message && (
          <p style={{ marginTop: '15px', color: message.startsWith('Error') ? 'red' : 'green' }}>
              {message}
          </p>
      )}
       {/* Link to Login Page */}
       <p style={{ marginTop: '20px' }}>
            Already have an account? <Link to="/login">Login here</Link> {/* English link text */}
        </p>
    </div>
  );
}

export default Register;
