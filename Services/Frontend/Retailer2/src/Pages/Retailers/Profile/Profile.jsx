import React, { useEffect, useState } from 'react';
import { Lock, Pencil } from 'lucide-react';
import store from "../../../assets/shop.png"
import { useAuthContext } from '../../../contexts/AuthContext';

const Profile = () => {
  const { user, isAuthenticated, loading } = useAuthContext();
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    if (user) {
      setUserInfo(user);
    }
  }, [user]);

  if (loading) {
    return <div className="profile-container">Loading...</div>;
  }

  if (!isAuthenticated || !userInfo) {
    return <div className="profile-container">Please log in to view your profile.</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10">
      {userInfo ? (
        <div className="w-full max-w-md space-y-6">
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
              src={store}
              alt="Store"
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
            />
            <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm cursor-pointer">
              <Pencil size={16} className="text-gray-600" />
            </div>
          </div>

          {/* User Info */}
          <div className="space-y-3 text-sm font-medium text-gray-700">
            <ReadOnlyInput value={userInfo.storename} locked />
            <ReadOnlyInput value={userInfo.gstNumber} locked />
            <ReadOnlyInput value={userInfo.address} locked />
            <ReadOnlyInput value={userInfo.pincode} locked/>
            <ReadOnlyInput value={userInfo.hnscode} locked />
            <ReadOnlyInput value={userInfo.email} type="email" locked/>
            <ReadOnlyInput value={userInfo.phoneNumber} locked />
            <ReadOnlyInput value="************" type="password" />
          </div>

          {/* Update Button */}
          <button className="w-full bg-cyan-600  text-white font-semibold py-3 rounded hover:bg-cyan-700 transition">
            Update Details
          </button>
        </div>
      ) : (
        <p className="text-gray-600 text-center">No user data available.</p>
      )}
    </div>
  );
};

const ReadOnlyInput = ({ value, type = 'text', locked = false }) => (
  <div className="flex items-center">
    <input
      type={type}
      value={value || ''}
      readOnly
      className="w-full px-4 py-2 rounded-full bg-white text-center shadow-sm cursor-default"
    />
    {locked && <Lock className="text-gray-400 ml-2" size={16} />}
  </div>
);

export default Profile;
