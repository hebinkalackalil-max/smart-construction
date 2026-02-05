import { useState, useEffect } from 'react';
import api from '../../utils/api';
import Modal from '../../components/Modal';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [sites, setSites] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // all, Pending, In Progress, Completed
  const [siteFilter, setSiteFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    workerID: '',
    siteID: '',
    taskDescription: ''
  });

  useEffect(() => {
    fetchTasks();
    fetchSites();
  }, []);

  useEffect(() => {
    if (formData.siteID) {
      fetchWorkersForSite();
    }
  }, [formData.siteID]);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');
      setTasks(response.data.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
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

  const fetchWorkersForSite = async () => {
    try {
      const response = await api.get('/users');
      const allWorkers = response.data.data.filter(u => u.role === 'worker');
      setWorkers(allWorkers);
    } catch (error) {
      console.error('Error fetching workers:', error);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      workerID: '',
      siteID: '',
      taskDescription: ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', formData);
      alert('Task assigned successfully');
      fetchTasks();
      handleCloseModal();
    } catch (error) {
      alert(error.response?.data?.message || 'Error assigning task');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await api.delete(`/tasks/${id}`);
      alert('Task deleted successfully');
      fetchTasks();
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting task');
    }
  };

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
      Pending: '#f39c12',
      'In Progress': '#3498db',
      Completed: '#27ae60'
    };
    return colors[status] || '#95a5a6';
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
      statusFilter === 'all' ? true : task.status === statusFilter;

    const matchesSite =
      siteFilter === 'all' ? true : task.siteID?._id === siteFilter || task.siteID === siteFilter;

    const matchesSearch =
      task.taskDescription.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSite && matchesSearch;
  });

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, color: '#2c3e50' }}>Task Management</h1>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search by task description"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '0.9rem',
              minWidth: '220px'
            }}
          />
          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '0.9rem'
            }}
          >
            <option value="all">All Sites</option>
            {sites.map((site) => (
              <option key={site._id} value={site._id}>
                {site.siteName}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '0.9rem'
            }}
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <button
            onClick={handleOpenModal}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
              whiteSpace: 'nowrap'
            }}
          >
            + Assign Task
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa' }}>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Task</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Worker</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Site</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                  No tasks found
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => (
                <tr key={task._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '1rem', maxWidth: '300px' }}>
                    <div style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{task.taskDescription}</div>
                    <div style={{ fontSize: '0.85rem', color: '#666' }}>
                      Assigned: {new Date(task.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {task.workerID?.name || 'N/A'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {task.siteID?.siteName || 'N/A'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '0.85rem',
                      backgroundColor: getStatusColor(task.status) + '20',
                      color: getStatusColor(task.status)
                    }}>
                      {task.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button
                      onClick={() => handleDelete(task._id)}
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
        title="Assign New Task"
      >
        <form onSubmit={handleSubmit}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555' }}>Select Site *</label>
            <select
              value={formData.siteID}
              onChange={(e) => setFormData({ ...formData, siteID: e.target.value, workerID: '' })}
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
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555' }}>Select Worker *</label>
            <select
              value={formData.workerID}
              onChange={(e) => setFormData({ ...formData, workerID: e.target.value })}
              required
              disabled={!formData.siteID}
              style={inputStyle}
            >
              <option value="">Select Worker</option>
              {workers.map((worker) => (
                <option key={worker.id} value={worker.id}>
                  {worker.name} ({worker.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#555' }}>Task Description *</label>
            <textarea
              value={formData.taskDescription}
              onChange={(e) => setFormData({ ...formData, taskDescription: e.target.value })}
              required
              rows="4"
              style={inputStyle}
              placeholder="Describe the task..."
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
              Assign Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;

