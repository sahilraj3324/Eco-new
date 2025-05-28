import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../Vendor/src/Firebase/firebase';

export default function EditVendor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState({
    storename: '',
    email: '',
    phoneNumber: '',
    address: '',
    gstNumber: '',
    pincode: '',
    hnscode: '',
    profile_picture: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);

  useEffect(() => {
    const fetchVendorData = async () => {
      try {
        setLoading(true);
        const data = await api.seller.getById(id);
        console.log('Fetched vendor data:', data);
        
        // Ensure all required fields are present with proper types
        setVendor({
          ...data,
          // Convert numeric fields to strings for form inputs
          phoneNumber: data.phoneNumber?.toString() || '',
          pincode: data.pincode?.toString() || '',
          hnscode: data.hnscode?.toString() || '',
          // Ensure other fields have fallbacks
          storename: data.storename || '',
          email: data.email || data.Email || '', // Handle possible casing differences
          address: data.address || data.Address || '',
          gstNumber: data.gstNumber || data.GstNumber || '',
          profile_picture: data.profile_picture || '',
          password: '',
          confirmPassword: ''
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching vendor data:', err);
        setError('Failed to load vendor data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchVendorData();
  }, [id]);

  const uploadToFirebase = (file) => {
    return new Promise((resolve, reject) => {
      const imageRef = ref(storage, `profile-pictures/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(imageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setImageUploadProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          reject(error);
        },
        async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  };

  const handleProfileImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file.');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB.');
        return;
      }
      
      setProfileImageFile(file);
      setError(null);
    }
  };

  const uploadProfileImage = async () => {
    if (!profileImageFile) return;

    try {
      setImageUploading(true);
      setImageUploadProgress(0);
      const imageUrl = await uploadToFirebase(profileImageFile);
      
      setVendor(prev => ({ ...prev, profile_picture: imageUrl }));
      setProfileImageFile(null);
      setSuccessMessage('Profile picture uploaded successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image. Please try again.');
    } finally {
      setImageUploading(false);
      setImageUploadProgress(0);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for numeric fields
    if (name === 'phoneNumber' || name === 'pincode' || name === 'hnscode') {
      // Allow only digits in these fields
      const numericValue = value.replace(/\D/g, '');
      setVendor(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setVendor(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError(null);
    setSuccessMessage('');
    
    try {
      // Validate password if provided
      if (vendor.password && vendor.password !== vendor.confirmPassword) {
        setError('Passwords do not match. Please check and try again.');
        setUpdating(false);
        return;
      }

      if (vendor.password && vendor.password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setUpdating(false);
        return;
      }

      // Format the payload to match backend expectations for updateAllFields endpoint
      const payload = {
        storename: vendor.storename,
        Email: vendor.email,
        PhoneNumber: parseInt(vendor.phoneNumber) || null,
        Address: vendor.address,
        GstNumber: vendor.gstNumber,
        pincode: parseInt(vendor.pincode) || null,
        profile_picture: vendor.profile_picture,
        hnscode: vendor.hnscode || null,
        Password: vendor.password || null // Only include password if provided
      };
      
      console.log('Sending payload to updateAllFields API:', payload);
      
      const response = await api.seller.updateAllFields(id, payload);
      console.log('API response:', response);
      
      setSuccessMessage('Vendor details updated successfully!');
      setTimeout(() => navigate(`/vendors/${id}`), 2000); // Navigate back after 2 seconds
    } catch (err) {
      console.error('Error updating vendor:', err);
      console.error('Error response data:', err.response?.data);
      setError(`Failed to update vendor: ${err.response?.data?.message || err.message || 'Unknown error'}`);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-md p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-700 mb-6 text-center">Edit Vendor Details</h1>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-700">
            <p>{error}</p>
          </div>
        )}
        {successMessage && (
          <div className="mb-4 rounded-md bg-green-50 p-4 text-sm text-green-700">
            <p>{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Section - Moved to Top */}
          <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Profile Picture</h3>
            
            {/* Current Profile Picture Display */}
            <div className="flex flex-col items-center mb-4">
              {vendor.profile_picture ? (
                <img 
                  src={vendor.profile_picture} 
                  alt="Current Profile" 
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-lg">
                  <span className="text-gray-500 text-sm">No Image</span>
                </div>
              )}
            </div>

            {/* Upload New Image Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload New Profile Picture
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageUpload}
                  className="w-full p-3 rounded-lg bg-white border border-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
                />
                <p className="text-xs text-gray-500 mt-1">Max file size: 5MB. Supported formats: JPG, PNG, GIF</p>
              </div>

              {/* File Upload Preview and Progress */}
              {profileImageFile && (
                <div className="bg-white rounded-lg p-4 border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-700">Selected: {profileImageFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setProfileImageFile(null)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  
                  {imageUploading && (
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Uploading...</span>
                        <span>{Math.round(imageUploadProgress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-cyan-500 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${imageUploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                  
                  <button
                    type="button"
                    onClick={uploadProfileImage}
                    disabled={imageUploading}
                    className="w-full bg-cyan-500 text-white py-2 px-4 rounded-lg hover:bg-cyan-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {imageUploading ? 'Uploading...' : 'Upload to Firebase'}
                  </button>
                </div>
              )}

              {/* Manual URL Input - Alternative Option */}
              <div className="border-t pt-4">
                <label htmlFor="profile_picture_url" className="block text-sm font-medium text-gray-700 mb-2">
                  Or Enter Image URL Manually
                </label>
                <input
                  type="url"
                  name="profile_picture"
                  id="profile_picture_url"
                  value={vendor.profile_picture || ''}
                  onChange={handleInputChange}
                  className="w-full p-3 rounded-lg bg-white border border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                  placeholder="https://example.com/image.png"
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="storename" className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
            <input
              type="text"
              name="storename"
              id="storename"
              value={vendor.storename || ''}
              onChange={handleInputChange}
              className="p-3 rounded-lg bg-gray-50 w-full border border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={vendor.email || ''}
              onChange={handleInputChange}
              className="p-3 rounded-lg bg-gray-50 w-full border border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                New Password <span className="text-sm text-gray-500">(leave blank to keep current)</span>
              </label>
              <input
                type="password"
                name="password"
                id="password"
                value={vendor.password || ''}
                onChange={handleInputChange}
                className="p-3 rounded-lg bg-gray-50 w-full border border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                placeholder="Enter new password"
                minLength="6"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                value={vendor.confirmPassword || ''}
                onChange={handleInputChange}
                className="p-3 rounded-lg bg-gray-50 w-full border border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
                placeholder="Confirm new password"
                minLength="6"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              id="phoneNumber"
              value={vendor.phoneNumber || ''}
              onChange={handleInputChange}
              className="p-3 rounded-lg bg-gray-50 w-full border border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              name="address"
              id="address"
              value={vendor.address || ''}
              onChange={handleInputChange}
              className="p-3 rounded-lg bg-gray-50 w-full border border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
            <input
              type="text"
              name="pincode"
              id="pincode"
              value={vendor.pincode || ''}
              onChange={handleInputChange}
              className="p-3 rounded-lg bg-gray-50 w-full border border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label htmlFor="gstNumber" className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
            <input
              type="text"
              name="gstNumber"
              id="gstNumber"
              value={vendor.gstNumber || ''}
              onChange={handleInputChange}
              className="p-3 rounded-lg bg-gray-50 w-full border border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label htmlFor="hnscode" className="block text-sm font-medium text-gray-700 mb-1">HSN Code</label>
            <input
              type="text"
              name="hnscode"
              id="hnscode"
              value={vendor.hnscode || ''}
              onChange={handleInputChange}
              className="p-3 rounded-lg bg-gray-50 w-full border border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
              placeholder="Enter HSN Code"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(`/vendors/${id}`)}
              className="w-full sm:w-auto rounded-md bg-gray-200 px-6 py-3 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="w-full sm:w-auto rounded-md bg-cyan-500 px-6 py-3 text-white hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              {updating ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 