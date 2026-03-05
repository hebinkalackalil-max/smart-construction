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
    return <div className="text-center py-5">Loading...</div>;
  }

  return (
    <div className="app-container">
      <h1 className="mb-4" style={{ color: 'var(--primary)' }}>Financial Reports</h1>

      {reports && (
        <>
          {/* Financial Summary */}
          <div className="mb-4">
            <h5 style={{ color: 'var(--primary)' }}>Financial Summary</h5>
            <div className="card p-3">
              <div className="row g-3">
                <div className="col-12 col-md-3">
                  <div className="muted-small">Total Salary Paid</div>
                  <div className="fw-bold text-success">₹{reports.payments?.totalSalaryPaid?.toLocaleString() || 0}</div>
                </div>
                <div className="col-12 col-md-3">
                  <div className="muted-small">Total Payments</div>
                  <div className="fw-bold">{reports.payments?.total || 0}</div>
                </div>
                <div className="col-12 col-md-3">
                  <div className="muted-small">Pending Payments</div>
                  <div className="fw-bold text-warning">{reports.payments?.pending || 0}</div>
                </div>
                <div className="col-12 col-md-3">
                  <div className="muted-small">Paid Payments</div>
                  <div className="fw-bold text-success">{reports.payments?.paid || 0}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Overview */}
          <div className="mb-4">
            <h5 style={{ color: 'var(--primary)' }}>Attendance Overview</h5>
            <div className="card p-3">
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <div className="muted-small">Total Records</div>
                  <div className="fw-bold">{reports.attendance?.total || 0}</div>
                </div>
                <div className="col-12 col-md-4">
                  <div className="muted-small">Present</div>
                  <div className="fw-bold text-success">{reports.attendance?.present || 0}</div>
                </div>
                <div className="col-12 col-md-4">
                  <div className="muted-small">Absent</div>
                  <div className="fw-bold text-danger">{reports.attendance?.absent || 0}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sites Overview */}
          <div className="mb-4">
            <h5 style={{ color: 'var(--primary)' }}>Sites Overview</h5>
            <div className="card p-3">
              <div className="row g-3">
                <div className="col-6 col-md-3">
                  <div className="muted-small">Total Sites</div>
                  <div className="fw-bold">{reports.sites?.total || 0}</div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="muted-small">Ongoing</div>
                  <div className="fw-bold text-success">{reports.sites?.ongoing || 0}</div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="muted-small">Temporarily Paused</div>
                  <div className="fw-bold text-warning">{reports.sites?.paused || 0}</div>
                </div>
                <div className="col-6 col-md-3">
                  <div className="muted-small">Completed</div>
                  <div className="fw-bold text-muted">{reports.sites?.completed || 0}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Users Overview */}
          <div className="mb-4">
            <h5 style={{ color: 'var(--primary)' }}>Users Overview</h5>
            <div className="card p-3">
              <div className="row g-3">
                <div className="col-12 col-md-3">
                  <div className="muted-small">Total Users</div>
                  <div className="fw-bold">{reports.users?.total || 0}</div>
                </div>
                <div className="col-12 col-md-3">
                  <div className="muted-small">Workers</div>
                  <div className="fw-bold text-success">{reports.users?.worker || 0}</div>
                </div>
                <div className="col-12 col-md-3">
                  <div className="muted-small">Supervisors</div>
                  <div className="fw-bold">{reports.users?.supervisor || 0}</div>
                </div>
                <div className="col-12 col-md-3">
                  <div className="muted-small">Accountants</div>
                  <div className="fw-bold text-warning">{reports.users?.accountant || 0}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Tasks Overview */}
          <div className="mb-4">
            <h5 style={{ color: 'var(--primary)' }}>Tasks Overview</h5>
            <div className="card p-3">
              <div className="row g-3">
                <div className="col-12 col-md-3">
                  <div className="muted-small">Total Tasks</div>
                  <div className="fw-bold">{reports.tasks?.total || 0}</div>
                </div>
                <div className="col-12 col-md-3">
                  <div className="muted-small">Pending</div>
                  <div className="fw-bold text-warning">{reports.tasks?.pending || 0}</div>
                </div>
                <div className="col-12 col-md-3">
                  <div className="muted-small">In Progress</div>
                  <div className="fw-bold">{reports.tasks?.inProgress || 0}</div>
                </div>
                <div className="col-12 col-md-3">
                  <div className="muted-small">Completed</div>
                  <div className="fw-bold text-success">{reports.tasks?.completed || 0}</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;

