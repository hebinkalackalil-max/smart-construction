import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { formatDate } from '../../utils/dateFormat';

const Payments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await api.get(`/payments/worker/${user.id}`);
      const paymentData = response.data.data || [];
      setPayments(paymentData);

      // Calculate summary
      const totalEarnings = paymentData
        .filter(p => p.paymentStatus === 'Paid')
        .reduce((sum, p) => sum + p.salaryAmount, 0);
      
      const pendingAmount = paymentData
        .filter(p => p.paymentStatus === 'Pending')
        .reduce((sum, p) => sum + p.salaryAmount, 0);

      const totalDays = paymentData.reduce((sum, p) => sum + p.totalDays, 0);
      const totalOvertime = paymentData.reduce((sum, p) => sum + p.overtimeHours, 0);

      setSummary({
        totalEarnings,
        pendingAmount,
        totalDays,
        totalOvertime,
        totalPayments: paymentData.length
      });
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-5">Loading...</div>;
  }

  return (
    <div className="app-container">
      <h1 className="mb-4" style={{ color: 'var(--primary)' }}>My Payments</h1>

      {summary && (
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-3">
            <div className="card p-3 text-center">
              <small className="muted-small">Total Earnings</small>
              <h4 className="mt-2" style={{ color: '#27ae60' }}>₹{summary.totalEarnings?.toLocaleString() || 0}</h4>
              <p className="muted-small mb-0">Paid Payments</p>
            </div>
          </div>

          <div className="col-12 col-md-3">
            <div className="card p-3 text-center">
              <small className="muted-small">Pending Amount</small>
              <h4 className="mt-2" style={{ color: '#f39c12' }}>₹{summary.pendingAmount?.toLocaleString() || 0}</h4>
              <p className="muted-small mb-0">Awaiting Payment</p>
            </div>
          </div>

          <div className="col-12 col-md-3">
            <div className="card p-3 text-center">
              <small className="muted-small">Total Days Worked</small>
              <h4 className="mt-2" style={{ color: 'var(--primary)' }}>{summary.totalDays || 0}</h4>
              <p className="muted-small mb-0">Days</p>
            </div>
          </div>

          <div className="col-12 col-md-3">
            <div className="card p-3 text-center">
              <small className="muted-small">Total Overtime</small>
              <h4 className="mt-2" style={{ color: '#9b59b6' }}>{summary.totalOvertime || 0}</h4>
              <p className="muted-small mb-0">Hours</p>
            </div>
          </div>
        </div>
      )}

      <div className="card p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 style={{ margin: 0, color: 'var(--primary)' }}>Payment History</h5>
          {payments.length > 0 && (
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-select" style={{ maxWidth: '180px' }}>
              <option value="all">All Payments</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>
          )}
        </div>

        {payments.length === 0 ? (
          <p className="muted-small">No payment records found</p>
        ) : (() => {
          const filteredPayments = payments.filter(payment =>
            statusFilter === 'all' || payment.paymentStatus === statusFilter
          );

          return filteredPayments.length === 0 ? (
            <p className="muted-small">No payments match your filter</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped mb-0">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Days</th>
                    <th>Overtime</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Payslip</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((payment) => (
                    <tr key={payment._id}>
                      <td>{formatDate(payment.createdAt)}</td>
                      <td>{payment.totalDays} days</td>
                      <td>{payment.overtimeHours || 0} hrs</td>
                      <td className="fw-semibold">₹{payment.salaryAmount?.toLocaleString() || 0}</td>
                      <td><span className={`badge ${payment.paymentStatus === 'Paid' ? 'bg-success' : 'bg-warning text-dark'}`}>{payment.paymentStatus}</span></td>
                      <td><Link to={`/worker/payslip/${payment._id}`} className="text-decoration-none" style={{ color: 'var(--primary)' }}>View Payslip</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default Payments;

