import { useState, useEffect } from 'react';
import api from '../../utils/api';
import './Dashboard.css';

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
    return (
      <div className="loading-container-dark">
        <div className="spinner-dark"></div>
        <p style={{ marginTop: '1rem' }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Main content */}
      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Admin Dashboard</h1>
          <p className="dashboard-subtitle">Overview of your construction management system</p>
        </div>

        {stats && (
          <>
            <div className="stats-grid">
              <div className="stat-card-dark">
                <div className="stat-label">Total Sites</div>
                <div className="stat-value stat-primary">{stats.sites?.total || 0}</div>
                <div className="stat-subtext">{stats.sites?.ongoing || 0} Ongoing · {stats.sites?.paused || 0} Paused · {stats.sites?.completed || 0} Completed</div>
              </div>

              <div className="stat-card-dark">
                <div className="stat-label">Total Users</div>
                <div className="stat-value stat-success">{stats.users?.total || 0}</div>
                <div className="stat-subtext">{stats.users?.worker || 0} Workers · {stats.users?.supervisor || 0} Supervisors</div>
              </div>

              <div className="stat-card-dark">
                <div className="stat-label">Total Payments</div>
                <div className="stat-value stat-warning">{stats.payments?.total || 0}</div>
                <div className="stat-subtext">{stats.payments?.pending || 0} Pending · {stats.payments?.paid || 0} Paid</div>
              </div>

              <div className="stat-card-dark">
                <div className="stat-label">Total Equipment</div>
                <div className="stat-value stat-info">{stats.equipment?.total || 0}</div>
                <div className="stat-subtext">{stats.equipment?.available || 0} Available · {stats.equipment?.inUse || 0} In Use</div>
              </div>
            </div>

            <div className="overview-grid">
              <div className="overview-card">
                <h5 className="overview-card-title">📋 Attendance Overview</h5>
                <div className="overview-row">
                  <span className="overview-label">Total Records</span>
                  <span className="overview-value text-white">{stats.attendance?.total || 0}</span>
                </div>
                <div className="overview-row">
                  <span className="overview-label">Present</span>
                  <span className="overview-value text-success">{stats.attendance?.present || 0}</span>
                </div>
                <div className="overview-row">
                  <span className="overview-label">Absent</span>
                  <span className="overview-value text-danger">{stats.attendance?.absent || 0}</span>
                </div>
              </div>

              <div className="overview-card">
                <h5 className="overview-card-title">✅ Tasks Overview</h5>
                <div className="overview-row">
                  <span className="overview-label">Total Tasks</span>
                  <span className="overview-value text-white">{stats.tasks?.total || 0}</span>
                </div>
                <div className="overview-row">
                  <span className="overview-label">Pending</span>
                  <span className="overview-value text-warning">{stats.tasks?.pending || 0}</span>
                </div>
                <div className="overview-row">
                  <span className="overview-label">In Progress</span>
                  <span className="overview-value text-primary">{stats.tasks?.inProgress || 0}</span>
                </div>
                <div className="overview-row">
                  <span className="overview-label">Completed</span>
                  <span className="overview-value text-success">{stats.tasks?.completed || 0}</span>
                </div>
              </div>

              <div className="overview-card">
                <h5 className="overview-card-title">💰 Financial Summary</h5>
                <div className="overview-row">
                  <span className="overview-label">Total Salary Paid</span>
                  <span className="overview-value text-success">₹{stats.payments?.totalSalaryPaid?.toLocaleString() || 0}</span>
                </div>
                <div className="overview-row">
                  <span className="overview-label">Pending Payments</span>
                  <span className="overview-value text-warning">{stats.payments?.pending || 0}</span>
                </div>
                <div className="overview-row">
                  <span className="overview-label">Paid Payments</span>
                  <span className="overview-value text-success">{stats.payments?.paid || 0}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

