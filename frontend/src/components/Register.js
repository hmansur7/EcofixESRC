import React from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Registered successfully!');
    navigate('/Learning'); 
  };

  return (
    <div style={styles.formContainer}>
      <h2>Register</h2>
      <button onClick={() => navigate('/')} style={styles.backButton}>
        ← Home
      </button>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input type="text" placeholder="Name" style={styles.input} required />
        <input type="email" placeholder="Email" style={styles.input} required />
        <input type="password" placeholder="Password" style={styles.input} required />
        <button type="submit" style={styles.submitButton}>
          Register
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

export default Register;
