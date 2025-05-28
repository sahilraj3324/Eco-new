import React from 'react';
import { User, MapPin, ShoppingBag, Heart, CreditCard, Bell, Shield, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const settingsOptions = [
  {
    label: 'Account Info',
    description: 'View and update your profile information',
    icon: <User size={24} className="text-cyan-600" />, 
    path: '/profile',
  },
  {
    label: 'Address Book',
    description: 'Manage your shipping and billing addresses',
    icon: <MapPin size={24} className="text-cyan-600" />, 
    path: '/addresses',
  },
  {
    label: 'Orders',
    description: 'Track your orders and view order history',
    icon: <ShoppingBag size={24} className="text-cyan-600" />, 
    path: '/orders',
  },
  {
    label: 'Wishlist',
    description: 'View and manage your wishlist',
    icon: <Heart size={24} className="text-cyan-600" />, 
    path: '/wishlist',
  },
  {
    label: 'Payment Methods',
    description: 'Manage your saved cards and payment options',
    icon: <CreditCard size={24} className="text-cyan-600" />, 
    path: '/payments',
  },
  {
    label: 'Notifications',
    description: 'Set your notification preferences',
    icon: <Bell size={24} className="text-cyan-600" />, 
    path: '/notifications',
  },
  {
    label: 'Security',
    description: 'Change your password and secure your account',
    icon: <Shield size={24} className="text-cyan-600" />, 
    path: '/security',
  },
];

const Settings = () => {
  const navigate = useNavigate();

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Settings</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {settingsOptions.map((option) => (
            <button
              key={option.label}
              onClick={() => handleNavigate(option.path)}
              className="flex items-start p-5 bg-white rounded-xl shadow hover:shadow-lg transition group w-full text-left border border-transparent hover:border-cyan-200"
            >
              <div className="mr-4 flex-shrink-0">
                {option.icon}
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-800 group-hover:text-cyan-700 flex items-center">{option.label}</div>
                <div className="text-gray-500 text-sm mt-1">{option.description}</div>
              </div>
            </button>
          ))}
          {/* Logout Card */}
          <button
            onClick={handleLogout}
            className="flex items-start p-5 bg-white rounded-xl shadow hover:shadow-lg transition group w-full text-left border border-transparent hover:border-red-200"
          >
            <div className="mr-4 flex-shrink-0">
              <LogOut size={24} className="text-red-500" />
            </div>
            <div>
              <div className="text-lg font-semibold text-red-600 group-hover:text-red-700 flex items-center">Logout</div>
              <div className="text-gray-500 text-sm mt-1">Sign out of your account</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings; 