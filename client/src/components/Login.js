import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ setIsAuthenticated }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    job: '',
    dob: '',
    salary: '',
    gender: '',
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Clear any existing authentication data when component mounts
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isRegistering) {
        if (!formData.name || !formData.job || !formData.dob || 
            !formData.salary || !formData.gender || 
            !formData.username || !formData.password) {
          setError('Please fill in all fields');
          return;
        }

        const response = await axios.post('http://localhost:5000/api/register', formData);
        if (response.data.message === 'Registration successful') {
          setIsRegistering(false);
          setFormData({
            name: '',
            job: '',
            dob: '',
            salary: '',
            gender: '',
            username: '',
            password: ''
          });
          setError('Registration successful! Please login.');
        }
      } else {
        if (!formData.username || !formData.password) {
          setError('Please enter both username and password');
          return;
        }

        const response = await axios.post('http://localhost:5000/api/login', {
          username: formData.username,
          password: formData.password
        });
        
        if (response.data.message === 'Login successful') {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          localStorage.setItem('token', response.data.token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
          setIsAuthenticated(true);
          navigate('/dashboard');
        } else {
          setError(response.data.message);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.response?.data?.message || 
               (isRegistering ? 'Registration failed. Please try again.' : 'Login failed. Please try again.'));
    }
  };

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '400px',
      margin: 'auto',
      padding: '20px'
    }}>
      <h2 style={{ textAlign: 'center' }}>{isRegistering ? 'Register' : 'Login'}</h2>
      
      {error && (
        <div style={{
          color: 'red',
          textAlign: 'center',
          marginBottom: '15px',
          padding: '10px',
          backgroundColor: '#ffebee',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        flexDirection: 'column'
      }}>
        {isRegistering && (
          <>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{ padding: '8px', marginTop: '5px' }}
            />

            <label htmlFor="job">Job</label>
            <input
              type="text"
              id="job"
              value={formData.job}
              onChange={handleChange}
              required
              style={{ padding: '8px', marginTop: '5px' }}
            />

            <label htmlFor="dob">Date of Birth</label>
            <input
              type="date"
              id="dob"
              value={formData.dob}
              onChange={handleChange}
              required
              style={{ padding: '8px', marginTop: '5px' }}
            />

            <label htmlFor="salary">Salary</label>
            <input
              type="number"
              id="salary"
              value={formData.salary}
              onChange={handleChange}
              required
              style={{ padding: '8px', marginTop: '5px' }}
            />

            <label htmlFor="gender">Gender</label>
            <select
              id="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              style={{ padding: '8px', marginTop: '5px' }}
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </>
        )}

        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          value={formData.username}
          onChange={handleChange}
          required
          style={{ padding: '8px', marginTop: '5px' }}
        />

        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={formData.password}
          onChange={handleChange}
          required
          style={{ padding: '8px', marginTop: '5px' }}
        />

        <button
          type="submit"
          style={{
            padding: '8px',
            marginTop: '15px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isRegistering ? 'Register' : 'Login'}
        </button>
      </form>

      <div
        style={{
          marginTop: '15px',
          textAlign: 'center',
          color: 'blue',
          cursor: 'pointer'
        }}
        onClick={() => {
          setIsRegistering(!isRegistering);
          setError('');
        }}
      >
        {isRegistering
          ? 'Already have an account? Login'
          : "Don't have an account? Register"}
      </div>
    </div>
  );
};

export default Login; 