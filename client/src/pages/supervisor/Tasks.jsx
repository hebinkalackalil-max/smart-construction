import { useState, useEffect } from 'react';
import api from '../../utils/api';
import Modal from '../../components/Modal';
import { formatDate } from '../../utils/dateFormat';

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
    <div className="app-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 style={{ color: 'var(--primary)', margin: 0 }}>Task Management</h1>
      </div>

      <div className="card p-3 mb-3">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-5">
            <input type="text" className="form-control" placeholder="Search by task description" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="col-12 col-md-3">
            <select value={siteFilter} onChange={(e) => setSiteFilter(e.target.value)} className="form-select">
              <option key="all-sites" value="all">All Sites</option>
              {sites.map((site) => (
                <option key={site._id} value={site._id}>{site.siteName}</option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-2">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-select">
              <option key="all" value="all">All Statuses</option>
              <option key="Pending" value="Pending">Pending</option>
              <option key="In Progress" value="In Progress">In Progress</option>
              <option key="Completed" value="Completed">Completed</option>
            </select>
          </div>
          <div className="col-12 col-md-2 text-md-end">
            <button className="btn btn-primary" onClick={handleOpenModal}>+ Assign Task</button>
          </div>
        </div>
      </div>

      <div className="card p-2">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Task</th>
                <th>Worker</th>
                <th>Site</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 muted-small">No tasks found</td>
                </tr>
              ) : (
                filteredTasks.map((task) => (
                  <tr key={task._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{task.taskDescription}</div>
                      <div className="muted-small">Assigned: {formatDate(task.createdAt)}</div>
                    </td>
                    <td>{task.workerID?.name || 'N/A'}</td>
                    <td>{task.siteID?.siteName || 'N/A'}</td>
                    <td><span className="badge" style={{ backgroundColor: getStatusColor(task.status) + '20', color: getStatusColor(task.status) }}>{task.status}</span></td>
                    <td><button className="btn btn-sm btn-danger" onClick={() => handleDelete(task._id)}>Delete</button></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
              <option key="site-empty" value="">Select Site</option>
              {sites.filter(s => s.status === 'Ongoing').map((site) => (
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
              <option key="worker-empty" value="">Select Worker</option>
              {workers.map((worker) => (
                <option key={worker._id || worker.id} value={worker._id || worker.id}>
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

