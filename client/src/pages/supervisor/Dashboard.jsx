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
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="mt-3">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Supervisor Dashboard</h1>
          <p className="text-muted mb-0">Manage your assigned sites and workers</p>
        </div>
      </div>

      {stats && (
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4">
            <div className="stat-card">
              <div className="stat-label">Assigned Sites</div>
              <div className="stat-value text-primary">{stats.sites || 0}</div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="stat-card">
              <div className="stat-label">Attendance Records</div>
              <div className="stat-value text-success">{stats.attendance?.total || 0}</div>
              <div className="stat-subtext">{stats.attendance?.present || 0} Present · {stats.attendance?.absent || 0} Absent</div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="stat-card">
              <div className="stat-label">Total Tasks</div>
              <div className="stat-value text-warning">{stats.tasks?.total || 0}</div>
              <div className="stat-subtext">{stats.tasks?.pending || 0} Pending · {stats.tasks?.completed || 0} Completed</div>
            </div>
          </div>
        </div>
      )}

      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title text-primary mb-0">🏗️ My Assigned Sites</h5>
            <Link to="/supervisor/sites">View All →</Link>
          </div>

          {sites.length === 0 ? (
            <p className="text-muted">No sites assigned</p>
          ) : (
            <div className="row g-3">
              {sites.slice(0, 3).map((site) => (
                <div key={site._id} className="col-12 col-md-4">
                  <div className="card">
                    <div className="card-body">
                      <h6 className="text-primary mb-1">{site.siteName}</h6>
                      <p className="text-muted mb-2">📍 {site.location}</p>
                      <span className={`badge ${site.status === 'Ongoing' ? 'bg-success' : site.status === 'Temporarily Paused' ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                        {site.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h5 className="card-title text-primary">⚡ Quick Actions</h5>
          <div className="quick-actions">
            <Link to="/supervisor/site-workers" className="btn btn-outline-primary">Site Workers</Link>
            <Link to="/supervisor/attendance" className="btn btn-primary">Mark Attendance</Link>
            <Link to="/supervisor/tasks" className="btn btn-outline-primary">Assign Task</Link>
            <Link to="/supervisor/equipment" className="btn btn-outline-secondary">Track Equipment</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;

