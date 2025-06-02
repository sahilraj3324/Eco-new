import { useState, useEffect } from 'react';
import api from '../api';
import { isAdmin } from '../utils/auth';

// Fallback tabs in case API fails
const FALLBACK_TABS = [
  { value: "dashboard", name: "Dashboard", description: "View system overview and analytics" },
  { value: "vendors", name: "Vendors", description: "Manage vendors and their profiles" },
  { value: "products", name: "Products", description: "Manage products and inventory" },
  { value: "categories", name: "Categories", description: "Manage product categories and subcategories" },
  { value: "retailers", name: "Retailers", description: "Manage retailer accounts and profiles" },
  { value: "orders", name: "Orders", description: "View and manage customer orders" },
  { value: "asks", name: "Asks", description: "Handle customer questions and support requests" },
  { value: "roles", name: "Roles", description: "Manage user roles and permissions (Admin only)" },
  { value: "admins", name: "Admins", description: "Manage admin and sub-admin accounts (Admin only)" }
];

export default function Role() {
  const [roles, setRoles] = useState([]);
  const [availableTabs, setAvailableTabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabsLoading, setTabsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Role form states
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [roleForm, setRoleForm] = useState({
    name: '',
    tabs: []
  });
  const [editingRoleId, setEditingRoleId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching roles and available tabs...');
      
      // Fetch roles
      const rolesData = await api.role.getAll();
      console.log('Roles fetched:', rolesData);
      setRoles(rolesData);
      
      // Fetch available tabs with fallback
      setTabsLoading(true);
      try {
        const tabsData = await api.role.getAvailableTabs();
        console.log('Available tabs fetched:', tabsData);
        if (tabsData && Array.isArray(tabsData) && tabsData.length > 0) {
          setAvailableTabs(tabsData);
        } else {
          console.warn('No tabs data received, using fallback');
          setAvailableTabs(FALLBACK_TABS);
        }
      } catch (tabsError) {
        console.error('Error fetching available tabs, using fallback:', tabsError);
        setAvailableTabs(FALLBACK_TABS);
      }
      setTabsLoading(false);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
      // Set fallback tabs even on error
      setAvailableTabs(FALLBACK_TABS);
      setTabsLoading(false);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get tab info by value
  const getTabInfo = (tabValue) => {
    return availableTabs.find(tab => tab.value === tabValue) || { name: tabValue, description: '' };
  };

  // Role form handlers
  const handleRoleChange = (e) => {
    const { name, value } = e.target;
    setRoleForm(prev => ({ ...prev, [name]: value }));
  };

  const handleTabChange = (tabValue) => {
    setRoleForm(prev => ({
      ...prev,
      tabs: prev.tabs.includes(tabValue)
        ? prev.tabs.filter(t => t !== tabValue)
        : [...prev.tabs, tabValue]
    }));
  };

  const resetRoleForm = () => {
    setRoleForm({
      name: '',
      tabs: []
    });
    setEditingRoleId(null);
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    if (roleForm.tabs.length === 0) {
      alert('Please select at least one tab for the role');
      return;
    }

    try {
      if (editingRoleId) {
        await api.role.update(editingRoleId, roleForm);
      } else {
        await api.role.create(roleForm);
      }
      fetchData();
      resetRoleForm();
      setShowRoleForm(false);
    } catch (err) {
      console.error('Error saving role:', err);
      alert('Failed to save role. Please try again.');
    }
  };

  const editRole = (role) => {
    setRoleForm({
      name: role.name,
      tabs: role.tabs || []
    });
    setEditingRoleId(role.id);
    setShowRoleForm(true);
  };

  const deleteRole = async (id) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;
    
    try {
      await api.role.delete(id);
      fetchData();
    } catch (err) {
      console.error('Error deleting role:', err);
      alert('Failed to delete role. Please try again.');
    }
  };

  const toggleRoleTab = async (roleId, tabValue) => {
    try {
      const role = roles.find(r => r.id === roleId);
      if (!role) return;

      const updatedTabs = role.tabs.includes(tabValue)
        ? role.tabs.filter(t => t !== tabValue)
        : [...role.tabs, tabValue];

      await api.role.updateTabs(roleId, updatedTabs);
      fetchData();
    } catch (err) {
      console.error('Error updating role tabs:', err);
      alert('Failed to update role tabs. Please try again.');
    }
  };

  // Check if user has permission to access role management
  if (!isAdmin()) {
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

  if (loading && !roles.length) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Role Management</h1>
        <p className="text-gray-600 mt-1">Create and manage roles with specific tab permissions for admin panel access</p>
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

      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-medium text-gray-800">Roles</h2>
        <button
          onClick={() => {
            resetRoleForm();
            setShowRoleForm(true);
          }}
          className="rounded-md bg-cyan-500 px-4 py-2 text-white hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
        >
          Create New Role
        </button>
      </div>

      {/* Role Form */}
      {showRoleForm && (
        <div className="mb-6 rounded-md bg-white p-6 shadow">
          <h3 className="mb-4 text-lg font-medium text-gray-800">
            {editingRoleId ? 'Edit Role' : 'Create New Role'}
          </h3>
          <form onSubmit={handleRoleSubmit}>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="role_name" className="block text-sm font-medium text-gray-700">
                  Role Name
                </label>
                <input
                  type="text"
                  id="role_name"
                  name="name"
                  value={roleForm.name}
                  onChange={handleRoleChange}
                  required
                  placeholder="e.g., Finance Manager, Product Manager, Customer Support"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Admin Panel Access Permissions
                </label>
                <p className="text-sm text-gray-600 mb-4">
                  Select which sections of the admin panel this role can access. You can select multiple options:
                </p>
                
                {tabsLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-cyan-500"></div>
                  </div>
                ) : availableTabs.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">No admin panel sections available</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableTabs.map(tab => (
                      <div 
                        key={tab.value} 
                        className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          roleForm.tabs.includes(tab.value)
                            ? 'border-cyan-500 bg-cyan-50 shadow-sm'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                        onClick={() => handleTabChange(tab.value)}
                      >
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={roleForm.tabs.includes(tab.value)}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleTabChange(tab.value);
                            }}
                            className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded mt-1 cursor-pointer"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="text-sm font-medium text-gray-900">{tab.name}</h4>
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                /{tab.value}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{tab.description}</p>
                          </div>
                        </div>
                        {roleForm.tabs.includes(tab.value) && (
                          <div className="absolute top-2 right-2">
                            <div className="w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                {!tabsLoading && availableTabs.length > 0 && roleForm.tabs.length === 0 && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Please select at least one admin panel section for this role
                    </p>
                  </div>
                )}
                
                {!tabsLoading && roleForm.tabs.length > 0 && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-800">
                      <strong>✓ Selected permissions ({roleForm.tabs.length}):</strong> Users with this role will have access to{' '}
                      {roleForm.tabs.map(tabValue => {
                        const tabInfo = getTabInfo(tabValue);
                        return tabInfo.name;
                      }).join(', ')} sections.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  resetRoleForm();
                  setShowRoleForm(false);
                }}
                className="mr-3 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={roleForm.tabs.length === 0 || tabsLoading}
                className="rounded-md bg-cyan-500 px-4 py-2 text-sm text-white hover:bg-cyan-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {editingRoleId ? 'Update Role' : 'Create Role'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Roles Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Role Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Admin Panel Access
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Quick Access Management
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {roles.length > 0 ? (
              roles.map((role) => (
                <tr key={role.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{role.name}</div>
                    <div className="text-xs text-gray-500">
                      Created: {new Date(role.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(role.tabs || []).length > 0 ? (
                        role.tabs.map((tabValue, index) => {
                          const tabInfo = getTabInfo(tabValue);
                          return (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800"
                              title={tabInfo.description}
                            >
                              {tabInfo.name}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-gray-400 text-sm italic">No access permissions</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {availableTabs.map(tab => {
                        const hasTab = (role.tabs || []).includes(tab.value);
                        return (
                          <button
                            key={tab.value}
                            onClick={() => toggleRoleTab(role.id, tab.value)}
                            className={`px-2 py-1 text-xs rounded transition-colors ${
                              hasTab
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            title={hasTab ? `Remove ${tab.name} access` : `Add ${tab.name} access`}
                          >
                            {hasTab ? '✓' : '+'} {tab.name}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                    <button
                      onClick={() => editRole(role)}
                      className="mr-2 text-cyan-600 hover:text-cyan-900 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteRole(role.id)}
                      className="text-red-600 hover:text-red-900 font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No roles found</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by creating your first role.</p>
                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={() => {
                          resetRoleForm();
                          setShowRoleForm(true);
                        }}
                        className="inline-flex items-center rounded-md border border-transparent bg-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                      >
                        <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create Your First Role
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}