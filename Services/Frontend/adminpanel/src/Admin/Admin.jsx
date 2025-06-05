import { useState, useEffect } from 'react';
import api from '../api';
import { getCurrentUser, isAdmin, isSubAdmin } from '../utils/auth';

export default function Admin() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [subAdmins, setSubAdmins] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Admin form states
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [editingAdminId, setEditingAdminId] = useState(null);
  
  // SubAdmin form states
  const [showSubAdminForm, setShowSubAdminForm] = useState(false);
  const [subAdminForm, setSubAdminForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    roles: []
  });
  const [editingSubAdminId, setEditingSubAdminId] = useState(null);

  useEffect(() => {
    // Automatically detect user type and set initial state
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setUserType(user.type);
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = getCurrentUser();
      const userType = user?.type;

      // Fetch data based on user type and permissions
      const promises = [];
      
      if (userType === 'admin') {
        // Admins can see both admins and subadmins
        promises.push(
          api.admin.getAll(),
          api.subAdmin.getAll(),
          api.role.getAll()
        );
      } else if (userType === 'subAdmin') {
        // SubAdmins can only see subadmins (if they have admin permission)
        promises.push(
          Promise.resolve([]), // No admin access for subadmins
          api.subAdmin.getAll(),
          api.role.getAll()
        );
      }

      const [adminsData, subAdminsData, rolesData] = await Promise.all(promises);
      
      setAdmins(adminsData || []);
      setSubAdmins(subAdminsData || []);
      setRoles(rolesData || []);
    } catch (err) {
      setError('Failed to load data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Admin form handlers
  const handleAdminChange = (e) => {
    const { name, value } = e.target;
    setAdminForm(prev => ({ ...prev, [name]: value }));
  };

  const resetAdminForm = () => {
    setAdminForm({
      name: '',
      email: '',
      phone: '',
      password: ''
    });
    setEditingAdminId(null);
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAdminId) {
        await api.admin.update(editingAdminId, adminForm);
      } else {
        await api.admin.create(adminForm);
      }
      fetchData();
      resetAdminForm();
      setShowAdminForm(false);
    } catch (err) {
      alert('Failed to save admin. Please try again.');
    }
  };

  const editAdmin = (admin) => {
    setAdminForm({
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      password: admin.password || '' // Password might not be returned from API
    });
    setEditingAdminId(admin.id);
    setShowAdminForm(true);
  };

  const deleteAdmin = async (id) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) return;
    
    try {
      await api.admin.delete(id);
      fetchData();
    } catch (err) {
      alert('Failed to delete admin. Please try again.');
    }
  };

  // SubAdmin form handlers
  const handleSubAdminChange = (e) => {
    const { name, value } = e.target;
    setSubAdminForm(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (roleId) => {
    setSubAdminForm(prev => ({
      ...prev,
      roles: prev.roles.includes(roleId)
        ? prev.roles.filter(r => r !== roleId)
        : [...prev.roles, roleId]
    }));
  };

  const resetSubAdminForm = () => {
    setSubAdminForm({
      name: '',
      email: '',
      phone: '',
      password: '',
      roles: []
    });
    setEditingSubAdminId(null);
  };

  const handleSubAdminSubmit = async (e) => {
    e.preventDefault();
    if (subAdminForm.roles.length === 0) {
      alert('Please select at least one role for the subadmin');
      return;
    }

    try {
      // Prepare data with proper structure for API
      const formData = {
        ...subAdminForm,
        Roles: subAdminForm.roles // Map to capital R for C# model (role IDs)
      };
      delete formData.roles; // Remove lowercase version

      if (editingSubAdminId) {
        await api.subAdmin.update(editingSubAdminId, formData);
      } else {
        await api.subAdmin.create(formData);
      }
      fetchData();
      resetSubAdminForm();
      setShowSubAdminForm(false);
    } catch (err) {
      alert('Failed to save subadmin. Please try again.');
    }
  };

  const editSubAdmin = (subAdmin) => {
    setSubAdminForm({
      name: subAdmin.name,
      email: subAdmin.email,
      phone: subAdmin.phone,
      password: subAdmin.password || '', // Password might not be returned from API
      roles: subAdmin.roles || subAdmin.Roles || [] // Handle both cases for role IDs
    });
    setEditingSubAdminId(subAdmin.id);
    setShowSubAdminForm(true);
  };

  const deleteSubAdmin = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subadmin?')) return;
    
    try {
      await api.subAdmin.delete(id);
      fetchData();
    } catch (err) {
      alert('Failed to delete subadmin. Please try again.');
    }
  };

  // Role management for existing SubAdmins
  const addRoleToSubAdmin = async (subAdminId, roleId) => {
    try {
      const subAdmin = subAdmins.find(sa => sa.id === subAdminId);
      if (!subAdmin) return;

      const currentRoles = subAdmin.roles || subAdmin.Roles || [];
      if (currentRoles.includes(roleId)) return; // Already has this role

      const updatedRoles = [...currentRoles, roleId];
      await api.subAdmin.updateRoles(subAdminId, updatedRoles);
      fetchData();
    } catch (err) {
      alert('Failed to add role. Please try again.');
    }
  };

  const removeRoleFromSubAdmin = async (subAdminId, roleId) => {
    try {
      const subAdmin = subAdmins.find(sa => sa.id === subAdminId);
      if (!subAdmin) return;

      const currentRoles = subAdmin.roles || subAdmin.Roles || [];
      const updatedRoles = currentRoles.filter(r => r !== roleId);
      
      await api.subAdmin.updateRoles(subAdminId, updatedRoles);
      fetchData();
    } catch (err) {
      alert('Failed to remove role. Please try again.');
    }
  };

  // Helper function to get role name by ID
  const getRoleName = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : 'Unknown Role';
  };

  // Helper function to get assigned roles for display
  const getSubAdminRoles = (subAdmin) => {
    const subAdminRoleIds = subAdmin.roles || subAdmin.Roles || [];
    return subAdminRoleIds.map(roleId => {
      const role = roles.find(r => r.id === roleId);
      return role || { id: roleId, name: 'Unknown Role' };
    });
  };

  // Check if user has permission to access admin management
  if (!isAdmin() && !isSubAdmin()) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading && !admins.length && !subAdmins.length) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          {userType === 'admin' ? 'Admin & SubAdmin Management' : 'SubAdmin Management'}
        </h1>
        <p className="text-gray-600 mt-1">
          {userType === 'admin' 
            ? 'Manage administrators and assign roles to sub-administrators' 
            : 'Manage sub-administrators and their roles'
          }
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Show Admins Section only if user is admin */}
      {userType === 'admin' && (
        <div className="mb-8">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-medium text-gray-800">Admins</h2>
            <button
              onClick={() => {
                resetAdminForm();
                setShowAdminForm(true);
              }}
              className="rounded-md bg-cyan-500 px-4 py-2 text-white hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            >
              Add Admin
            </button>
          </div>

          {/* Admin Form */}
          {showAdminForm && (
            <div className="mb-6 rounded-md bg-white p-6 shadow">
              <h3 className="mb-4 text-lg font-medium text-gray-800">
                {editingAdminId ? 'Edit Admin' : 'Add New Admin'}
              </h3>
              <form onSubmit={handleAdminSubmit}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={adminForm.name}
                      onChange={handleAdminChange}
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={adminForm.email}
                      onChange={handleAdminChange}
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={adminForm.phone}
                      onChange={handleAdminChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={adminForm.password}
                      onChange={handleAdminChange}
                      required={!editingAdminId}
                      placeholder={editingAdminId ? '(leave empty to keep current)' : ''}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      resetAdminForm();
                      setShowAdminForm(false);
                    }}
                    className="mr-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-cyan-500 px-4 py-2 text-sm text-white hover:bg-cyan-600"
                  >
                    {editingAdminId ? 'Update Admin' : 'Create Admin'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Admins Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow mb-8">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Phone
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {admins.length > 0 ? (
                  admins.map((admin) => (
                    <tr key={admin.id}>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-gray-500">{admin.email}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-gray-500">{admin.phone}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                        <button
                          onClick={() => editAdmin(admin)}
                          className="mr-2 text-cyan-600 hover:text-cyan-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteAdmin(admin.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                      No admins found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SubAdmins Section - shown for both admin and subadmin users */}
      <div>
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-medium text-gray-800">Sub-Admins</h2>
          {(userType === 'admin' || (userType === 'subAdmin' && currentUser?.data?.accessibleTabs?.includes('admins'))) && (
            <button
              onClick={() => {
                resetSubAdminForm();
                setShowSubAdminForm(true);
              }}
              className="rounded-md bg-cyan-500 px-4 py-2 text-white hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            >
              Add Sub-Admin
            </button>
          )}
        </div>

        {/* SubAdmin Form */}
        {showSubAdminForm && (
          <div className="mb-6 rounded-md bg-white p-6 shadow">
            <h3 className="mb-4 text-lg font-medium text-gray-800">
              {editingSubAdminId ? 'Edit Sub-Admin' : 'Add New Sub-Admin'}
            </h3>
            <form onSubmit={handleSubAdminSubmit}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    id="sub_name"
                    name="name"
                    value={subAdminForm.name}
                    onChange={handleSubAdminChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="sub_email"
                    name="email"
                    value={subAdminForm.email}
                    onChange={handleSubAdminChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    type="text"
                    id="sub_phone"
                    name="phone"
                    value={subAdminForm.phone}
                    onChange={handleSubAdminChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    id="sub_password"
                    name="password"
                    value={subAdminForm.password}
                    onChange={handleSubAdminChange}
                    required={!editingSubAdminId}
                    placeholder={editingSubAdminId ? '(leave empty to keep current)' : ''}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Assign Roles (Select multiple)
                  </label>
                  {roles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {roles.map(role => (
                        <label key={role.id} className="flex items-start space-x-2 cursor-pointer p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={subAdminForm.roles.includes(role.id)}
                            onChange={() => handleRoleChange(role.id)}
                            className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded mt-1"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-700">{role.name}</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {(role.tabs || []).map((tab, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-cyan-100 text-cyan-800"
                                >
                                  {tab.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                              ))}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <p>No roles available. Please create roles first in the Role Management tab.</p>
                    </div>
                  )}
                  {subAdminForm.roles.length === 0 && roles.length > 0 && (
                    <p className="mt-1 text-sm text-red-600">Please select at least one role</p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    resetSubAdminForm();
                    setShowSubAdminForm(false);
                  }}
                  className="mr-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={subAdminForm.roles.length === 0 || roles.length === 0}
                  className="rounded-md bg-cyan-500 px-4 py-2 text-sm text-white hover:bg-cyan-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {editingSubAdminId ? 'Update Sub-Admin' : 'Create Sub-Admin'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SubAdmins Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Phone
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Assigned Roles
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {subAdmins.length > 0 ? (
                subAdmins.map((subAdmin) => (
                  <tr key={subAdmin.id}>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{subAdmin.name}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-500">{subAdmin.email}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-500">{subAdmin.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {getSubAdminRoles(subAdmin).length > 0 ? (
                          getSubAdminRoles(subAdmin).map((role) => (
                            <span
                              key={role.id}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800"
                            >
                              {role.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-sm">No roles assigned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="flex flex-col space-y-2">
                        <div className="flex space-x-2">
                          {(userType === 'admin' || (userType === 'subAdmin' && currentUser?.data?.accessibleTabs?.includes('admins'))) && (
                            <>
                              <button
                                onClick={() => editSubAdmin(subAdmin)}
                                className="text-cyan-600 hover:text-cyan-900"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteSubAdmin(subAdmin.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                        {(userType === 'admin' || (userType === 'subAdmin' && currentUser?.data?.accessibleTabs?.includes('admins'))) && (
                          <div className="flex flex-wrap gap-1">
                            {roles.map(role => {
                              const hasRole = (subAdmin.roles || subAdmin.Roles || []).includes(role.id);
                              return (
                                <button
                                  key={role.id}
                                  onClick={() => hasRole ? removeRoleFromSubAdmin(subAdmin.id, role.id) : addRoleToSubAdmin(subAdmin.id, role.id)}
                                  className={`px-2 py-1 text-xs rounded transition-colors ${
                                    hasRole
                                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                  }`}
                                  title={hasRole ? `Remove ${role.name} role` : `Add ${role.name} role`}
                                >
                                  {hasRole ? '✓' : '+'} {role.name}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No sub-admins found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 
