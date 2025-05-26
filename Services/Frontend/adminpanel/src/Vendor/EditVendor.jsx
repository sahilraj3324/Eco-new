import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

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
    profile_picture: '',
    // hnscode is not in the provided Seller.cs model, omitting for now
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

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
          // Ensure other fields have fallbacks
          storename: data.storename || '',
          email: data.email || data.Email || '', // Handle possible casing differences
          address: data.address || data.Address || '',
          gstNumber: data.gstNumber || data.GstNumber || '',
          profile_picture: data.profile_picture || ''
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for numeric fields
    if (name === 'phoneNumber' || name === 'pincode') {
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
      // Format the payload to match backend expectations exactly
      // Note: matching the casing from Seller.cs model
      const payload = {
        Id: id,
        storename: vendor.storename, // lowercase as in the model
        Email: vendor.email, // uppercase E as in the model
        PhoneNumber: parseInt(vendor.phoneNumber) || 0, // Convert to number
        Address: vendor.address,
        GstNumber: vendor.gstNumber,
        pincode: parseInt(vendor.pincode) || 0, // Convert to number
        profile_picture: vendor.profile_picture,
        // Keep any other fields that might be in the original vendor object
        ...vendor,
        // But override with our formatted values
        id: id // Include both Id and id to be safe
      };
      
      console.log('Sending payload to API:', payload);
      
      const response = await api.seller.update(id, payload);
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
            <label htmlFor="profile_picture" className="block text-sm font-medium text-gray-700 mb-1">Profile Picture URL</label>
            <input
              type="url"
              name="profile_picture"
              id="profile_picture"
              value={vendor.profile_picture || ''}
              onChange={handleInputChange}
              className="p-3 rounded-lg bg-gray-50 w-full border border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
              placeholder="https://example.com/image.png"
            />
            {vendor.profile_picture && (
                <img src={vendor.profile_picture} alt="Profile Preview" className="mt-2 rounded-md h-32 w-32 object-cover" />
            )}
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