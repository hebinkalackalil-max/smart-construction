import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const SupervisorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sitesResponse, attendanceResponse, tasksResponse] = await Promise.all([
        api.get('/sites'),
        api.get('/attendance'),
        api.get('/tasks')
      ]);

      setSites(sitesResponse.data.data);
      
      const attendance = attendanceResponse.data.data || [];
      const tasks = tasksResponse.data.data || [];

      // Calculate stats
      const presentCount = attendance.filter(a => a.status === 'Present').length;
      const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
      const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
      const completedTasks = tasks.filter(t => t.status === 'Completed').length;

      setStats({
        sites: sitesResponse.data.data.length,
        attendance: {
          total: attendance.length,
          present: presentCount,
          absent: attendance.length - presentCount
        },
        tasks: {
          total: tasks.length,
          pending: pendingTasks,
          inProgress: inProgressTasks,
          completed: completedTasks
        }
      });
    } catch (error) {
      console.error('Error fetching data:', error);
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
      <h1 style={{ marginBottom: '2rem', color: '#2c3e50' }}>Supervisor Dashboard</h1>

      {/* Statistics Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={statCardStyle}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>Assigned Sites</h3>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#3498db' }}>
              {stats.sites || 0}
            </p>
          </div>

          <div style={statCardStyle}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>Attendance Records</h3>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#27ae60' }}>
              {stats.attendance?.total || 0}
            </p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#95a5a6' }}>
              {stats.attendance?.present || 0} Present, {stats.attendance?.absent || 0} Absent
            </p>
          </div>

          <div style={statCardStyle}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>Total Tasks</h3>
            <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#e67e22' }}>
              {stats.tasks?.total || 0}
            </p>
            <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#95a5a6' }}>
              {stats.tasks?.pending || 0} Pending, {stats.tasks?.completed || 0} Completed
            </p>
          </div>
        </div>
      )}

      {/* Assigned Sites */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, color: '#2c3e50' }}>My Assigned Sites</h2>
          <Link
            to="/supervisor/sites"
            style={{
              color: '#3498db',
              textDecoration: 'none',
              fontSize: '0.9rem'
            }}
          >
            View All →
          </Link>
        </div>
        {sites.length === 0 ? (
          <p style={{ color: '#666' }}>No sites assigned</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {sites.slice(0, 3).map((site) => (
              <div
                key={site._id}
                style={{
                  padding: '1rem',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  backgroundColor: '#f8f9fa'
                }}
              >
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>{site.siteName}</h3>
                <p style={{ margin: '0.5rem 0', color: '#666', fontSize: '0.9rem' }}>
                  📍 {site.location}
                </p>
                <p style={{ margin: '0.5rem 0 0 0' }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    backgroundColor: site.status === 'Ongoing' ? '#d4edda' : '#f8d7da',
                    color: site.status === 'Ongoing' ? '#155724' : '#721c24'
                  }}>
                    {site.status}
                  </span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={cardStyle}>
        <h2 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link
            to="/supervisor/attendance"
            style={{
              padding: '1rem 1.5rem',
              backgroundColor: '#27ae60',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: '500'
            }}
          >
            Mark Attendance
          </Link>
          <Link
            to="/supervisor/tasks"
            style={{
              padding: '1rem 1.5rem',
              backgroundColor: '#3498db',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: '500'
            }}
          >
            Assign Task
          </Link>
          <Link
            to="/supervisor/equipment"
            style={{
              padding: '1rem 1.5rem',
              backgroundColor: '#9b59b6',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: '500'
            }}
          >
            Track Equipment
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;

