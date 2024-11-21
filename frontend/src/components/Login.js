import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:8000/api/users/login/', {
        email,
        password,
      });

      alert('Login successful!');
      navigate('/Learning');  // Redirect to another page after successful login
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.formContainer}>
      <h2>Login</h2>
      <button onClick={() => navigate('/')} style={styles.backButton}>
        ← Home
      </button>
      <form onSubmit={handleLogin} style={styles.form}>
      <input
          type="text"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.submitButton}>
          Login
        </button>
      </form>
    </div>
  );
};

const styles = {
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f5f5f5',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    width: '300px',
  },
  input: {
    padding: '0.5rem',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  submitButton: {
    padding: '0.5rem',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer',
  },
  backButton: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    padding: '0.5rem 1rem',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#6c757d',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
};

export default Login;
