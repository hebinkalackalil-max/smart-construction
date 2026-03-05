import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api';
import { formatDate } from '../../utils/dateFormat';

const Payslip = () => {
  const { id } = useParams();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPayment();
  }, [id]);

  const fetchPayment = async () => {
    try {
      setError(null);
      const response = await api.get(`/payments/${id}`);
      setPayment(response.data.data);
    } catch (err) {
      console.error('Error fetching payment:', err);
      setError(err.response?.status === 403 ? 'You can only view your own payslips.' : 'Could not load payslip.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="text-center py-5">Loading...</div>;
  }

  if (error || !payment) {
    return (
      <div className="p-4">
        <div className="alert alert-danger">{error || 'Payslip not found.'}</div>
        <Link to="/worker/payments" className="text-decoration-none" style={{ color: 'var(--primary)' }}>← Back to My Payments</Link>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 style={{ color: 'var(--primary)', margin: 0 }}>My Payslip</h1>
        <div className="d-flex gap-2">
          <Link to="/worker/payments" className="btn btn-secondary">← Back to Payments</Link>
          <button onClick={handlePrint} className="btn btn-primary">🖨️ Print Payslip</button>
        </div>
      </div>

      <div className="card p-4 mx-auto" style={{ maxWidth: 900 }}>
        <div className="text-center mb-4 border-bottom pb-3">
          <h4 style={{ margin: 0, color: 'var(--primary)' }}>Construction Management System</h4>
          <p className="muted-small mb-0">Salary Payslip</p>
        </div>

        <div className="mb-4">
          <h6 style={{ color: 'var(--primary)' }}>Employee Details</h6>
          <div className="row">
            <div className="col-12 col-md-6">
              <p className="muted-small mb-1"><strong>Name:</strong> {payment.workerID?.name || 'N/A'}</p>
              <p className="muted-small mb-0"><strong>Email:</strong> {payment.workerID?.email || 'N/A'}</p>
            </div>
            <div className="col-12 col-md-6">
              <p className="muted-small mb-1"><strong>Payment Date:</strong> {formatDate(payment.createdAt)}</p>
              <p className="muted-small mb-0"><strong>Status:</strong> <span className={`badge ${payment.paymentStatus === 'Paid' ? 'bg-success' : 'bg-warning text-dark'}`}>{payment.paymentStatus}</span></p>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <h6 style={{ color: 'var(--primary)' }}>Salary Details</h6>
          <div className="p-3 bg-light rounded">
            <div className="d-flex justify-content-between mb-2">
              <span className="muted-small">Total Days Worked:</span>
              <strong>{payment.totalDays} days</strong>
            </div>
            <div className="d-flex justify-content-between mb-2">
              <span className="muted-small">Overtime Hours:</span>
              <strong>{payment.overtimeHours || 0} hours</strong>
            </div>
            <div className="d-flex justify-content-between mt-3 pt-3 border-top fw-bold" style={{ color: '#27ae60', fontSize: '1.1rem' }}>
              <span>Total Salary Amount:</span>
              <span>₹{payment.salaryAmount?.toLocaleString() || 0}</span>
            </div>
          </div>
        </div>

        <div className="text-center muted-small">
          <p className="mb-0">This is a computer-generated payslip.</p>
          <p className="mb-0">Generated on {formatDate(new Date())}</p>
        </div>
      </div>
    </div>
  );
};

export default Payslip;
