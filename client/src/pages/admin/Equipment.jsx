import { useState, useEffect } from 'react';
import api from '../../utils/api';
import Modal from '../../components/Modal';

const Equipment = () => {
  const [equipment, setEquipment] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [formData, setFormData] = useState({
    equipmentName: '',
    siteID: '',
    status: 'Available',
    lastMaintenance: ''
  });

  useEffect(() => {
    fetchEquipment();
    fetchSites();
  }, []);

  const fetchEquipment = async () => {
    try {
      const response = await api.get('/equipment');
      setEquipment(response.data.data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      alert('Error fetching equipment');
    } finally {
      setLoading(false);
    }
  };

  const fetchSites = async () => {
    try {
      const response = await api.get('/sites');
      setSites(response.data.data);
    } catch (error) {
      console.error('Error fetching sites:', error);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingEquipment(item);
      setFormData({
        equipmentName: item.equipmentName,
        siteID: item.siteID._id || item.siteID,
        status: item.status,
        lastMaintenance: item.lastMaintenance ? new Date(item.lastMaintenance).toISOString().split('T')[0] : ''
      });
    } else {
      setEditingEquipment(null);
      setFormData({
        equipmentName: '',
        siteID: '',
        status: 'Available',
        lastMaintenance: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEquipment(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEquipment) {
        await api.put(`/equipment/${editingEquipment._id}`, formData);
        alert('Equipment updated successfully');
      } else {
        await api.post('/equipment', formData);
        alert('Equipment added successfully');
      }
      fetchEquipment();
      handleCloseModal();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving equipment');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this equipment?')) return;

    try {
      await api.delete(`/equipment/${id}`);
      alert('Equipment deleted successfully');
      fetchEquipment();
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting equipment');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  }

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    boxSizing: 'border-box',
    marginBottom: '1rem'
  };

  const getStatusColor = (status) => {
    const colors = {
      Available: '#27ae60',
      'In Use': '#3498db',
      Maintenance: '#e67e22'
    };
    return colors[status] || '#95a5a6';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, color: '#2c3e50' }}>Equipment Management</h1>
        <button
          onClick={() => handleOpenModal()}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          + Add Equipment
        </button>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Equipment Name</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Site</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Last Maintenance</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {equipment.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                  No equipment found
                </td>
              </tr>
            ) : (
              equipment.map((item) => (
                <tr key={item._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '1rem' }}>{item.equipmentName}</td>
                  <td style={{ padding: '1rem' }}>
                    {item.siteID?.siteName || 'N/A'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      backgroundColor: getStatusColor(item.status) + '20',
                      color: getStatusColor(item.status)
                    }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {item.lastMaintenance ? new Date(item.lastMaintenance).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button
                      onClick={() => handleOpenModal(item)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#f39c12',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        marginRight: '0.5rem'
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingEquipment ? 'Edit Equipment' : 'Add New Equipment'}
      >
        <form onSubmit={handleSubmit}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555' }}>Equipment Name</label>
            <input
              type="text"
              value={formData.equipmentName}
              onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555' }}>Site</label>
            <select
              value={formData.siteID}
              onChange={(e) => setFormData({ ...formData, siteID: e.target.value })}
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
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555' }}>Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              style={inputStyle}
            >
              <option value="Available">Available</option>
              <option value="In Use">In Use</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555' }}>Last Maintenance (Optional)</label>
            <input
              type="date"
              value={formData.lastMaintenance}
              onChange={(e) => setFormData({ ...formData, lastMaintenance: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleCloseModal}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {editingEquipment ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Equipment;

