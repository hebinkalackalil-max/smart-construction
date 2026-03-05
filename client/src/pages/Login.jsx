import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/InShot_.png';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      const user = JSON.parse(localStorage.getItem('user'));
      switch (user.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'supervisor':
          navigate('/supervisor/dashboard');
          break;
        case 'worker':
          navigate('/worker/dashboard');
          break;
        case 'accountant':
          navigate('/accountant/dashboard');
          break;
        default:
          navigate('/');
      }
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="spotify-login">
      {/* Main content */}
      <div className="spotify-content">
        <img src={logo} alt="Logo" style={{ height: '120px', marginBottom: '2rem' }} />
        <h1 className="spotify-title">SMART CONSTRUCTION AND MANAGEMENT SYSTEM</h1>

        {error && (
          <div className="spotify-error">
            {error}
          </div>
        )}

        <div className="spotify-buttons">
          <form onSubmit={handleSubmit} className="spotify-form">
            <input
              type="email"
              className="spotify-input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              className="spotify-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="spotify-btn spotify-btn-primary" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="spotify-divider">
            <span>or</span>
          </div>

          <Link to="/register" className="spotify-btn spotify-btn-outline">
            <span className="btn-icon">👤</span>
            Create new account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

