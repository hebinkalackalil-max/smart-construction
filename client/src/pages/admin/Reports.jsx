import { useState, useEffect } from 'react';
import api from '../../utils/api';

const Reports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/reports');
      setReports(response.data.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      alert('Error fetching reports');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="mt-3">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="page-actions">
        <h1 className="page-title">System Reports</h1>
      </div>

      {reports && (
        <>
          {/* Sites Section */}
          <div className="report-section">
            <h2 className="section-title">Sites Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Total Sites</div>
                <div className="stat-value stat-primary">{reports.sites?.total || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Ongoing</div>
                <div className="stat-value stat-success">{reports.sites?.ongoing || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Temporarily Paused</div>
                <div className="stat-value stat-warning">{reports.sites?.paused || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Completed</div>
                <div className="stat-value stat-secondary">{reports.sites?.completed || 0}</div>
              </div>
            </div>
          </div>

          {/* Users Section */}
          <div className="report-section">
            <h2 className="section-title">Users Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Total Users</div>
                <div className="stat-value stat-primary">{reports.users?.total || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Admins</div>
                <div className="stat-value stat-danger">{reports.users?.admin || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Supervisors</div>
                <div className="stat-value stat-primary">{reports.users?.supervisor || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Workers</div>
                <div className="stat-value stat-success">{reports.users?.worker || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Accountants</div>
                <div className="stat-value stat-warning">{reports.users?.accountant || 0}</div>
              </div>
            </div>
          </div>

          {/* Attendance Section */}
          <div className="report-section">
            <h2 className="section-title">Attendance Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Total Records</div>
                <div className="stat-value stat-primary">{reports.attendance?.total || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Present</div>
                <div className="stat-value stat-success">{reports.attendance?.present || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Absent</div>
                <div className="stat-value stat-danger">{reports.attendance?.absent || 0}</div>
              </div>
            </div>
          </div>

          {/* Payments Section */}
          <div className="report-section">
            <h2 className="section-title">Payments Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Total Payments</div>
                <div className="stat-value stat-primary">{reports.payments?.total || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Pending</div>
                <div className="stat-value stat-warning">{reports.payments?.pending || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Paid</div>
                <div className="stat-value stat-success">{reports.payments?.paid || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total Salary Paid</div>
                <div className="stat-value stat-success">₹{reports.payments?.totalSalaryPaid?.toLocaleString() || 0}</div>
              </div>
            </div>
          </div>

          {/* Tasks Section */}
          <div className="report-section">
            <h2 className="section-title">Tasks Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Total Tasks</div>
                <div className="stat-value stat-primary">{reports.tasks?.total || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Pending</div>
                <div className="stat-value stat-warning">{reports.tasks?.pending || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">In Progress</div>
                <div className="stat-value stat-primary">{reports.tasks?.inProgress || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Completed</div>
                <div className="stat-value stat-success">{reports.tasks?.completed || 0}</div>
              </div>
            </div>
          </div>

          {/* Equipment Section */}
          <div className="report-section">
            <h2 className="section-title">Equipment Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Total Equipment</div>
                <div className="stat-value stat-primary">{reports.equipment?.total || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Available</div>
                <div className="stat-value stat-success">{reports.equipment?.available || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">In Use</div>
                <div className="stat-value stat-primary">{reports.equipment?.inUse || 0}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Maintenance</div>
                <div className="stat-value stat-maintenance">{reports.equipment?.maintenance || 0}</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;

