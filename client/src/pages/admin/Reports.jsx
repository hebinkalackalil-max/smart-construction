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
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  }

  const cardStyle = {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '1.5rem'
  };

  const sectionStyle = {
    marginBottom: '2rem'
  };

  return (
    <div>
      <h1 style={{ marginBottom: '2rem', color: '#2c3e50' }}>System Reports</h1>

      {reports && (
        <>
          {/* Sites Section */}
          <div style={sectionStyle}>
            <h2 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Sites Overview</h2>
            <div style={cardStyle}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>Total Sites</p>
                  <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#3498db' }}>
                    {reports.sites?.total || 0}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>Ongoing</p>
                  <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#27ae60' }}>
                    {reports.sites?.ongoing || 0}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>Completed</p>
                  <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#95a5a6' }}>
                    {reports.sites?.completed || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Users Section */}
          <div style={sectionStyle}>
            <h2 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Users Overview</h2>
            <div style={cardStyle}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>Total Users</p>
                  <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#3498db' }}>
                    {reports.users?.total || 0}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>Admins</p>
                  <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#e74c3c' }}>
                    {reports.users?.admin || 0}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>Supervisors</p>
                  <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#3498db' }}>
                    {reports.users?.supervisor || 0}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>Workers</p>
                  <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#27ae60' }}>
                    {reports.users?.worker || 0}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>Accountants</p>
                  <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#f39c12' }}>
                    {reports.users?.accountant || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Section */}
          <div style={sectionStyle}>
            <h2 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Attendance Overview</h2>
            <div style={cardStyle}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>Total Records</p>
                  <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#3498db' }}>
                    {reports.attendance?.total || 0}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>Present</p>
                  <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#27ae60' }}>
                    {reports.attendance?.present || 0}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>Absent</p>
                  <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#e74c3c' }}>
                    {reports.attendance?.absent || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payments Section */}
          <div style={sectionStyle}>
            <h2 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Payments Overview</h2>
            <div style={cardStyle}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>Total Payments</p>
                  <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#3498db' }}>
                    {reports.payments?.total || 0}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>Pending</p>
                  <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#f39c12' }}>
                    {reports.payments?.pending || 0}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>Paid</p>
                  <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#27ae60' }}>
                    {reports.payments?.paid || 0}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>Total Salary Paid</p>
                  <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#27ae60' }}>
                    ₹{reports.payments?.totalSalaryPaid?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tasks Section */}
          <div style={sectionStyle}>
            <h2 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Tasks Overview</h2>
            <div style={cardStyle}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>Total Tasks</p>
                  <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#3498db' }}>
                    {reports.tasks?.total || 0}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>Pending</p>
                  <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#f39c12' }}>
                    {reports.tasks?.pending || 0}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>In Progress</p>
                  <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#3498db' }}>
                    {reports.tasks?.inProgress || 0}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>Completed</p>
                  <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#27ae60' }}>
                    {reports.tasks?.completed || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Equipment Section */}
          <div style={sectionStyle}>
            <h2 style={{ color: '#2c3e50', marginBottom: '1rem' }}>Equipment Overview</h2>
            <div style={cardStyle}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>Total Equipment</p>
                  <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#3498db' }}>
                    {reports.equipment?.total || 0}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>Available</p>
                  <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#27ae60' }}>
                    {reports.equipment?.available || 0}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>In Use</p>
                  <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#3498db' }}>
                    {reports.equipment?.inUse || 0}
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 0.5rem 0', color: '#7f8c8d', fontSize: '0.9rem' }}>Maintenance</p>
                  <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#e67e22' }}>
                    {reports.equipment?.maintenance || 0}
                  </p>
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

