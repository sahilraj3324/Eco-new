import React from 'react';
import { useAuthContext } from '../context/AuthContext';

const UserProfile = () => {
  const { user, loading, logout, refreshUser } = useAuthContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 text-center text-gray-500">
        No user data available
      </div>
    );
  }

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      await logout();
    }
  };

  const handleRefresh = async () => {
    await refreshUser();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">User Profile</h2>
        <div className="space-x-2">
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
          >
            Refresh
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Store Name</label>
            <p className="mt-1 text-gray-900">{user.storename}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="mt-1 text-gray-900">{user.email}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <p className="mt-1 text-gray-900">{user.phoneNumber}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">User Type</label>
            <p className="mt-1 text-gray-900">{user.userType}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              user.status === 'Approved' 
                ? 'bg-green-100 text-green-800' 
                : user.status === 'InReview'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {user.status}
            </span>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">GST Number</label>
            <p className="mt-1 text-gray-900">{user.gstNumber}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Pincode</label>
            <p className="mt-1 text-gray-900">{user.pincode}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">HSN Code</label>
            <p className="mt-1 text-gray-900">{user.hnscode}</p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700">Address</label>
        <p className="mt-1 text-gray-900">{user.address}</p>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>User ID: {user.id}</p>
        <p>Created: {new Date(user.createdAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default UserProfile; 