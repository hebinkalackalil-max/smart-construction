import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="error-container">
      <div className="error-code">403</div>
      <h2 className="error-title">Access Denied</h2>
      <p className="error-message">
        You don't have permission to access this page.
      </p>
      <Link to="/" className="btn btn-primary btn-lg">
        Go to Dashboard
      </Link>
    </div>
  );
};

export default Unauthorized;

