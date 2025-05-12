import React, { useEffect, useState } from 'react';
import { Lock, Pencil } from 'lucide-react';
import store from "../../../assets/shop.png"

const Profile = () => {
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
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
      // Simulate API call
      setTimeout(() => {
        setUserData({
          id: storedId,
          storeName: storename,
          gstNumber: gst,
          address: address,
          pincode: pincode,
          hsnCode: hnscode,
          email: email,
          phone: phonenumber,
          password: '************',
          profileImage: 'https://via.placeholder.com/96',
        });
      }, 500);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10">
      {userId ? (
        userData ? (
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
              <ReadOnlyInput value={userData.storeName} locked />
              <ReadOnlyInput value={userData.gstNumber} locked />
              <ReadOnlyInput value={userData.address} locked />
              <ReadOnlyInput value={userData.pincode} locked/>
              <ReadOnlyInput value={userData.hsnCode} locked />
              <ReadOnlyInput value={userData.email} type="email" locked/>
              <ReadOnlyInput value={userData.phone} locked />
              <ReadOnlyInput value={userData.password} type="password" />
            </div>

            {/* Update Button */}
            <button className="w-full bg-cyan-600  text-white font-semibold py-3 rounded hover:bg-cyan-700 transition">
              Update Details
            </button>
          </div>
        ) : (
          <p className="text-gray-600 text-center">Loading profile...</p>
        )
      ) : (
        <p className="text-red-500 text-center">No user ID found in local storage.</p>
      )}
    </div>
  );
};

const ReadOnlyInput = ({ value, type = 'text', locked = false }) => (
  <div className="flex items-center">
    <input
      type={type}
      value={value}
      readOnly
      className="w-full px-4 py-2 rounded-full bg-white text-center shadow-sm cursor-default"
    />
    {locked && <Lock className="text-gray-400 ml-2" size={16} />}
  </div>
);

export default Profile;
