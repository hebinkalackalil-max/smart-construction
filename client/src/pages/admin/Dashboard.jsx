import { useState, useEffect } from 'react';
import api from '../../utils/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/reports');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  }

  const cardStyle = {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '1.5rem'
  };

  const statCardStyle = {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center'
  };

  return (
    <div>
      <h1 style={{ marginBottom: '2rem', color: '#2c3e50' }}>Admin Dashboard</h1>

      {stats && (
        <>
          {/* Statistics Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={statCardStyle}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>Total Sites</h3>
              <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#3498db' }}>
                {stats.sites?.total || 0}
              </p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#95a5a6' }}>
                {stats.sites?.ongoing || 0} Ongoing, {stats.sites?.completed || 0} Completed
              </p>
            </div>

            <div style={statCardStyle}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>Total Users</h3>
              <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#27ae60' }}>
                {stats.users?.total || 0}
              </p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#95a5a6' }}>
                {stats.users?.worker || 0} Workers, {stats.users?.supervisor || 0} Supervisors
              </p>
            </div>

            <div style={statCardStyle}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>Total Payments</h3>
              <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#e67e22' }}>
                {stats.payments?.total || 0}
              </p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#95a5a6' }}>
                {stats.payments?.pending || 0} Pending, {stats.payments?.paid || 0} Paid
              </p>
            </div>

            <div style={statCardStyle}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>Total Equipment</h3>
              <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#9b59b6' }}>
                {stats.equipment?.total || 0}
              </p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#95a5a6' }}>
                {stats.equipment?.available || 0} Available, {stats.equipment?.inUse || 0} In Use
              </p>
            </div>
          </div>

          {/* Detailed Statistics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div style={cardStyle}>
              <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Attendance Overview</h3>
              <p><strong>Total Records:</strong> {stats.attendance?.total || 0}</p>
              <p><strong>Present:</strong> {stats.attendance?.present || 0}</p>
              <p><strong>Absent:</strong> {stats.attendance?.absent || 0}</p>
            </div>

            <div style={cardStyle}>
              <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Tasks Overview</h3>
              <p><strong>Total Tasks:</strong> {stats.tasks?.total || 0}</p>
              <p><strong>Pending:</strong> {stats.tasks?.pending || 0}</p>
              <p><strong>In Progress:</strong> {stats.tasks?.inProgress || 0}</p>
              <p><strong>Completed:</strong> {stats.tasks?.completed || 0}</p>
            </div>

            <div style={cardStyle}>
              <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Financial Summary</h3>
              <p><strong>Total Salary Paid:</strong> ₹{stats.payments?.totalSalaryPaid?.toLocaleString() || 0}</p>
              <p><strong>Pending Payments:</strong> {stats.payments?.pending || 0}</p>
              <p><strong>Paid Payments:</strong> {stats.payments?.paid || 0}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;

