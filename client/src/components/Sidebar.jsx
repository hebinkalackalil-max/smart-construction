import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ user }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const linkStyle = (path) => ({
    display: 'block',
    padding: '1rem',
    color: isActive(path) ? '#3498db' : '#333',
    textDecoration: 'none',
    backgroundColor: isActive(path) ? '#ecf0f1' : 'transparent',
    borderLeft: isActive(path) ? '4px solid #3498db' : '4px solid transparent',
    transition: 'all 0.3s'
  });

  const getAdminLinks = () => (
    <>
      <Link to="/admin/dashboard" style={linkStyle('/admin/dashboard')}>
        Dashboard
      </Link>
      <Link to="/admin/sites" style={linkStyle('/admin/sites')}>
        Sites
      </Link>
      <Link to="/admin/users" style={linkStyle('/admin/users')}>
        Users
      </Link>
      <Link to="/admin/equipment" style={linkStyle('/admin/equipment')}>
        Equipment
      </Link>
      <Link to="/admin/reports" style={linkStyle('/admin/reports')}>
        Reports
      </Link>
    </>
  );

  const getSupervisorLinks = () => (
    <>
      <Link to="/supervisor/dashboard" style={linkStyle('/supervisor/dashboard')}>
        Dashboard
      </Link>
      <Link to="/supervisor/sites" style={linkStyle('/supervisor/sites')}>
        My Sites
      </Link>
      <Link to="/supervisor/attendance" style={linkStyle('/supervisor/attendance')}>
        Attendance
      </Link>
      <Link to="/supervisor/tasks" style={linkStyle('/supervisor/tasks')}>
        Tasks
      </Link>
      <Link to="/supervisor/equipment" style={linkStyle('/supervisor/equipment')}>
        Equipment
      </Link>
    </>
  );

  const getWorkerLinks = () => (
    <>
      <Link to="/worker/dashboard" style={linkStyle('/worker/dashboard')}>
        Dashboard
      </Link>
      <Link to="/worker/attendance" style={linkStyle('/worker/attendance')}>
        My Attendance
      </Link>
      <Link to="/worker/tasks" style={linkStyle('/worker/tasks')}>
        My Tasks
      </Link>
      <Link to="/worker/payments" style={linkStyle('/worker/payments')}>
        Payments
      </Link>
    </>
  );

  const getAccountantLinks = () => (
    <>
      <Link to="/accountant/dashboard" style={linkStyle('/accountant/dashboard')}>
        Dashboard
      </Link>
      <Link to="/accountant/calculate" style={linkStyle('/accountant/calculate')}>
        Calculate Salary
      </Link>
      <Link to="/accountant/payments" style={linkStyle('/accountant/payments')}>
        Payments
      </Link>
      <Link to="/accountant/reports" style={linkStyle('/accountant/reports')}>
        Reports
      </Link>
    </>
  );

  const getLinks = () => {
    switch (user?.role) {
      case 'admin':
        return getAdminLinks();
      case 'supervisor':
        return getSupervisorLinks();
      case 'worker':
        return getWorkerLinks();
      case 'accountant':
        return getAccountantLinks();
      default:
        return null;
    }
  };

  return (
    <aside style={{
      width: '250px',
      backgroundColor: '#f8f9fa',
      minHeight: 'calc(100vh - 60px)',
      padding: '1rem 0',
      borderRight: '1px solid #dee2e6'
    }}>
      <nav style={{ display: 'flex', flexDirection: 'column' }}>
        {getLinks()}
      </nav>
    </aside>
  );
};

export default Sidebar;

