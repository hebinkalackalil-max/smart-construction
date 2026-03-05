import { useState, useEffect } from 'react';
import api from '../../utils/api';
import Modal from '../../components/Modal';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // all, admin, supervisor, worker, accountant
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'worker'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'worker'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        const userId = editingUser._id || editingUser.id;
        if (!userId) {
          alert('Invalid user');
          return;
        }
        await api.put(`/users/${userId}`, updateData);
        alert('User updated successfully');
      } else {
        await api.post('/users', formData);
        alert('User created successfully');
      }
      fetchUsers();
      handleCloseModal();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving user');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await api.delete(`/users/${id}`);
      alert('User deleted successfully');
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting user');
    }
  };

  const getRoleBadgeClass = (role) => {
    const classes = {
      admin: 'role-admin',
      supervisor: 'role-supervisor',
      worker: 'role-worker',
      accountant: 'role-accountant'
    };
    return classes[role] || 'badge-secondary';
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      roleFilter === 'all' ? true : user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="mt-3">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="page-actions">
        <h1 className="page-title">User Management</h1>
        <div className="page-filters">
          <input
            type="text"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filter-input"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="supervisor">Supervisor</option>
            <option value="worker">Worker</option>
            <option value="accountant">Accountant</option>
          </select>
          <button onClick={() => handleOpenModal()} className="btn btn-primary">
            + Add User
          </button>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr className="empty-row">
                <td colSpan="4">No users found</td>
              </tr>
            ) : (
              filteredUsers.map((user) => {
                const userId = user._id || user.id;
                return (
                <tr key={userId || user.email}>
                  <td className="fw-semibold">{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleOpenModal(user)} className="action-btn action-btn-edit">
                      Edit
                    </button>
                    <button onClick={() => userId && handleDelete(userId)} className="action-btn action-btn-delete">
                      Delete
                    </button>
                  </td>
                </tr>
              );
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingUser ? 'Edit User' : 'Add New User'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Password {editingUser && '(leave blank to keep current)'}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!editingUser}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="form-select"
            >
              <option value="worker">Worker</option>
              <option value="supervisor">Supervisor</option>
              <option value="accountant">Accountant</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingUser ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;

