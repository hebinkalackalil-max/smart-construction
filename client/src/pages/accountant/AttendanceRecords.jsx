import { useEffect, useMemo, useState } from 'react';
import api from '../../utils/api';
import { formatDate } from '../../utils/dateFormat';

const AttendanceRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, Present, Absent
  const [siteFilter, setSiteFilter] = useState('all'); // all or siteId
  const [dateRange, setDateRange] = useState('all'); // all, thisMonth, lastMonth

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const response = await api.get('/attendance');
      setRecords(response.data.data || []);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      alert('Error fetching attendance');
    } finally {
      setLoading(false);
    }
  };

  const siteOptions = useMemo(() => {
    const map = new Map();
    (records || []).forEach((r) => {
      const sid = r.siteID?._id || r.siteID;
      if (!sid) return;
      if (!map.has(sid)) {
        map.set(sid, r.siteID?.siteName || 'Unknown Site');
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [records]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const today = new Date();
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);

    return (records || []).filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;

      const sid = r.siteID?._id || r.siteID;
      if (siteFilter !== 'all' && sid !== siteFilter) return false;

      const recordDate = new Date(r.date);
      if (
        dateRange === 'thisMonth' &&
        !(recordDate >= thisMonthStart)
      ) return false;
      if (
        dateRange === 'lastMonth' &&
        !(recordDate >= lastMonthStart && recordDate <= lastMonthEnd)
      ) return false;

      if (!term) return true;

      const workerName = (r.workerID?.name || '').toLowerCase();
      const workerEmail = (r.workerID?.email || '').toLowerCase();
      const siteName = (r.siteID?.siteName || '').toLowerCase();
      const siteLocation = (r.siteID?.location || '').toLowerCase();
      return (
        workerName.includes(term) ||
        workerEmail.includes(term) ||
        siteName.includes(term) ||
        siteLocation.includes(term)
      );
    });
  }, [records, search, statusFilter, siteFilter, dateRange]);

  if (loading) {
    return <div className="text-center py-5">Loading...</div>;
  }

  return (
    <div className="app-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="mb-0" style={{ color: 'var(--primary)' }}>Attendance Records</h1>
        <button className="btn btn-outline-primary" onClick={fetchAttendance}>Refresh</button>
      </div>

      <div className="card p-3 mb-3">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-5">
            <input
              className="form-control"
              placeholder="Search by worker or site..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-6 col-md-2">
            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </div>
          <div className="col-6 col-md-2">
            <select className="form-select" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
              <option value="all">All Dates</option>
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
            </select>
          </div>
          <div className="col-12 col-md-3">
            <select className="form-select" value={siteFilter} onChange={(e) => setSiteFilter(e.target.value)}>
              <option value="all">All Sites</option>
              {siteOptions.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card p-3">
        {filtered.length === 0 ? (
          <p className="muted-small mb-0">No attendance records found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped align-middle">
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
                {filtered.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <div className="fw-semibold">{r.workerID?.name || 'N/A'}</div>
                      <div className="small text-muted">{r.workerID?.email || ''}</div>
                    </td>
                    <td>
                      <div className="fw-semibold">{r.siteID?.siteName || 'N/A'}</div>
                      <div className="small text-muted">{r.siteID?.location || ''}</div>
                    </td>
                    <td>{r.date ? formatDate(r.date) : '-'}</td>
                    <td>
                      <span className={`badge ${r.status === 'Present' ? 'bg-success' : 'bg-danger'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>{r.overtime || 0} hrs</td>
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

export default AttendanceRecords;

