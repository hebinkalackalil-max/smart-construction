import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <h1 style={{ fontSize: '4rem', color: '#e74c3c', marginBottom: '1rem' }}>403</h1>
      <h2 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Access Denied</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        You don't have permission to access this page.
      </p>
      <Link
        to="/"
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#3498db',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px'
        }}
      >
        Go to Dashboard
      </Link>
    </div>
  );
};

export default Unauthorized;

