import { useState, useEffect } from 'react';
import api from '../../utils/api';

const Attendance = () => {
  const [sites, setSites] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [selectedSite, setSelectedSite] = useState('');
  const [selectedWorker, setSelectedWorker] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('Present');
  const [overtime, setOvertime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);

  useEffect(() => {
    fetchSites();
    fetchAttendance();
  }, []);

  useEffect(() => {
    if (selectedSite) {
      fetchWorkersForSite();
    }
  }, [selectedSite]);

  const fetchSites = async () => {
    try {
      const response = await api.get('/sites');
      setSites(response.data.data);
    } catch (error) {
      console.error('Error fetching sites:', error);
    }
  };

  const fetchWorkersForSite = async () => {
    try {
      const response = await api.get('/users');
      const allWorkers = response.data.data.filter(u => u.role === 'worker');
      setWorkers(allWorkers);
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await api.get('/attendance');
      setAttendanceRecords(response.data.data || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSite || !selectedWorker) {
      alert('Please select both site and worker');
      return;
    }

    setLoading(true);
    try {
      await api.post('/attendance', {
        workerID: selectedWorker,
        siteID: selectedSite,
        date,
        status,
        overtime: parseFloat(overtime) || 0
      });
      alert('Attendance marked successfully');
      setSelectedWorker('');
      setStatus('Present');
      setOvertime(0);
      fetchAttendance();
    } catch (error) {
      alert(error.response?.data?.message || 'Error marking attendance');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    boxSizing: 'border-box',
    marginBottom: '1rem'
  };

  const cardStyle = {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '1.5rem'
  };

  return (
    <div>
      <h1 style={{ marginBottom: '2rem', color: '#2c3e50' }}>Mark Attendance</h1>

      {/* Mark Attendance Form */}
      <div style={cardStyle}>
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#2c3e50' }}>Mark Worker Attendance</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: '500' }}>
              Select Site *
            </label>
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              required
              style={inputStyle}
            >
              <option value="">Select Site</option>
              {sites.map((site) => (
                <option key={site._id} value={site._id}>
                  {site.siteName} - {site.location}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: '500' }}>
              Select Worker *
            </label>
            <select
              value={selectedWorker}
              onChange={(e) => setSelectedWorker(e.target.value)}
              required
              disabled={!selectedSite}
              style={inputStyle}
            >
              <option value="">Select Worker</option>
              {workers.map((worker) => (
                <option key={worker.id} value={worker.id}>
                  {worker.name} ({worker.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: '500' }}>
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: '500' }}>
              Status *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
              style={inputStyle}
            >
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </div>

          {status === 'Present' && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: '500' }}>
                Overtime Hours
              </label>
              <input
                type="number"
                value={overtime}
                onChange={(e) => setOvertime(e.target.value)}
                min="0"
                step="0.5"
                style={inputStyle}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: loading ? '#95a5a6' : '#27ae60',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '500'
            }}
          >
            {loading ? 'Marking...' : 'Mark Attendance'}
          </button>
        </form>
      </div>

      {/* Recent Attendance Records */}
      <div style={cardStyle}>
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#2c3e50' }}>Recent Attendance Records</h2>
        {attendanceRecords.length === 0 ? (
          <p style={{ color: '#666' }}>No attendance records found</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Worker</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Site</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Date</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Overtime</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.slice(0, 10).map((record) => (
                  <tr key={record._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '0.75rem' }}>
                      {record.workerID?.name || 'N/A'}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {record.siteID?.siteName || 'N/A'}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        backgroundColor: record.status === 'Present' ? '#d4edda' : '#f8d7da',
                        color: record.status === 'Present' ? '#155724' : '#721c24'
                      }}>
                        {record.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {record.overtime || 0} hrs
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

export default Attendance;

