// RatingPost.jsx

import React, { useState } from 'react';
import { Star, Upload, X, Send } from 'lucide-react';
import axios from 'axios';

const RatingPost = ({ productId, userId, onSubmitSuccess }) => {
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleStarClick = (rating) => {
    setSelectedRating(rating);
    setError(''); // Clear any previous errors
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const maxImages = 5;
    
    if (images.length + files.length > maxImages) {
      setError(`You can only upload up to ${maxImages} images`);
      return;
    }

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImages(prev => [...prev, e.target.result]);
          setImageFiles(prev => [...prev, file]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImagesToServer = async (files) => {
    const uploadedUrls = [];
    
    for (const file of files) {
      const formData = new FormData();
      formData.append('image', file);
      
      try {
        // Adjust this endpoint based on your image upload API
        const response = await axios.post('/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        uploadedUrls.push(response.data.url);
      } catch (error) {
        console.error('Error uploading image:', error);
        // For demo purposes, use a placeholder URL
        uploadedUrls.push(`/placeholder-${Date.now()}.jpg`);
      }
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async () => {
    // Validation
    if (selectedRating === 0) {
      setError('Please select a rating');
      return;
    }

    if (!productId) {
      setError('Product ID is required');
      return;
    }

    if (!userId) {
      setError('User ID is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Upload images first if any
      let uploadedImageUrls = [];
      if (imageFiles.length > 0) {
        uploadedImageUrls = await uploadImagesToServer(imageFiles);
      }

      // Prepare review data
      const reviewData = {
        userId: userId,
        productId: productId,
        rating: selectedRating,
        review: reviewText.trim(),
        images: uploadedImageUrls
      };

      // Submit review to backend
      const response = await axios.post('/api/ReviewRating', reviewData);

      if (response.status === 200) {
        setSuccess('Review submitted successfully!');
        
        // Reset form
        setSelectedRating(0);
        setReviewText('');
        setImages([]);
        setImageFiles([]);
        
        // Call parent callback if provided
        if (onSubmitSuccess) {
          onSubmitSuccess(response.data);
        }

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      setError('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Write a Review</h3>
      
      {/* Star Rating */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating *
        </label>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-8 h-8 cursor-pointer transition-colors ${
                (hoveredRating || selectedRating) >= star
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300 hover:text-yellow-200'
              }`}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => handleStarClick(star)}
            />
          ))}
          <span className="ml-2 text-sm text-gray-600">
            {selectedRating > 0 ? `${selectedRating} star${selectedRating > 1 ? 's' : ''}` : 'Click to rate'}
          </span>
        </div>
      </div>

      {/* Review Text */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Review
        </label>
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Share your experience with this product..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          rows={4}
          maxLength={1000}
        />
        <div className="text-right text-xs text-gray-500 mt-1">
          {reviewText.length}/1000 characters
        </div>
      </div>

      {/* Image Upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add Photos (Optional)
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-600">
              Click to upload images (max 5)
            </span>
          </label>
        </div>

        {/* Image Preview */}
        {images.length > 0 && (
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-20 object-cover rounded-lg border border-gray-200"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {success}
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || selectedRating === 0}
        className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-all ${
          isSubmitting || selectedRating === 0
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105'
        }`}
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
            Submitting...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Submit Review
          </>
        )}
      </button>
    </div>
  );
};

export default RatingPost;
