import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { formatDate } from '../../utils/dateFormat';

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
    return <div className="text-center py-5">Loading...</div>;
  }

  return (
    <div className="app-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 style={{ color: 'var(--primary)', margin: 0 }}>Equipment Tracking</h1>
        <select value={selectedSite} onChange={(e) => setSelectedSite(e.target.value)} className="form-select" style={{ maxWidth: '240px' }}>
          <option value="">All Sites</option>
          {sites.map((site) => (
            <option key={site._id} value={site._id}>{site.siteName}</option>
          ))}
        </select>
      </div>

      {equipment.length === 0 ? (
        <div className="card p-4 text-center">
          <p className="muted-small mb-0">No equipment found</p>
        </div>
      ) : (
        <div className="row g-3">
          {equipment.map((item) => (
            <div key={item._id} className="col-12 col-md-6 col-lg-4">
              <div className="card p-3" style={{ borderLeft: `4px solid ${getStatusColor(item.status)}` }}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h5 style={{ margin: 0, color: 'var(--primary)' }}>{item.equipmentName}</h5>
                  <span className={`badge`} style={{ backgroundColor: getStatusColor(item.status) + '20', color: getStatusColor(item.status) }}>{item.status}</span>
                </div>

                <p className="muted-small mb-1"><strong>📍 Site:</strong> {item.siteID?.siteName || 'N/A'}</p>
                {item.lastMaintenance && <p className="muted-small mb-1"><strong>🔧 Last Maintenance:</strong> {formatDate(item.lastMaintenance)}</p>}
                {item.createdAt && <p className="muted-small mb-0"><strong>Added:</strong> {formatDate(item.createdAt)}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Equipment;

