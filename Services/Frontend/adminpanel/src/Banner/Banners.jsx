import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState({ image1: null, image2: null });
  const [previewUrls, setPreviewUrls] = useState({ image1: null, image2: null });
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  // Fetch all banners on component mount
  useEffect(() => {
    fetchBanners();
  }, []);

  // Fetch banners from API
  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/ImageStore');
      setBanners(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching banners:', err);
      setError('Failed to load banners. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e, imageKey) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.match('image.*')) {
      alert('Please select an image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should not exceed 5MB');
      return;
    }

    setSelectedFiles(prev => ({ ...prev, [imageKey]: file }));

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrls(prev => ({ ...prev, [imageKey]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFiles.image1 || !selectedFiles.image2) {
      alert('Please select both banner images');
      return;
    }

    try {
      setUploading(true);
      
      // Convert images to base64
      const image1Base64 = await fileToBase64(selectedFiles.image1);
      const image2Base64 = await fileToBase64(selectedFiles.image2);

      // Prepare data for API
      const bannerData = {
        image1: image1Base64,
        image2: image2Base64,
        description: description
      };

      // Send to API
      await axios.post('/api/ImageStore', bannerData);
      
      // Reset form
      setSelectedFiles({ image1: null, image2: null });
      setPreviewUrls({ image1: null, image2: null });
      setDescription('');
      
      // Refresh banner list
      fetchBanners();
      
      alert('Banners uploaded successfully!');
    } catch (err) {
      console.error('Error uploading banners:', err);
      alert('Failed to upload banners. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Delete banner
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) {
      return;
    }

    try {
      await axios.delete(`/api/ImageStore/${id}`);
      // Update local state to remove deleted banner
      setBanners(banners.filter(banner => banner.id !== id));
      alert('Banner deleted successfully!');
    } catch (err) {
      console.error('Error deleting banner:', err);
      alert('Failed to delete banner. Please try again.');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Banner Management</h1>
        <p className="text-gray-600">Upload and manage website banners</p>
      </div>

      {/* Upload Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload New Banners</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Image 1 Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banner Image 1 (Primary)
              </label>
              <div className="flex items-center justify-center w-full">
                {previewUrls.image1 ? (
                  <div className="relative w-full">
                    <img
                      src={previewUrls.image1}
                      alt="Banner Preview 1"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFiles(prev => ({ ...prev, image1: null }));
                        setPreviewUrls(prev => ({ ...prev, image1: null }));
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 5MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'image1')}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Image 2 Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Banner Image 2 (Secondary)
              </label>
              <div className="flex items-center justify-center w-full">
                {previewUrls.image2 ? (
                  <div className="relative w-full">
                    <img
                      src={previewUrls.image2}
                      alt="Banner Preview 2"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFiles(prev => ({ ...prev, image2: null }));
                        setPreviewUrls(prev => ({ ...prev, image2: null }));
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 5MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'image2')}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Enter banner description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={uploading || !selectedFiles.image1 || !selectedFiles.image2}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              uploading || !selectedFiles.image1 || !selectedFiles.image2
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {uploading ? 'Uploading...' : 'Upload Banners'}
          </button>
        </form>
      </div>

      {/* Banners List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Current Banners</h2>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 p-4 rounded-md text-red-700 mb-4">{error}</div>
        ) : banners.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No banners found. Upload your first banner above.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {banners.map((banner) => (
              <div key={banner.id} className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-2 gap-2 p-2">
                  <img
                    src={banner.image1}
                    alt="Banner 1"
                    className="w-full h-32 object-cover rounded"
                  />
                  <img
                    src={banner.image2}
                    alt="Banner 2"
                    className="w-full h-32 object-cover rounded"
                  />
                </div>
                <div className="p-4 border-t">
                  <p className="text-sm text-gray-600 mb-2">
                    {banner.description || 'No description'}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Created: {new Date(banner.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Banners; 