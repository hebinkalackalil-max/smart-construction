import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { formatDate } from '../../utils/dateFormat';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [siteFilter, setSiteFilter] = useState('all');

  useEffect(() => {
    fetchTasks();
  }, []);

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

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      alert('Task status updated successfully');
      fetchTasks();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating task status');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>;
  }

  const getStatusColor = (status) => {
    const colors = {
      Pending: '#f39c12',
      'In Progress': '#3498db',
      Completed: '#27ae60'
    };
    return colors[status] || '#95a5a6';
  };

  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      'Pending': 'In Progress',
      'In Progress': 'Completed'
    };
    return statusFlow[currentStatus];
  };

  // Get unique sites for filter
  const uniqueSites = [...new Set(tasks.map(t => t.siteID?._id || t.siteID).filter(Boolean))];
  const siteOptions = uniqueSites.map(siteId => {
    const task = tasks.find(t => (t.siteID?._id || t.siteID) === siteId);
    return { id: siteId, name: task?.siteID?.siteName || 'Unknown' };
  });

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.taskDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.siteID?.siteName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesSite = siteFilter === 'all' || (task.siteID?._id || task.siteID) === siteFilter;
    return matchesSearch && matchesStatus && matchesSite;
  });

  return (
    <div className="app-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 style={{ color: 'var(--primary)', margin: 0 }}>My Tasks</h1>
      </div>

      <div className="card p-3 mb-3">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-6">
            <input type="text" className="form-control" placeholder="Search tasks or site..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div className="col-12 col-md-3">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-select">
              <option key="all" value="all">All Statuses</option>
              <option key="Pending" value="Pending">Pending</option>
              <option key="In Progress" value="In Progress">In Progress</option>
              <option key="Completed" value="Completed">Completed</option>
            </select>
          </div>
          <div className="col-12 col-md-3">
            {siteOptions.length > 0 && (
              <select value={siteFilter} onChange={(e) => setSiteFilter(e.target.value)} className="form-select">
                <option key="all" value="all">All Sites</option>
                {siteOptions.map(site => (
                  <option key={String(site.id)} value={site.id}>{site.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="card p-4 text-center">
          <p className="muted-small mb-0">{tasks.length === 0 ? 'No tasks assigned to you' : 'No tasks match your filters'}</p>
        </div>
      ) : (
        <div className="row g-3">
          {filteredTasks.map((task) => (
            <div key={task._id} className="col-12 col-md-6">
              <div className="card p-3" style={{ borderLeft: `4px solid ${getStatusColor(task.status)}` }}>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h6 style={{ margin: 0, color: 'var(--primary)', flex: 1 }}>{task.taskDescription}</h6>
                  <span className="badge" style={{ backgroundColor: getStatusColor(task.status) + '20', color: getStatusColor(task.status) }}>{task.status}</span>
                </div>

                <p className="muted-small mb-1"><strong>📍 Site:</strong> {task.siteID?.siteName || 'N/A'}</p>
                <p className="muted-small mb-1"><strong>Assigned:</strong> {formatDate(task.createdAt)}</p>
                {task.assignedBy && <p className="muted-small mb-2"><strong>By:</strong> {task.assignedBy?.name || 'N/A'}</p>}

                {task.status !== 'Completed' ? (
                  <button className="btn btn-primary w-100" onClick={() => {
                    const nextStatus = getNextStatus(task.status);
                    if (nextStatus && window.confirm(`Update task status to "${nextStatus}"?`)) {
                      handleStatusUpdate(task._id, nextStatus);
                    }
                  }}>
                    {task.status === 'Pending' ? 'Start Task' : 'Mark as Completed'}
                  </button>
                ) : (
                  <div className="alert alert-success text-center mb-0 py-2">✓ Task Completed</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tasks;

