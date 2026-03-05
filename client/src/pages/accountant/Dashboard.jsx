import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { formatDate } from '../../utils/dateFormat';

const AccountantDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentPayments, setRecentPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [paymentsResponse, attendanceResponse] = await Promise.all([
        api.get('/payments'),
        api.get('/attendance')
      ]);

      const payments = paymentsResponse.data.data || [];
      const attendance = attendanceResponse.data.data || [];

      // Calculate stats
      const pendingPayments = payments.filter(p => p.paymentStatus === 'Pending');
      const paidPayments = payments.filter(p => p.paymentStatus === 'Paid');
      const totalPaid = paidPayments.reduce((sum, p) => sum + p.salaryAmount, 0);
      const totalPending = pendingPayments.reduce((sum, p) => sum + p.salaryAmount, 0);
      const totalWorkers = new Set(attendance.map(a => a.workerID?._id || a.workerID)).size;

      setStats({
        totalPayments: payments.length,
        pendingPayments: pendingPayments.length,
        paidPayments: paidPayments.length,
        totalPaid,
        totalPending,
        totalWorkers
      });

      setRecentPayments(payments.slice(0, 5));
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
          <h1 className="page-title">Accountant Dashboard</h1>
          <p className="text-muted mb-0">Manage payments, salaries, and financial reports</p>
        </div>
      </div>

      {stats && (
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-6 col-lg-3">
            <div className="stat-card">
              <div className="stat-label">Total Payments</div>
              <div className="stat-value text-primary">{stats.totalPayments || 0}</div>
              <div className="stat-subtext">{stats.paidPayments || 0} Paid · {stats.pendingPayments || 0} Pending</div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <div className="stat-card">
              <div className="stat-label">Total Paid</div>
              <div className="stat-value text-success">₹{stats.totalPaid?.toLocaleString() || 0}</div>
              <div className="stat-subtext">Processed Payments</div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <div className="stat-card">
              <div className="stat-label">Pending Amount</div>
              <div className="stat-value text-warning">₹{stats.totalPending?.toLocaleString() || 0}</div>
              <div className="stat-subtext">Awaiting Approval</div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-3">
            <div className="stat-card">
              <div className="stat-label">Active Workers</div>
              <div className="stat-value" style={{ color: 'var(--info)' }}>{stats.totalWorkers || 0}</div>
              <div className="stat-subtext">Workers with Records</div>
            </div>
          </div>
        </div>
      )}

      <div className="card p-3 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 style={{ margin: 0, color: 'var(--primary)' }}>Recent Payments</h5>
          <Link to="/accountant/payments" className="text-decoration-none" style={{ color: 'var(--primary)' }}>View All →</Link>
        </div>

        {recentPayments.length === 0 ? (
          <p className="muted-small">No payment records</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped mb-0">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Amount</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((payment) => (
                  <tr key={payment._id}>
                    <td>{payment.workerID?.name || 'N/A'}</td>
                    <td className="fw-semibold">₹{payment.salaryAmount?.toLocaleString() || 0}</td>
                    <td>{payment.totalDays} days</td>
                    <td><span className={`badge ${payment.paymentStatus === 'Paid' ? 'bg-success' : 'bg-warning text-dark'}`}>{payment.paymentStatus}</span></td>
                    <td>{formatDate(payment.createdAt)}</td>
                    <td>{payment.paymentStatus === 'Paid' ? <Link to={`/accountant/payslip/${payment._id}`} className="text-decoration-none" style={{ color: 'var(--primary)' }}>View Payslip</Link> : <span className="text-muted">-</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-body">
          <h5 className="card-title text-primary">⚡ Quick Actions</h5>
          <div className="quick-actions">
            <Link to="/accountant/calculate" className="btn btn-success">Calculate Salary</Link>
            <Link to="/accountant/payments" className="btn btn-primary">Approve Payments</Link>
            <Link to="/accountant/reports" className="btn btn-outline-primary">View Reports</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountantDashboard;

