import { useState, useEffect } from 'react';
import api from '../../utils/api';
import Modal from '../../components/Modal';
import { formatDate } from '../../utils/dateFormat';

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

  const getStatusBadgeClass = (status) => {
    const classes = {
      Available: 'status-available',
      'In Use': 'status-ongoing',
      Maintenance: 'status-maintenance'
    };
    return classes[status] || 'badge-secondary';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="mt-3">Loading equipment...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="page-actions">
        <h1 className="page-title">Equipment Management</h1>
        <button onClick={() => handleOpenModal()} className="btn btn-primary">
          + Add Equipment
        </button>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Equipment Name</th>
              <th>Site</th>
              <th>Status</th>
              <th>Last Maintenance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {equipment.length === 0 ? (
              <tr className="empty-row">
                <td colSpan="5">No equipment found</td>
              </tr>
            ) : (
              equipment.map((item) => (
                <tr key={item._id}>
                  <td className="fw-semibold">{item.equipmentName}</td>
                  <td>{item.siteID?.siteName || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    {item.lastMaintenance ? formatDate(item.lastMaintenance) : 'N/A'}
                  </td>
                  <td>
                    <button onClick={() => handleOpenModal(item)} className="action-btn action-btn-edit">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(item._id)} className="action-btn action-btn-delete">
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
          <div className="form-group">
            <label className="form-label">Equipment Name</label>
            <input
              type="text"
              value={formData.equipmentName}
              onChange={(e) => setFormData({ ...formData, equipmentName: e.target.value })}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Site</label>
            <select
              value={formData.siteID}
              onChange={(e) => setFormData({ ...formData, siteID: e.target.value })}
              required
              className="form-select"
            >
              <option value="">Select Site</option>
              {sites.map((site) => (
                <option key={site._id} value={site._id}>
                  {site.siteName} - {site.location}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="form-select"
            >
              <option value="Available">Available</option>
              <option value="In Use">In Use</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Last Maintenance (Optional)</label>
            <input
              type="date"
              value={formData.lastMaintenance}
              onChange={(e) => setFormData({ ...formData, lastMaintenance: e.target.value })}
              className="form-control"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingEquipment ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Equipment;

