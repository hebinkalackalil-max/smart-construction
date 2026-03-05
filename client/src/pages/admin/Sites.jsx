import { useState, useEffect } from 'react';
import api from '../../utils/api';
import Modal from '../../components/Modal';

const Sites = () => {
  const [sites, setSites] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, Ongoing, Temporarily Paused, Completed
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [formData, setFormData] = useState({
    siteName: '',
    location: '',
    supervisorID: '',
    status: 'Ongoing',
    isActive: true
  });

  useEffect(() => {
    fetchSites();
    fetchSupervisors();
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

  const fetchSupervisors = async () => {
    try {
      const response = await api.get('/users');
      const supervisors = response.data.data.filter(u => u.role === 'supervisor');
      setUsers(supervisors);
    } catch (error) {
      console.error('Error fetching supervisors:', error);
    }
  };

  const handleOpenModal = (site = null) => {
    if (site) {
      setEditingSite(site);
      const isActive = site.isActive !== false;
      setFormData({
        siteName: site.siteName,
        location: site.location,
        supervisorID: site.supervisorID._id || site.supervisorID,
        status: isActive ? site.status : 'Temporarily Paused',
        isActive
      });
    } else {
      setEditingSite(null);
      setFormData({
        siteName: '',
        location: '',
        supervisorID: '',
        status: 'Ongoing',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSite(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSite) {
        await api.put(`/sites/${editingSite._id}`, formData);
        alert('Site updated successfully');
      } else {
        const { isActive, ...createData } = formData;
        await api.post('/sites', createData);
        alert('Site created successfully');
      }
      fetchSites();
      handleCloseModal();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving site');
    }
  };

  const handleToggleActive = async (site) => {
    const newActive = !(site.isActive !== false);
    if (!window.confirm(newActive ? 'Activate this site?' : 'Deactivate this site? It will be set to Temporarily Paused and hidden from others.')) return;
    try {
      await api.put(`/sites/${site._id}`, { isActive: newActive });
      alert(newActive ? 'Site activated. You can now change its status.' : 'Site deactivated and set to Temporarily Paused.');
      fetchSites();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating site');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this site?')) return;

    try {
      await api.delete(`/sites/${id}`);
      alert('Site deleted successfully');
      fetchSites();
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting site');
    }
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
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="mt-3">Loading sites...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="page-actions">
        <h1 className="page-title">Site Management</h1>
        <div className="page-filters">
          <input
            type="text"
            placeholder="Search by name or location"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filter-input"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Temporarily Paused">Temporarily Paused</option>
            <option value="Completed">Completed</option>
          </select>
          <button onClick={() => handleOpenModal()} className="btn btn-primary">
            + Add Site
          </button>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Site Name</th>
              <th>Location</th>
              <th>Supervisor</th>
              <th>Status</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSites.length === 0 ? (
              <tr className="empty-row">
                <td colSpan="6">No sites found</td>
              </tr>
            ) : (
              filteredSites.map((site) => (
                <tr key={site._id}>
                  <td className="fw-semibold">{site.siteName}</td>
                  <td>{site.location}</td>
                  <td>{site.supervisorID?.name || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${
                      site.status === 'Ongoing' ? 'status-ongoing' :
                      site.status === 'Temporarily Paused' ? 'bg-warning text-dark' : 'status-completed'
                    }`}>
                      {site.status}
                    </span>
                  </td>
                  <td>
                    {site.isActive !== false ? (
                      <span className="badge bg-success">Active</span>
                    ) : (
                      <span className="badge bg-secondary">Deactivated</span>
                    )}
                  </td>
                  <td>
                    <button onClick={() => handleOpenModal(site)} className="action-btn action-btn-edit">
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleActive(site)}
                      className={`action-btn ${site.isActive !== false ? 'action-btn-delete' : 'btn btn-success btn-sm'}`}
                      title={site.isActive !== false ? 'Deactivate site' : 'Activate site'}
                    >
                      {site.isActive !== false ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => handleDelete(site._id)} className="action-btn action-btn-delete">
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
        title={editingSite ? 'Edit Site' : 'Add New Site'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Site Name</label>
            <input
              type="text"
              className="form-control"
              value={formData.siteName}
              onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Location</label>
            <input
              type="text"
              className="form-control"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Supervisor</label>
            <select
              className="form-select"
              value={formData.supervisorID}
              onChange={(e) => setFormData({ ...formData, supervisorID: e.target.value })}
              required
            >
              <option value="">Select Supervisor</option>
              {users.map((user) => {
                const uid = user._id || user.id;
                return (
                  <option key={uid} value={uid}>
                    {user.name} ({user.email})
                  </option>
                );
              })}
            </select>
          </div>

          {editingSite && (
            <div className="form-group form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="siteIsActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <label className="form-check-label" htmlFor="siteIsActive">Site is active</label>
              <small className="d-block text-muted mt-1">Deactivated sites are set to Temporarily Paused. Activate the site to change status.</small>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              disabled={editingSite && !formData.isActive}
              title={editingSite && !formData.isActive ? 'Activate the site to change status' : ''}
            >
              <option value="Ongoing">Ongoing</option>
              <option value="Temporarily Paused">Temporarily Paused</option>
              <option value="Completed">Completed</option>
            </select>
            {editingSite && !formData.isActive && (
              <small className="text-muted">Activate the site above to change status.</small>
            )}
          </div>

          <div className="modal-footer" style={{ padding: 0, border: 'none', marginTop: '1.5rem' }}>
            <button type="button" onClick={handleCloseModal} className="btn btn-outline-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingSite ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Sites;

