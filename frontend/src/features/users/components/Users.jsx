import { useState, useEffect } from 'react';
import { useAuth } from '@context/AuthContext.jsx';
import { usersAPI } from '@api/users.js';
import { storesAPI } from '@api/stores.js';
import { ROLES } from '@utils/roles.js';
import Button from '@components/common/Button.jsx';
import Input from '@components/common/Input.jsx';
import Loading from '@components/common/Loading.jsx';

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CASHIER',
    store: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [usersData, storesData] = await Promise.all([
        usersAPI.getUsers(null, showInactive),
        storesAPI.getStores()
      ]);
      setUsers(usersData);
      setStores(storesData);
    } catch (error) {
      console.error('Error loading data:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to load data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [showInactive]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.name || !formData.email || !formData.role) {
      setError('Name, email, and role are required');
      return;
    }

    // Password required for new users
    if (!editingUser && !formData.password) {
      setError('Password is required for new users');
      return;
    }

    try {
      if (editingUser) {
        const updateData = { ...formData };
        // Only include password if it's being changed
        if (!updateData.password) {
          delete updateData.password;
        }
        // Remove empty store field
        if (!updateData.store) {
          delete updateData.store;
        }
        await usersAPI.updateUser(editingUser._id, updateData);
        setSuccess('User updated successfully!');
      } else {
        const createData = { ...formData };
        // Remove empty store field (backend will handle null/undefined)
        if (!createData.store) {
          delete createData.store;
        }
        console.log('Creating user with data:', createData);
        await usersAPI.createUser(createData);
        setSuccess('User created successfully!');
      }
      resetForm();
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving user:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to save user';
      setError(errorMessage);
    }
  };

  const handleEdit = (userData) => {
    setEditingUser(userData);
    setFormData({
      name: userData.name,
      email: userData.email,
      password: '', // Don't pre-fill password
      role: userData.role,
      store: userData.store?._id || userData.store || ''
    });
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this user? They will not be able to login.')) {
      return;
    }
    try {
      await usersAPI.deleteUser(id);
      setSuccess('User deactivated successfully!');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to deactivate user');
    }
  };

  const handleActivate = async (id) => {
    if (!window.confirm('Are you sure you want to activate this user? They will be able to login again.')) {
      return;
    }
    try {
      await usersAPI.activateUser(id);
      setSuccess('User activated successfully!');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to activate user');
    }
  };

  const handlePermanentDelete = async (id, userName) => {
    if (!window.confirm(`⚠️ WARNING: This will permanently delete user "${userName}". This action cannot be undone!\n\nAre you absolutely sure?`)) {
      return;
    }
    // Double confirmation for permanent delete
    if (!window.confirm(`Final confirmation: Permanently delete "${userName}"? This cannot be reversed!`)) {
      return;
    }
    try {
      await usersAPI.permanentDeleteUser(id);
      setSuccess('User permanently deleted!');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to permanently delete user');
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'CASHIER',
      store: ''
    });
    setError('');
    setSuccess('');
  };

  const handleAddUser = () => {
    resetForm();
    setShowForm(true);
  };

  if (loading) return <Loading />;

  return (
    <div className="px-4 sm:px-6 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">User Management</h1>
        <div className="flex gap-2 items-center">
          {user?.role === 'ADMIN' && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Show Inactive Users</span>
            </label>
          )}
          <Button
            variant="primary"
            onClick={handleAddUser}
          >
            + Add User
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {showForm && (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200/50 dark:border-gray-700/50 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {editingUser ? 'Edit User' : 'Add New User'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., John Doe"
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value.toLowerCase() })}
                required
                placeholder="e.g., john@example.com"
                disabled={!!editingUser} // Don't allow email changes
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="MANAGER">Manager</option>
                  <option value="CASHIER">Cashier</option>
                  <option value="WAREHOUSE">Warehouse</option>
                  <option value="ACCOUNTANT">Accountant</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Store
                </label>
                <select
                  value={formData.store}
                  onChange={(e) => setFormData({ ...formData, store: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">No Store (Admin only)</option>
                  {stores.map((store) => (
                    <option key={store._id} value={store._id}>
                      {store.name} ({store.storeCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Input
              label={editingUser ? 'New Password (leave blank to keep current)' : 'Password *'}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!editingUser}
              placeholder={editingUser ? 'Enter new password or leave blank' : 'Enter password'}
            />
            <div className="flex gap-2">
              <Button type="submit" variant="primary">
                {editingUser ? 'Update' : 'Create'}
              </Button>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Store
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No users found. Create your first user!
                  </td>
                </tr>
              ) : (
                users.map((userData) => (
                  <tr key={userData._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{userData.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{userData.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400">
                        {userData.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {userData.store?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {userData.isActive ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-1 flex-wrap">
                        <Button
                          variant="secondary"
                          onClick={() => handleEdit(userData)}
                          className="text-xs px-2 py-1"
                          title="Edit user details"
                        >
                          Edit
                        </Button>
                        {user?.role === 'ADMIN' && userData._id !== user._id && (
                          <>
                            {userData.isActive ? (
                              <Button
                                variant="secondary"
                                onClick={() => handleDeactivate(userData._id)}
                                className="text-xs px-2 py-1 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
                                title="Deactivate user (soft delete)"
                              >
                                Deactivate
                              </Button>
                            ) : (
                              <Button
                                variant="success"
                                onClick={() => handleActivate(userData._id)}
                                className="text-xs px-2 py-1"
                                title="Activate user"
                              >
                                Activate
                              </Button>
                            )}
                            <Button
                              variant="danger"
                              onClick={() => handlePermanentDelete(userData._id, userData.name)}
                              className="text-xs px-2 py-1"
                              title="Permanently delete user (cannot be undone)"
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;