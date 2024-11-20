import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>Welcome to EcoFix</h1>
      <div style={styles.buttonContainer}>
        <Link to="/login" style={styles.button}>
          Login
        </Link>
        <Link to="/register" style={styles.button}>
          Register
        </Link>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f5f5f5',
  },
  heading: {
    fontSize: '2.5rem',
    marginBottom: '1rem',
  },
  buttonContainer: {
    display: 'flex',
    gap: '1rem',
  },
  button: {
    textDecoration: 'none',
    color: 'white',
    backgroundColor: '#007bff',
    padding: '0.5rem 1rem',
    borderRadius: '5px',
  },
};

export default Home;
