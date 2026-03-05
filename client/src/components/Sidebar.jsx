import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ user }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getAdminLinks = () => (
    <>
      <Link to="/admin/dashboard" className={`sidebar-link ${isActive('/admin/dashboard') ? 'active' : ''}`}>
        Dashboard
      </Link>
      <Link to="/admin/sites" className={`sidebar-link ${isActive('/admin/sites') ? 'active' : ''}`}>
        🏗️ Sites
      </Link>
      <Link to="/admin/users" className={`sidebar-link ${isActive('/admin/users') ? 'active' : ''}`}>
        👥 Users
      </Link>
      <Link to="/admin/equipment" className={`sidebar-link ${isActive('/admin/equipment') ? 'active' : ''}`}>
        🔧 Equipment
      </Link>
      <Link to="/admin/reports" className={`sidebar-link ${isActive('/admin/reports') ? 'active' : ''}`}>
        📈 Reports
      </Link>
    </>
  );

  const getSupervisorLinks = () => (
    <>
      <Link to="/supervisor/dashboard" className={`sidebar-link ${isActive('/supervisor/dashboard') ? 'active' : ''}`}>
        Dashboard
      </Link>
      <Link to="/supervisor/sites" className={`sidebar-link ${isActive('/supervisor/sites') ? 'active' : ''}`}>
        🏗️ My Sites
      </Link>
      <Link to="/supervisor/site-workers" className={`sidebar-link ${isActive('/supervisor/site-workers') ? 'active' : ''}`}>
        👷 Site Workers
      </Link>
      <Link to="/supervisor/attendance" className={`sidebar-link ${isActive('/supervisor/attendance') ? 'active' : ''}`}>
        📋 Attendance
      </Link>
      <Link to="/supervisor/tasks" className={`sidebar-link ${isActive('/supervisor/tasks') ? 'active' : ''}`}>
        ✅ Tasks
      </Link>
      <Link to="/supervisor/equipment" className={`sidebar-link ${isActive('/supervisor/equipment') ? 'active' : ''}`}>
        🔧 Equipment
      </Link>
    </>
  );

  const getWorkerLinks = () => (
    <>
      <Link to="/worker/dashboard" className={`sidebar-link ${isActive('/worker/dashboard') ? 'active' : ''}`}>
        Dashboard
      </Link>
      <Link to="/worker/attendance" className={`sidebar-link ${isActive('/worker/attendance') ? 'active' : ''}`}>
        📋 My Attendance
      </Link>
      <Link to="/worker/tasks" className={`sidebar-link ${isActive('/worker/tasks') ? 'active' : ''}`}>
        ✅ My Tasks
      </Link>
      <Link to="/worker/payments" className={`sidebar-link ${isActive('/worker/payments') ? 'active' : ''}`}>
        💰 Payments
      </Link>
    </>
  );

  const getAccountantLinks = () => (
    <>
      <Link to="/accountant/dashboard" className={`sidebar-link ${isActive('/accountant/dashboard') ? 'active' : ''}`}>
        Dashboard
      </Link>
      <Link to="/accountant/attendance" className={`sidebar-link ${isActive('/accountant/attendance') ? 'active' : ''}`}>
        📋 Attendance Records
      </Link>
      <Link to="/accountant/calculate" className={`sidebar-link ${isActive('/accountant/calculate') ? 'active' : ''}`}>
        🧮 Calculate Salary
      </Link>
      <Link to="/accountant/payments" className={`sidebar-link ${isActive('/accountant/payments') ? 'active' : ''}`}>
        💳 Payments
      </Link>
      <Link to="/accountant/reports" className={`sidebar-link ${isActive('/accountant/reports') ? 'active' : ''}`}>
        📈 Reports
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
    <aside className="app-sidebar">
      <nav style={{ display: 'flex', flexDirection: 'column' }}>
        {getLinks()}
      </nav>
    </aside>
  );
};

export default Sidebar;

