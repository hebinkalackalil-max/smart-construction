import { useState, useEffect } from 'react';
import api from '../../utils/api';

const Sites = () => {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '2rem', color: '#2c3e50' }}>My Assigned Sites</h1>

      {sites.length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          padding: '3rem',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>No sites assigned to you</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {sites.map((site) => (
            <div
              key={site._id}
              style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                borderLeft: '4px solid #3498db'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0, color: '#2c3e50' }}>{site.siteName}</h2>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  backgroundColor: site.status === 'Ongoing' ? '#d4edda' : '#f8d7da',
                  color: site.status === 'Ongoing' ? '#155724' : '#721c24'
                }}>
                  {site.status}
                </span>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ margin: '0.5rem 0', color: '#666' }}>
                  <strong>📍 Location:</strong> {site.location}
                </p>
                <p style={{ margin: '0.5rem 0', color: '#666' }}>
                  <strong>👤 Supervisor:</strong> {site.supervisorID?.name || 'N/A'}
                </p>
                {site.createdAt && (
                  <p style={{ margin: '0.5rem 0', color: '#666', fontSize: '0.9rem' }}>
                    <strong>Created:</strong> {new Date(site.createdAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sites;

