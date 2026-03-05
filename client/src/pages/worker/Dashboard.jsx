import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { formatDate } from '../../utils/dateFormat';

const WorkerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [attendanceResponse, tasksResponse, paymentsResponse] = await Promise.all([
        api.get(`/attendance/worker/${user.id}`),
        api.get('/tasks'),
        api.get(`/payments/worker/${user.id}`)
      ]);

      const attendance = attendanceResponse.data.data || [];
      const tasks = tasksResponse.data.data || [];
      const payments = paymentsResponse.data.data || [];

      // Calculate stats
      const presentCount = attendance.filter(a => a.status === 'Present').length;
      const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
      const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
      const completedTasks = tasks.filter(t => t.status === 'Completed').length;
      
      const totalEarnings = payments
        .filter(p => p.paymentStatus === 'Paid')
        .reduce((sum, p) => sum + p.salaryAmount, 0);
      
      const pendingPayments = payments.filter(p => p.paymentStatus === 'Pending').length;

      setStats({
        attendance: {
          total: attendance.length,
          present: presentCount,
          absent: attendance.length - presentCount
        },
        tasks: {
          total: tasks.length,
          pending: pendingTasks,
          inProgress: inProgressTasks,
          completed: completedTasks
        },
        payments: {
          totalEarnings,
          pendingPayments
        }
      });

      setRecentTasks(tasks.slice(0, 3));
      setRecentAttendance(attendance.slice(0, 5));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="mt-3">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome, {user?.name}!</h1>
          <p className="text-muted mb-0">View your tasks, attendance, and payments</p>
        </div>
      </div>

      {stats && (
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4">
            <div className="stat-card">
              <div className="stat-label">Attendance</div>
              <div className="stat-value text-success">{stats.attendance?.present || 0}</div>
              <div className="stat-subtext">{stats.attendance?.total || 0} Total Records</div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="stat-card">
              <div className="stat-label">My Tasks</div>
              <div className="stat-value text-primary">{stats.tasks?.total || 0}</div>
              <div className="stat-subtext">{stats.tasks?.pending || 0} Pending · {stats.tasks?.completed || 0} Completed</div>
            </div>
          </div>

          <div className="col-12 col-md-4">
            <div className="stat-card">
              <div className="stat-label">Total Earnings</div>
              <div className="stat-value text-success">₹{stats.payments?.totalEarnings?.toLocaleString() || 0}</div>
              <div className="stat-subtext">{stats.payments?.pendingPayments || 0} Pending Payments</div>
            </div>
          </div>
        </div>
      )}

      <div className="card p-3 mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 style={{ margin: 0, color: 'var(--primary)' }}>Recent Tasks</h5>
          <Link to="/worker/tasks" className="text-decoration-none" style={{ color: 'var(--primary)' }}>View All →</Link>
        </div>

        {recentTasks.length === 0 ? (
          <p className="muted-small">No tasks assigned</p>
        ) : (
          <div className="list-group">
            {recentTasks.map((task) => (
              <div key={task._id} className="list-group-item d-flex justify-content-between align-items-start">
                <div>
                  <div style={{ fontWeight: 600 }}>{task.taskDescription}</div>
                  <div className="muted-small">📍 {task.siteID?.siteName || 'N/A'}</div>
                </div>
                <span className={`badge`} style={{ backgroundColor: task.status === 'Completed' ? '#d4edda' : task.status === 'In Progress' ? '#cce5ff' : '#fff3cd', color: task.status === 'Completed' ? '#155724' : task.status === 'In Progress' ? '#004085' : '#856404' }}>{task.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card p-3 mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 style={{ margin: 0, color: 'var(--primary)' }}>Recent Attendance</h5>
          <Link to="/worker/attendance" className="text-decoration-none" style={{ color: 'var(--primary)' }}>View All →</Link>
        </div>

        {recentAttendance.length === 0 ? (
          <p className="muted-small">No attendance records</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped mb-0">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Site</th>
                  <th>Status</th>
                  <th>Overtime</th>
                </tr>
              </thead>
              <tbody>
                {recentAttendance.map((record) => (
                  <tr key={record._id}>
                    <td>{formatDate(record.date)}</td>
                    <td>{record.siteID?.siteName || 'N/A'}</td>
                    <td><span className={`badge ${record.status === 'Present' ? 'bg-success' : 'bg-danger'}`}>{record.status}</span></td>
                    <td>{record.overtime || 0} hrs</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-body">
          <h5 className="card-title text-primary">⚡ Quick Actions</h5>
          <div className="quick-actions">
            <Link to="/worker/attendance" className="btn btn-primary">Mark Attendance</Link>
            <Link to="/worker/tasks" className="btn btn-outline-primary">View Tasks</Link>
            <Link to="/worker/payments" className="btn btn-warning">View Payments</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;

