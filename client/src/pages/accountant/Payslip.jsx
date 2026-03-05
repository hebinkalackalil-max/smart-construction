import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../utils/api';
import { formatDate } from '../../utils/dateFormat';

const Payslip = () => {
  const { id } = useParams();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayment();
  }, [id]);

  const fetchPayment = async () => {
    try {
      const response = await api.get(`/payments/${id}`);
      setPayment(response.data.data);
    } catch (error) {
      console.error('Error fetching payment:', error);
      alert('Error fetching payment details');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  }

  if (!payment) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Payment not found</div>;
  }

  const cardStyle = {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    maxWidth: '800px',
    margin: '0 auto'
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, color: '#2c3e50' }}>Payslip</h1>
        <button
          onClick={handlePrint}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          🖨️ Print Payslip
        </button>
      </div>

      <div style={cardStyle}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '2px solid #dee2e6', paddingBottom: '1.5rem' }}>
          <h2 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>Construction Management System</h2>
          <p style={{ margin: 0, color: '#666' }}>Salary Payslip</p>
        </div>

        {/* Employee Details */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50', borderBottom: '1px solid #dee2e6', paddingBottom: '0.5rem' }}>
            Employee Details
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <p style={{ margin: '0.5rem 0', color: '#666' }}><strong>Name:</strong> {payment.workerID?.name || 'N/A'}</p>
              <p style={{ margin: '0.5rem 0', color: '#666' }}><strong>Email:</strong> {payment.workerID?.email || 'N/A'}</p>
            </div>
            <div>
              <p style={{ margin: '0.5rem 0', color: '#666' }}><strong>Payment Date:</strong> {formatDate(payment.createdAt)}</p>
              <p style={{ margin: '0.5rem 0', color: '#666' }}><strong>Status:</strong> 
                <span style={{
                  marginLeft: '0.5rem',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  backgroundColor: payment.paymentStatus === 'Paid' ? '#d4edda' : '#fff3cd',
                  color: payment.paymentStatus === 'Paid' ? '#155724' : '#856404'
                }}>
                  {payment.paymentStatus}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Salary Details */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50', borderBottom: '1px solid #dee2e6', paddingBottom: '0.5rem' }}>
            Salary Details
          </h3>
          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '1.5rem',
            borderRadius: '4px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: '#666' }}>Total Days Worked:</span>
              <strong>{payment.totalDays} days</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ color: '#666' }}>Overtime Hours:</span>
              <strong>{payment.overtimeHours || 0} hours</strong>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '1.5rem',
              paddingTop: '1rem',
              borderTop: '2px solid #dee2e6',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              color: '#27ae60'
            }}>
              <span>Total Salary Amount:</span>
              <span>₹{payment.salaryAmount?.toLocaleString() || 0}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #dee2e6', color: '#666', fontSize: '0.9rem' }}>
          <p style={{ margin: 0 }}>This is a computer-generated payslip. No signature required.</p>
          <p style={{ margin: '0.5rem 0 0 0' }}>Generated on {formatDate(new Date())}</p>
        </div>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable, .printable * {
            visibility: visible;
          }
          .printable {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Payslip;

