import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { formatDate } from '../../utils/dateFormat';

const Sites = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, Ongoing, Temporarily Paused, Completed
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      const response = await api.get('/sites');
      setSites(response.data.data);
    } catch (error) {
      console.error('Error fetching sites:', error);
      alert('Error fetching sites');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (siteId, newStatus) => {
    setUpdatingId(siteId);
    try {
      await api.put(`/sites/${siteId}`, { status: newStatus });
      fetchSites();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating status');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'Ongoing') return 'bg-success';
    if (status === 'Temporarily Paused') return 'bg-warning text-dark';
    return 'bg-secondary';
  };

  const filteredSites = sites.filter((site) => {
    const matchesSearch =
      site.siteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      site.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ? true : site.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="text-center py-5">Loading...</div>;
  }

  return (
    <div className="app-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 style={{ color: 'var(--primary)', margin: 0 }}>My Assigned Sites</h1>
        <div className="d-flex align-items-center gap-2">
          <input
            type="text"
            placeholder="Search by name or location"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
            style={{ maxWidth: '320px' }}
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-select" style={{ maxWidth: '180px' }}>
            <option value="all">All Statuses</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Temporarily Paused">Temporarily Paused</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {filteredSites.length === 0 ? (
        <div className="card p-4 text-center">
          <p className="muted-small mb-0">No sites assigned to you</p>
        </div>
      ) : (
        <div className="row g-3">
          {filteredSites.map((site) => (
            <div key={site._id} className="col-12 col-md-6 col-lg-4">
              <div className="card p-3" style={{ borderLeft: '4px solid var(--primary)' }}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 style={{ margin: 0, color: 'var(--primary)' }}>{site.siteName}</h5>
                  <span className={`badge ${getStatusBadgeClass(site.status)}`}>
                    {site.status}
                  </span>
                </div>

                <p className="muted-small mb-1"><strong>📍 Location:</strong> {site.location}</p>
                <p className="muted-small mb-1"><strong>👤 Supervisor:</strong> {site.supervisorID?.name || 'N/A'}</p>

                <div className="mt-2">
                  <label className="form-label small mb-1">Update status</label>
                  <select
                    className="form-select form-select-sm"
                    value={site.status}
                    onChange={(e) => handleStatusChange(site._id, e.target.value)}
                    disabled={updatingId === site._id}
                  >
                    <option value="Ongoing">Ongoing</option>
                    <option value="Temporarily Paused">Temporarily Paused</option>
                    <option value="Completed">Completed</option>
                  </select>
                  {updatingId === site._id && <span className="small text-muted ms-1">Updating...</span>}
                </div>

                {site.createdAt && <p className="muted-small mb-0 mt-2"><strong>Created:</strong> {formatDate(site.createdAt)}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sites;

