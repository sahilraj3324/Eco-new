import { useState, useEffect } from 'react';
import api from '../api';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('admins');
  const [admins, setAdmins] = useState([]);
  const [subAdmins, setSubAdmins] = useState([]);
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
    role: ''
  });
  const [editingSubAdminId, setEditingSubAdminId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [adminsData, subAdminsData] = await Promise.all([
        api.admin.getAll(),
        api.subAdmin.getAll()
      ]);
      setAdmins(adminsData);
      setSubAdmins(subAdminsData);
    } catch (err) {
      console.error('Error fetching data:', err);
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
      console.error('Error saving admin:', err);
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
      console.error('Error deleting admin:', err);
      alert('Failed to delete admin. Please try again.');
    }
  };

  // SubAdmin form handlers
  const handleSubAdminChange = (e) => {
    const { name, value } = e.target;
    setSubAdminForm(prev => ({ ...prev, [name]: value }));
  };

  const resetSubAdminForm = () => {
    setSubAdminForm({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: ''
    });
    setEditingSubAdminId(null);
  };

  const handleSubAdminSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSubAdminId) {
        await api.subAdmin.update(editingSubAdminId, subAdminForm);
      } else {
        await api.subAdmin.create(subAdminForm);
      }
      fetchData();
      resetSubAdminForm();
      setShowSubAdminForm(false);
    } catch (err) {
      console.error('Error saving subadmin:', err);
      alert('Failed to save subadmin. Please try again.');
    }
  };

  const editSubAdmin = (subAdmin) => {
    setSubAdminForm({
      name: subAdmin.name,
      email: subAdmin.email,
      phone: subAdmin.phone,
      password: subAdmin.password || '', // Password might not be returned from API
      role: subAdmin.role || ''
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
      console.error('Error deleting subadmin:', err);
      alert('Failed to delete subadmin. Please try again.');
    }
  };

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
        <h1 className="text-2xl font-semibold text-gray-800">Admin Management</h1>
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

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex flex-wrap -mb-px">
          <button
            className={`mr-2 inline-block py-4 px-4 text-sm font-medium ${
              activeTab === 'admins'
                ? 'border-b-2 border-cyan-500 text-cyan-600'
                : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('admins')}
          >
            Admins
          </button>
          <button
            className={`mr-2 inline-block py-4 px-4 text-sm font-medium ${
              activeTab === 'subadmins'
                ? 'border-b-2 border-cyan-500 text-cyan-600'
                : 'border-b-2 border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('subadmins')}
          >
            Sub-Admins
          </button>
        </div>
      </div>

      {/* Admins Tab Content */}
      {activeTab === 'admins' && (
        <div>
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

      {/* SubAdmins Tab Content */}
      {activeTab === 'subadmins' && (
        <div>
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-medium text-gray-800">Sub-Admins</h2>
            <button
              onClick={() => {
                resetSubAdminForm();
                setShowSubAdminForm(true);
              }}
              className="rounded-md bg-cyan-500 px-4 py-2 text-white hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            >
              Add Sub-Admin
            </button>
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
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <input
                      type="text"
                      id="role"
                      name="role"
                      value={subAdminForm.role}
                      onChange={handleSubAdminChange}
                      required
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
                    />
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
                    className="rounded-md bg-cyan-500 px-4 py-2 text-sm text-white hover:bg-cyan-600"
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
                    Role
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
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-gray-500">{subAdmin.role}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                        <button
                          onClick={() => editSubAdmin(subAdmin)}
                          className="mr-2 text-cyan-600 hover:text-cyan-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteSubAdmin(subAdmin.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
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
      )}
    </div>
  );
} 