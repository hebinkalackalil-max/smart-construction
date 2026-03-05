import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { formatDate } from '../../utils/dateFormat';

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
    if (!selectedSite) {
      setWorkers([]);
      return;
    }
    try {
      const response = await api.get(`/sites/${selectedSite}/workers`);
      setWorkers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching workers for site:', error);
      setWorkers([]);
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
    <div className="app-container">
      <h1 className="mb-4" style={{ color: 'var(--primary)' }}>Mark Attendance</h1>

      <div className="card p-3 mb-4">
        <h5 style={{ color: 'var(--primary)' }}>Mark Worker Attendance</h5>
        <form onSubmit={handleSubmit} className="row g-3 mt-2">
          <div className="col-12 col-md-6">
            <label className="form-label">Select Site *</label>
            <select value={selectedSite} onChange={(e) => setSelectedSite(e.target.value)} required className="form-select">
              <option value="">Select Site</option>
              {sites.map((site) => (
                <option key={site._id} value={site._id}>
                  {site.siteName} - {site.location}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label">Select Worker *</label>
            <select value={selectedWorker} onChange={(e) => setSelectedWorker(e.target.value)} required disabled={!selectedSite} className="form-select">
              <option value="">Select Worker</option>
              {workers.length === 0 && selectedSite ? (
                <option value="" disabled>No workers assigned to this site. Add them in Site Workers.</option>
              ) : (
                workers.map((worker) => (
                  <option key={worker._id} value={worker._id}>
                    {worker.name} ({worker.email})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label">Date *</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="form-control" />
          </div>

          <div className="col-12 col-md-4">
            <label className="form-label">Status *</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} required className="form-select">
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </div>

          {status === 'Present' && (
            <div className="col-12 col-md-4">
              <label className="form-label">Overtime Hours</label>
              <input type="number" value={overtime} onChange={(e) => setOvertime(e.target.value)} min="0" step="0.5" className="form-control" />
            </div>
          )}

          <div className="col-12">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Marking...' : 'Mark Attendance'}
            </button>
          </div>
        </form>
      </div>

      <div className="card p-3">
        <h5 style={{ color: 'var(--primary)' }}>Recent Attendance Records</h5>
        {attendanceRecords.length === 0 ? (
          <p className="muted-small">No attendance records found</p>
        ) : (
          <div className="table-responsive mt-2">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Site</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Overtime</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.slice(0, 10).map((record) => (
                  <tr key={record._id}>
                    <td>{record.workerID?.name || 'N/A'}</td>
                    <td>{record.siteID?.siteName || 'N/A'}</td>
                    <td>{formatDate(record.date)}</td>
                    <td>
                      <span className={`badge ${record.status === 'Present' ? 'bg-success' : 'bg-danger'}`}>
                        {record.status}
                      </span>
                    </td>
                    <td>{record.overtime || 0} hrs</td>
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

