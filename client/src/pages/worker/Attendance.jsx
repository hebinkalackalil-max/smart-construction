import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { formatDate } from '../../utils/dateFormat';

const Attendance = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('Present');
  const [overtime, setOvertime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [siteFilter, setSiteFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all'); // all, thisMonth, lastMonth

  useEffect(() => {
    fetchAttendance();
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      const response = await api.get('/sites');
      setSites(response.data.data);
    } catch (error) {
      console.error('Error fetching sites:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await api.get(`/attendance/worker/${user.id}`);
      setAttendance(response.data.data || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setPageLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSite) {
      alert('Please select a site');
      return;
    }

    setLoading(true);
    try {
      await api.post('/attendance', {
        workerID: user.id,
        siteID: selectedSite,
        date,
        status,
        overtime: parseFloat(overtime) || 0
      });
      alert('Attendance marked successfully');
      setSelectedSite('');
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

  if (pageLoading) {
    return <div className="text-center py-5">Loading...</div>;
  }

  return (
    <div className="app-container">
      <h1 className="mb-4" style={{ color: 'var(--primary)' }}>My Attendance</h1>

      <div className="card p-3 mb-4">
        <h5 style={{ color: 'var(--primary)' }}>Mark My Attendance</h5>
        <form onSubmit={handleSubmit} className="row g-3 mt-2">
          <div className="col-12 col-md-6">
            <label className="form-label">Select Site *</label>
            <select value={selectedSite} onChange={(e) => setSelectedSite(e.target.value)} required className="form-select">
              <option value="">Select Site</option>
              {sites.filter(s => s.status === 'Ongoing').map((site) => (
                <option key={site._id} value={site._id}>
                  {site.siteName} - {site.location}
                </option>
              ))}
            </select>
            {sites.length > 0 && sites.filter(s => s.status === 'Ongoing').length === 0 && (
              <small className="text-muted">No Ongoing sites available for attendance.</small>
            )}
          </div>

          <div className="col-12 col-md-3">
            <label className="form-label">Date *</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="form-control" />
          </div>

          <div className="col-12 col-md-3">
            <label className="form-label">Status *</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} required className="form-select">
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </div>

          {status === 'Present' && (
            <div className="col-12 col-md-3">
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
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 style={{ margin: 0, color: 'var(--primary)' }}>Attendance History</h5>
        </div>

        {attendance.length > 0 && (
          <div className="row g-2 mb-3">
            <div className="col-12 col-md-6">
              <input type="text" className="form-control" placeholder="Search by site name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="col-6 col-md-2">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-select">
                <option value="all">All Statuses</option>
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
            {sites.length > 0 && (
              <div className="col-6 col-md-2">
                <select value={siteFilter} onChange={(e) => setSiteFilter(e.target.value)} className="form-select">
                  <option value="all">All Sites</option>
                  {sites.map(site => (
                    <option key={site._id} value={site._id}>{site.siteName}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="col-6 col-md-2">
              <select value={dateRangeFilter} onChange={(e) => setDateRangeFilter(e.target.value)} className="form-select">
                <option value="all">All time</option>
                <option value="thisMonth">This month</option>
                <option value="lastMonth">Last month</option>
              </select>
            </div>
          </div>
        )}

        {attendance.length === 0 ? (
          <p className="muted-small">No attendance records found</p>
        ) : (() => {
          const now = new Date();
          const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

          const filteredAttendance = attendance.filter(record => {
            const matchesSearch = record.siteID?.siteName?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
            const matchesSite = siteFilter === 'all' || record.siteID?._id === siteFilter;
            const recordDate = new Date(record.date);
            const matchesDateRange =
              dateRangeFilter === 'all' ||
              (dateRangeFilter === 'thisMonth' && recordDate >= thisMonthStart) ||
              (dateRangeFilter === 'lastMonth' && recordDate >= lastMonthStart && recordDate <= lastMonthEnd);
            return matchesSearch && matchesStatus && matchesSite && matchesDateRange;
          });

          return filteredAttendance.length === 0 ? (
            <p className="muted-small">No records match your filters</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped mb-0">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Site</th>
                    <th>Status</th>
                    <th>Overtime</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendance.map((record) => (
                    <tr key={record._id}>
                      <td>{formatDate(record.date)}</td>
                      <td>{record.siteID?.siteName || 'N/A'}</td>
                      <td><span className={`badge ${record.status === 'Present' ? 'bg-success' : 'bg-danger'}`}>{record.status}</span></td>
                      <td>{record.overtime || 0} hrs</td>
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

export default Attendance;

