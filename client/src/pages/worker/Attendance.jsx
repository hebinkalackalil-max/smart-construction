import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

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
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '2rem', color: '#2c3e50' }}>My Attendance</h1>

      {/* Mark Attendance Form */}
      <div style={cardStyle}>
        <h2 style={{ marginTop: 0, marginBottom: '1.5rem', color: '#2c3e50' }}>Mark My Attendance</h2>
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

      {/* Attendance History */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, color: '#2c3e50' }}>Attendance History</h2>
        </div>

        {/* Filters */}
        {attendance.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap'
          }}>
            <input
              type="text"
              placeholder="Search by site name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: '1',
                minWidth: '200px',
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                minWidth: '150px'
              }}
            >
              <option value="all">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
            {sites.length > 0 && (
              <select
                value={siteFilter}
                onChange={(e) => setSiteFilter(e.target.value)}
                style={{
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  minWidth: '150px'
                }}
              >
                <option value="all">All Sites</option>
                {sites.map(site => (
                  <option key={site._id} value={site._id}>{site.siteName}</option>
                ))}
              </select>
            )}
            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value)}
              style={{
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem',
                minWidth: '150px'
              }}
            >
              <option value="all">All time</option>
              <option value="thisMonth">This month</option>
              <option value="lastMonth">Last month</option>
            </select>
          </div>
        )}

        {attendance.length === 0 ? (
          <p style={{ color: '#666' }}>No attendance records found</p>
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
            <p style={{ color: '#666' }}>No records match your filters</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Date</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Site</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Status</th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Overtime</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendance.map((record) => (
                  <tr key={record._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '0.75rem' }}>
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {record.siteID?.siteName || 'N/A'}
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
          );
        })()}
      </div>
    </div>
  );
};

export default Attendance;

