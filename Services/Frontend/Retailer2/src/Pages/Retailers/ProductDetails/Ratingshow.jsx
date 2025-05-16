// RatingShow.jsx

import React from 'react';
import { Star, StarHalf } from 'lucide-react';

const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;

  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => {
        if (i < fullStars) {
          return <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />;
        } else if (i === fullStars && hasHalfStar) {
          return <StarHalf key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />;
        } else {
          return <Star key={i} className="w-5 h-5 text-gray-300" />;
        }
      })}
    </div>
  );
};

export default StarRating;
