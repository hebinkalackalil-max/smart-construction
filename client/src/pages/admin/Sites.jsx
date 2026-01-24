import { useState, useEffect } from 'react';
import api from '../../utils/api';
import Modal from '../../components/Modal';

const Sites = () => {
  const [sites, setSites] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [formData, setFormData] = useState({
    siteName: '',
    location: '',
    supervisorID: '',
    status: 'Ongoing'
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
      setFormData({
        siteName: site.siteName,
        location: site.location,
        supervisorID: site.supervisorID._id || site.supervisorID,
        status: site.status
      });
    } else {
      setEditingSite(null);
      setFormData({
        siteName: '',
        location: '',
        supervisorID: '',
        status: 'Ongoing'
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
        await api.post('/sites', formData);
        alert('Site created successfully');
      }
      fetchSites();
      handleCloseModal();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving site');
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

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0, color: '#2c3e50' }}>Site Management</h1>
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
          + Add Site
        </button>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Site Name</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Location</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Supervisor</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sites.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                  No sites found
                </td>
              </tr>
            ) : (
              sites.map((site) => (
                <tr key={site._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '1rem' }}>{site.siteName}</td>
                  <td style={{ padding: '1rem' }}>{site.location}</td>
                  <td style={{ padding: '1rem' }}>
                    {site.supervisorID?.name || 'N/A'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      backgroundColor: site.status === 'Ongoing' ? '#d4edda' : '#f8d7da',
                      color: site.status === 'Ongoing' ? '#155724' : '#721c24'
                    }}>
                      {site.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button
                      onClick={() => handleOpenModal(site)}
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
                      onClick={() => handleDelete(site._id)}
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
        title={editingSite ? 'Edit Site' : 'Add New Site'}
      >
        <form onSubmit={handleSubmit}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555' }}>Site Name</label>
            <input
              type="text"
              value={formData.siteName}
              onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555' }}>Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555' }}>Supervisor</label>
            <select
              value={formData.supervisorID}
              onChange={(e) => setFormData({ ...formData, supervisorID: e.target.value })}
              required
              style={inputStyle}
            >
              <option value="">Select Supervisor</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
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
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
            </select>
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
              {editingSite ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Sites;

