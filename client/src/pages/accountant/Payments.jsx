import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { formatDate } from '../../utils/dateFormat';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState('all'); // all, pending, paid
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [workerFilter, setWorkerFilter] = useState('all');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await api.get('/payments');
      setPayments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      alert('Error fetching payments');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (paymentId) => {
    if (!window.confirm('Are you sure you want to approve this payment?')) return;

    try {
      await api.put(`/payments/${paymentId}/approve`);
      alert('Payment approved successfully');
      fetchPayments();
    } catch (error) {
      alert(error.response?.data?.message || 'Error approving payment');
    }
  };

  // Get unique workers for filter
  const uniqueWorkers = [...new Set(payments.map(p => p.workerID?._id || p.workerID).filter(Boolean))];
  const workerOptions = uniqueWorkers.map(workerId => {
    const payment = payments.find(p => (p.workerID?._id || p.workerID) === workerId);
    return { id: workerId, name: payment?.workerID?.name || 'Unknown' };
  });

  const filteredPayments = payments.filter(payment => {
    // Status filter
    if (filter === 'pending' && payment.paymentStatus !== 'Pending') return false;
    if (filter === 'paid' && payment.paymentStatus !== 'Paid') return false;
    
    // Worker filter
    if (workerFilter !== 'all' && (payment.workerID?._id || payment.workerID) !== workerFilter) return false;
    
    // Search filter
    const matchesSearch = payment.workerID?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (loading) {
    return <div className="text-center py-5">Loading...</div>;
  }

  return (
    <div className="app-container">
      <div className="mb-4">
        <h1 className="mb-3" style={{ color: 'var(--primary)' }}>Payment Management</h1>

        {/* Filters */}
        <div className="card p-3 mb-3">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-6">
              <input type="text" className="form-control" placeholder="Search by worker name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="col-6 col-md-3">
              <select value={filter} onChange={(e) => setFilter(e.target.value)} className="form-select">
                <option value="all">All Payments</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div className="col-6 col-md-3">
              {workerOptions.length > 0 && (
                <select value={workerFilter} onChange={(e) => setWorkerFilter(e.target.value)} className="form-select">
                  <option value="all">All Workers</option>
                  {workerOptions.map(worker => (
                    <option key={worker.id} value={worker.id}>{worker.name}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row g-3 mb-3">
        <div className="col-12 col-md-3">
          <div className="card p-3 text-center">
            <small className="muted-small">Total Payments</small>
            <h4 className="mt-2">{payments.length}</h4>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card p-3 text-center">
            <small className="muted-small">Pending</small>
            <h4 className="mt-2">{payments.filter(p => p.paymentStatus === 'Pending').length}</h4>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card p-3 text-center">
            <small className="muted-small">Paid</small>
            <h4 className="mt-2">{payments.filter(p => p.paymentStatus === 'Paid').length}</h4>
          </div>
        </div>
        <div className="col-12 col-md-3">
          <div className="card p-3 text-center">
            <small className="muted-small">Total Paid Amount</small>
            <h4 className="mt-2">₹{payments.filter(p => p.paymentStatus === 'Paid').reduce((sum, p) => sum + p.salaryAmount, 0).toLocaleString()}</h4>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="card p-3">
        <h5 style={{ color: 'var(--primary)' }}>Payment List</h5>
        {filteredPayments.length === 0 ? (
          <p className="muted-small">No payments found</p>
        ) : (
          <div className="table-responsive mt-3">
            <table className="table table-striped mb-0">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Date</th>
                  <th>Days</th>
                  <th>Overtime</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => (
                  <tr key={payment._id}>
                    <td>{payment.workerID?.name || 'N/A'}</td>
                    <td>{formatDate(payment.createdAt)}</td>
                    <td>{payment.totalDays} days</td>
                    <td>{payment.overtimeHours || 0} hrs</td>
                    <td className="fw-semibold">₹{payment.salaryAmount?.toLocaleString() || 0}</td>
                    <td><span className={`badge ${payment.paymentStatus === 'Paid' ? 'bg-success' : 'bg-warning text-dark'}`}>{payment.paymentStatus}</span></td>
                    <td>
                      <div className="d-flex gap-2">
                        {payment.paymentStatus === 'Pending' && <button className="btn btn-success btn-sm" onClick={() => handleApprove(payment._id)}>Approve</button>}
                        {payment.paymentStatus === 'Paid' && <Link to={`/accountant/payslip/${payment._id}`} className="btn btn-primary btn-sm">View Payslip</Link>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;

