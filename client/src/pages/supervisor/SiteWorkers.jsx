import { useState, useEffect } from 'react';
import api from '../../utils/api';

const SiteWorkers = () => {
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState('');
  const [siteWorkers, setSiteWorkers] = useState([]);
  const [allWorkers, setAllWorkers] = useState([]);
  const [addWorkerId, setAddWorkerId] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingWorkers, setLoadingWorkers] = useState(false);

  useEffect(() => {
    fetchSites();
    fetchAllWorkers();
  }, []);

  useEffect(() => {
    if (selectedSite) {
      fetchSiteWorkers();
    } else {
      setSiteWorkers([]);
    }
  }, [selectedSite]);

  const fetchSites = async () => {
    try {
      const response = await api.get('/sites');
      setSites(response.data.data || []);
      if (response.data.data?.length && !selectedSite) {
        setSelectedSite(response.data.data[0]._id);
      }
    } catch (error) {
      console.error('Error fetching sites:', error);
      alert('Error fetching sites');
    }
  };

  const fetchAllWorkers = async () => {
    try {
      const response = await api.get('/users');
      const workers = (response.data.data || []).filter(u => u.role === 'worker');
      setAllWorkers(workers);
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  };

  const fetchSiteWorkers = async () => {
    if (!selectedSite) return;
    setLoadingWorkers(true);
    try {
      const response = await api.get(`/sites/${selectedSite}/workers`);
      setSiteWorkers(response.data.data || []);
    } catch (error) {
      console.error('Error fetching site workers:', error);
      setSiteWorkers([]);
    } finally {
      setLoadingWorkers(false);
    }
  };

  const handleAddWorker = async (e) => {
    e.preventDefault();
    if (!addWorkerId || !selectedSite) return;
    setLoading(true);
    try {
      await api.post(`/sites/${selectedSite}/workers`, { workerID: addWorkerId });
      setAddWorkerId('');
      fetchSiteWorkers();
      fetchSites(); // refresh sites so workerIDs are updated
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add worker');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveWorker = async (workerId) => {
    if (!selectedSite || !window.confirm('Remove this worker from the site?')) return;
    setLoading(true);
    try {
      await api.delete(`/sites/${selectedSite}/workers/${workerId}`);
      fetchSiteWorkers();
      fetchSites();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to remove worker');
    } finally {
      setLoading(false);
    }
  };

  const assignedIds = siteWorkers.map(w => w._id || w.id);
  const availableWorkers = allWorkers.filter(w => !assignedIds.includes(w._id || w.id));

  const cardStyle = {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginBottom: '1.5rem'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    boxSizing: 'border-box',
    marginBottom: '0.5rem'
  };

  return (
    <div>
      <h1 style={{ marginBottom: '2rem', color: '#2c3e50' }}>Site Workers</h1>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        Add or remove workers assigned to your sites. Only workers assigned to a site can be marked for attendance at that site.
      </p>

      <div style={cardStyle}>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555', fontWeight: '500' }}>Select Site</label>
        <select
          value={selectedSite}
          onChange={(e) => setSelectedSite(e.target.value)}
          style={{ ...inputStyle, maxWidth: '400px', marginBottom: '1.5rem' }}
        >
          <option value="">Select a site</option>
          {sites.map((site) => (
            <option key={site._id} value={site._id}>
              {site.siteName} – {site.location}
            </option>
          ))}
        </select>

        {!selectedSite ? (
          <p style={{ color: '#666' }}>Select a site to manage its workers.</p>
        ) : (
          <>
            <h2 style={{ marginTop: 0, marginBottom: '1rem', color: '#2c3e50', fontSize: '1.1rem' }}>Workers on this site</h2>
            {loadingWorkers ? (
              <p style={{ color: '#666' }}>Loading...</p>
            ) : siteWorkers.length === 0 ? (
              <p style={{ color: '#666', marginBottom: '1.5rem' }}>No workers assigned yet. Add workers below.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem 0' }}>
                {siteWorkers.map((worker) => (
                  <li
                    key={worker._id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.5rem 0',
                      borderBottom: '1px solid #eee'
                    }}
                  >
                    <span>{worker.name} ({worker.email})</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveWorker(worker._id)}
                      disabled={loading}
                      style={{
                        padding: '0.35rem 0.75rem',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <h2 style={{ marginTop: 0, marginBottom: '0.75rem', color: '#2c3e50', fontSize: '1.1rem' }}>Add worker to this site</h2>
            <form onSubmit={handleAddWorker} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <select
                value={addWorkerId}
                onChange={(e) => setAddWorkerId(e.target.value)}
                style={{ ...inputStyle, width: 'auto', minWidth: '220px', marginBottom: 0 }}
              >
                <option value="">Select worker to add</option>
                {availableWorkers.map((worker) => (
                  <option key={worker._id} value={worker._id}>
                    {worker.name} ({worker.email})
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={loading || !addWorkerId}
                style={{
                  padding: '0.75rem 1.25rem',
                  backgroundColor: addWorkerId && !loading ? '#27ae60' : '#95a5a6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: addWorkerId && !loading ? 'pointer' : 'not-allowed',
                  fontWeight: '500'
                }}
              >
                {loading ? 'Adding...' : 'Add to site'}
              </button>
            </form>
            {availableWorkers.length === 0 && allWorkers.length > 0 && (
              <p style={{ color: '#666', marginTop: '0.5rem', fontSize: '0.9rem' }}>All workers are already assigned to this site.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SiteWorkers;
