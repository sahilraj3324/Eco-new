// RatingPost.jsx

import React, { useState } from 'react';
import { Star } from 'lucide-react';

const RatingPost = ({ onSubmit }) => {
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleClick = (rating) => {
    setSelectedRating(rating);
    if (onSubmit) onSubmit(rating); // Call the parent function if provided
  };

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-6 h-6 cursor-pointer transition-colors ${
            (hoveredRating || selectedRating) >= star
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-gray-300'
          }`}
          onMouseEnter={() => setHoveredRating(star)}
          onMouseLeave={() => setHoveredRating(0)}
          onClick={() => handleClick(star)}
        />
      ))}
    </div>
  );
};

export default RatingPost;
