// RatingShow.jsx

import React, { useState, useEffect } from 'react';
import { Star, StarHalf, User, Calendar, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

const StarRating = ({ rating, size = 'w-5 h-5' }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;

  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => {
        if (i < fullStars) {
          return <Star key={i} className={`${size} text-yellow-400 fill-yellow-400`} />;
        } else if (i === fullStars && hasHalfStar) {
          return <StarHalf key={i} className={`${size} text-yellow-400 fill-yellow-400`} />;
        } else {
          return <Star key={i} className={`${size} text-gray-300`} />;
        }
      })}
    </div>
  );
};

const RatingShow = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingBreakdown, setRatingBreakdown] = useState({
    5: 0, 4: 0, 3: 0, 2: 0, 1: 0
  });

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/ReviewRating/product/${productId}`);
      const reviewsData = response.data;
      
      setReviews(reviewsData);
      calculateRatingStats(reviewsData);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const calculateRatingStats = (reviewsData) => {
    if (reviewsData.length === 0) {
      setAverageRating(0);
      setTotalReviews(0);
      setRatingBreakdown({ 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 });
      return;
    }

    const total = reviewsData.length;
    const sum = reviewsData.reduce((acc, review) => acc + review.rating, 0);
    const average = sum / total;

    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewsData.forEach(review => {
      breakdown[review.rating]++;
    });

    setAverageRating(average);
    setTotalReviews(total);
    setRatingBreakdown(breakdown);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const RatingBreakdown = () => (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <h4 className="font-semibold text-gray-800 mb-3">Rating Breakdown</h4>
      {[5, 4, 3, 2, 1].map(rating => {
        const count = ratingBreakdown[rating];
        const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
        
        return (
          <div key={rating} className="flex items-center mb-2">
            <span className="text-sm text-gray-600 w-8">{rating}</span>
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-2" />
            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
              <div 
                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <span className="text-sm text-gray-600 w-8">{count}</span>
          </div>
        );
      })}
    </div>
  );

  const ReviewItem = ({ review }) => (
    <div className="border-b border-gray-200 pb-6 mb-6 last:border-b-0">
      <div className="flex items-start space-x-4">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h5 className="font-medium text-gray-900">
                {review.userId.substring(0, 8)}***
              </h5>
              <div className="flex items-center space-x-2 mt-1">
                <StarRating rating={review.rating} size="w-4 h-4" />
                <span className="text-sm text-gray-600">
                  {review.rating} out of 5 stars
                </span>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="w-4 h-4 mr-1" />
              {formatDate(review.createdAt)}
            </div>
          </div>

          {review.review && (
            <p className="text-gray-700 mb-3 leading-relaxed">
              {review.review}
            </p>
          )}

          {review.images && review.images.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center mb-2">
                <ImageIcon className="w-4 h-4 text-gray-500 mr-1" />
                <span className="text-sm text-gray-600">
                  {review.images.length} photo{review.images.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {review.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Review image ${index + 1}`}
                    className="w-full h-20 object-cover rounded-lg border border-gray-200 hover:opacity-75 cursor-pointer transition-opacity"
                    onError={(e) => {
                      e.target.src = '/placeholder.png';
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="text-center py-8">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Customer Reviews & Ratings
        </h3>
        
        {totalReviews > 0 ? (
          <>
            <div className="flex items-center space-x-4 mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {averageRating.toFixed(1)}
                </div>
                <StarRating rating={averageRating} size="w-6 h-6" />
                <div className="text-sm text-gray-500 mt-1">
                  Based on {totalReviews} review{totalReviews > 1 ? 's' : ''}
                </div>
              </div>
            </div>

            <RatingBreakdown />

            <div className="space-y-6">
              <h4 className="font-semibold text-gray-800 border-b border-gray-200 pb-2">
                All Reviews ({totalReviews})
              </h4>
              {reviews.map((review) => (
                <ReviewItem key={review.id} review={review} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No Reviews Yet
            </h4>
            <p className="text-gray-600">
              Be the first to review this product!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export { StarRating, RatingShow };
export default RatingShow;
