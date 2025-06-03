import React, { useEffect, useState } from 'react';
import { 
  Lock, Pencil, User, Store, Mail, Phone, MapPin, FileText, 
  Camera, Save, X, AlertCircle, CheckCircle, Loader2, Edit3,
  Building, Hash, CreditCard, Shield
} from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../../Firebase/firebase";
import axios from 'axios';

const Profile = () => {
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);
  const [editedData, setEditedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const storedId = localStorage.getItem('Id');
    setUserId(storedId);

    if (storedId) {
      fetchUserData(storedId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/Seller/get/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      const formattedData = {
        id: data.id || id,
        storename: data.storename || data.store_name || '',
        gstNumber: data.gstNumber || data.gst_number || '',
        address: data.address || '',
        pincode: data.pincode || '',
        hnscode: data.hnscode || data.hsn_code || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || data.phone || data.phone_number || '',
        profile_picture: data.profile_picture || data.profileImage || '',
        status: data.status || data.Status || 'Active',
        userType: data.userType || 'Vendor'
      };
      
      setUserData(formattedData);
      setEditedData({ ...formattedData });
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (file) => {
    if (!file) return null;
    
    setUploadingImage(true);
    try {
      const imageRef = ref(storage, `profile_pictures/${userId}_${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(imageRef, file);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          null,
          (error) => reject(error),
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          }
        );
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setEditedData(prev => ({
        ...prev,
        profile_picture: previewUrl
      }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    
    try {
      let profileImageUrl = editedData.profile_picture;
      
      // Upload new profile image if selected
      if (profileImageFile) {
        profileImageUrl = await handleImageUpload(profileImageFile);
      }
      
      const updateData = {
        ...editedData,
        profile_picture: profileImageUrl,
        phoneNumber: parseInt(editedData.phoneNumber) || 0,
        pincode: parseInt(editedData.pincode) || 0
      };
      
      const response = await axios.put(`/api/Seller/update-all-fields/${userId}`, updateData, {
        headers: { "Content-Type": "application/json" }
      });
      
      if (response.data && response.data.seller) {
        setUserData(response.data.seller);
        setEditedData({ ...response.data.seller });
        setMessage("✅ Profile updated successfully!");
        setIsEditing(false);
        setProfileImageFile(null);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage(`❌ Failed to update profile: ${error.response?.data?.message || error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedData({ ...userData });
    setIsEditing(false);
    setProfileImageFile(null);
    setMessage("");
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (!userId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Error</h3>
          <p className="text-red-600">No user ID found in local storage.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Profile</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => fetchUserData(userId)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-600">No user data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendor Profile</h1>
              <p className="text-gray-600">Manage your store information and settings</p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(userData.status)}`}>
                <Shield className="h-4 w-4 inline mr-1" />
                {userData.status}
              </div>
              
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancel}
                    className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`mt-4 p-4 rounded-xl ${
              message.includes('✅') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              <div className="flex items-center">
                {message.includes('✅') ? (
                  <CheckCircle className="h-5 w-5 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-2" />
                )}
                <span className="font-medium">{message}</span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Image Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Camera className="h-5 w-5 mr-2" />
                Profile Picture
              </h3>
              
              <div className="text-center">
                <div className="relative inline-block">
                  <img
                    src={editedData?.profile_picture || "/api/placeholder/150/150"}
                    alt="Profile"
                    onError={(e) => (e.target.src = "/api/placeholder/150/150")}
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                  />
                  
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-blue-700 transition-colors">
                      <Camera className="h-4 w-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                  
                  {uploadingImage && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
                
                <div className="mt-4">
                  <h4 className="text-lg font-semibold text-gray-900">{userData.storename}</h4>
                  <p className="text-gray-600">{userData.userType}</p>
                </div>
                
                {isEditing && (
                  <p className="text-sm text-gray-500 mt-2">
                    Click the camera icon to change your profile picture
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Store Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Store Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Store className="h-4 w-4 inline mr-1" />
                    Store Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData?.storename || ''}
                      onChange={(e) => handleInputChange('storename', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter store name"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                      {userData.storename || 'Not provided'}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editedData?.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter email address"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                      {userData.email || 'Not provided'}
                    </div>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedData?.phoneNumber || ''}
                      onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                      {userData.phoneNumber || 'Not provided'}
                    </div>
                  )}
                </div>

                {/* GST Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CreditCard className="h-4 w-4 inline mr-1" />
                    GST Number
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData?.gstNumber || ''}
                      onChange={(e) => handleInputChange('gstNumber', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter GST number"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                      {userData.gstNumber || 'Not provided'}
                    </div>
                  )}
                </div>

                {/* HSN Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Hash className="h-4 w-4 inline mr-1" />
                    HSN Code
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData?.hnscode || ''}
                      onChange={(e) => handleInputChange('hnscode', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter HSN code"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                      {userData.hnscode || 'Not provided'}
                    </div>
                  )}
                </div>

                {/* Pincode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Pincode
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedData?.pincode || ''}
                      onChange={(e) => handleInputChange('pincode', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter pincode"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                      {userData.pincode || 'Not provided'}
                    </div>
                  )}
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building className="h-4 w-4 inline mr-1" />
                    Address
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editedData?.address || ''}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter complete address"
                    />
                  ) : (
                    <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
                      {userData.address || 'Not provided'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
