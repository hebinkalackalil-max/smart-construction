import { useState, useEffect } from 'react';
import api from '../../utils/api';

const Equipment = () => {
  const [equipment, setEquipment] = useState([]);
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSites();
  }, []);

  useEffect(() => {
    if (selectedSite) {
      fetchEquipment();
    } else {
      fetchAllEquipment();
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

  const fetchEquipment = async () => {
    try {
      const url = selectedSite ? `/equipment?siteID=${selectedSite}` : '/equipment';
      const response = await api.get(url);
      setEquipment(response.data.data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      alert('Error fetching equipment');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllEquipment = async () => {
    try {
      const response = await api.get('/equipment');
      setEquipment(response.data.data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Available: '#27ae60',
      'In Use': '#3498db',
      Maintenance: '#e67e22'
    };
    return colors[status] || '#95a5a6';
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, color: '#2c3e50' }}>Equipment Tracking</h1>
        <select
          value={selectedSite}
          onChange={(e) => setSelectedSite(e.target.value)}
          style={{
            padding: '0.75rem 1rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '1rem',
            minWidth: '200px'
          }}
        >
          <option value="">All Sites</option>
          {sites.map((site) => (
            <option key={site._id} value={site._id}>
              {site.siteName}
            </option>
          ))}
        </select>
      </div>

      {equipment.length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          padding: '3rem',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>No equipment found</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {equipment.map((item) => (
            <div
              key={item._id}
              style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                borderLeft: `4px solid ${getStatusColor(item.status)}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, color: '#2c3e50' }}>{item.equipmentName}</h3>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.85rem',
                  backgroundColor: getStatusColor(item.status) + '20',
                  color: getStatusColor(item.status)
                }}>
                  {item.status}
                </span>
              </div>
              
              <div>
                <p style={{ margin: '0.5rem 0', color: '#666' }}>
                  <strong>📍 Site:</strong> {item.siteID?.siteName || 'N/A'}
                </p>
                {item.lastMaintenance && (
                  <p style={{ margin: '0.5rem 0', color: '#666', fontSize: '0.9rem' }}>
                    <strong>🔧 Last Maintenance:</strong> {new Date(item.lastMaintenance).toLocaleDateString()}
                  </p>
                )}
                {item.createdAt && (
                  <p style={{ margin: '0.5rem 0', color: '#666', fontSize: '0.9rem' }}>
                    <strong>Added:</strong> {new Date(item.createdAt).toLocaleDateString()}
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

export default Equipment;

