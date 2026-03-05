import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/InShot_.png';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'supervisor':
        return '/supervisor/dashboard';
      case 'worker':
        return '/worker/dashboard';
      case 'accountant':
        return '/accountant/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark app-navbar">
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center" to={getDashboardPath()}>
          <img src={logo} alt="Logo" style={{ height: '40px', marginRight: '12px' }} />
          <span>Construction Management</span>
          <span className="brand-badge ms-2">CMS</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
            {!user ? (
              <li className="nav-item">
                <Link className="nav-link" to="/login">Login</Link>
              </li>
            ) : (
              <li className="nav-item dropdown">
                <a
                  className="nav-link dropdown-toggle d-flex align-items-center"
                  href="#"
                  id="userDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <span className="me-2" style={{ fontWeight: 600 }}>{user.name}</span>
                  <small className="text-capitalize">({user.role})</small>
                </a>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                  <li>
                    <Link className="dropdown-item" to={getDashboardPath()}>Dashboard</Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>Logout</button>
                  </li>
                </ul>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

