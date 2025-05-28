import React, { useEffect, useState } from 'react';
import { Lock, Mail, Eye, EyeOff, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [requestSent, setRequestSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = () => {
      const storedId = localStorage.getItem('Id');
      const storename = localStorage.getItem('storename');
      const gst = localStorage.getItem('gstnumber');
      const address = localStorage.getItem('address');
      const pincode = localStorage.getItem('pincode');
      const hnscode = localStorage.getItem('hnscode');
      const email = localStorage.getItem('email');
      const phonenumber = localStorage.getItem('phonenumber');
      const profile_picture = localStorage.getItem('profile_picture');
      
      setUserId(storedId);
      if (storedId) {
        setUserData({
          id: storedId,
          storeName: storename || '',
          gstNumber: gst || '',
          address: address || '',
          pincode: pincode || '',
          hsnCode: hnscode || '',
          email: email || '',
          phone: phonenumber || '',
          password: '************',
          profileImage: profile_picture || 'https://via.placeholder.com/96',
        });
      } else {
        setUserData(null);
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  const handleRequestEdit = () => {
    // In a real app, this would send a request to your backend
    setRequestSent(true);
    setTimeout(() => setRequestSent(false), 3000);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <p className="text-red-500 text-center mb-4">No user found. Please log in.</p>
        <button 
          onClick={() => navigate('/login')} 
          className="px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10">
      <div className="w-full max-w-md space-y-6 bg-white rounded-lg shadow-lg p-8 relative">
        {/* Logout */}
        <button 
          onClick={handleLogout} 
          className="absolute top-4 right-4 flex items-center text-gray-500 hover:text-red-500 transition text-sm"
        >
          <LogOut size={16} className="mr-1" />Logout
        </button>

        {/* Account Status */}
        <div className="flex justify-start">
          <p className="text-sm font-medium text-gray-700">
            Account Status:{' '}
            <span className="text-green-600 font-semibold">Active</span>
          </p>
        </div>

        {/* Profile Image */}
        <div className="relative flex justify-center">
          <img
            src={userData.profileImage}
            alt="Store"
            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
          />
        </div>

        {/* Contact Admin Notice */}
        <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700 flex items-start">
          <Mail size={16} className="mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Need to update your profile?</p>
            <p>Contact admin or request changes below.</p>
          </div>
        </div>

        {/* User Info */}
        <div className="space-y-3 text-sm font-medium text-gray-700">
          <ReadOnlyField label="Store Name" value={userData.storeName} />
          <ReadOnlyField label="GST Number" value={userData.gstNumber} locked />
          <ReadOnlyField label="Address" value={userData.address} />
          <ReadOnlyField label="Pincode" value={userData.pincode} />
          <ReadOnlyField label="HSN Code" value={userData.hsnCode} />
          <ReadOnlyField label="Email" value={userData.email} locked type="email" />
          <ReadOnlyField label="Phone Number" value={userData.phone} />
          <ReadOnlyField 
            label="Password" 
            value={userData.password} 
            locked 
            type={showPassword ? 'text' : 'password'} 
            showToggle 
            onToggle={() => setShowPassword(!showPassword)} 
          />
        </div>

        {/* Request Edit Button */}
        <button 
          onClick={handleRequestEdit}
          disabled={requestSent}
          className={`w-full py-2 rounded transition flex items-center justify-center ${
            requestSent 
              ? 'bg-green-100 text-green-700' 
              : 'bg-cyan-600 text-white hover:bg-cyan-700'
          }`}
        >
          {requestSent ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Request Sent
            </>
          ) : (
            'Request Profile Edit'
          )}
        </button>

        {/* Success Message */}
        {requestSent && (
          <div className="text-center text-green-600 text-sm mt-2">
            Your edit request has been sent to admin for approval.
          </div>
        )}
      </div>
    </div>
  );
};

const ReadOnlyField = ({ label, value, type = 'text', locked = false, showToggle = false, onToggle }) => (
  <div className="flex items-center">
    <label className="w-32 text-gray-500 text-xs mr-2">{label}</label>
    <div className="flex-1 relative">
      <input
        type={type}
        value={value}
        readOnly
        className="w-full px-3 py-2 rounded bg-gray-100 text-gray-700 border border-transparent cursor-default"
      />
      {locked && <Lock className="text-gray-400 absolute right-2 top-2" size={16} />}
      {showToggle && (
        <button 
          type="button" 
          onClick={onToggle} 
          className="absolute right-8 top-2 text-gray-400 hover:text-gray-600"
        >
          {type === 'password' ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
      )}
    </div>
  </div>
);

export default Profile;