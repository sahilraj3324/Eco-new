import React, { useState, useEffect } from 'react';
import { FiTrash2, FiHeart } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Wishlist = () => {
  // Load wishlist items from localStorage
  const [wishlistItems, setWishlistItems] = useState(() => {
    const stored = localStorage.getItem('wishlistItems');
    return stored ? JSON.parse(stored) : [];
  });

  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('wishlistItems', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const removeFromWishlist = (id) => {
    setWishlistItems(wishlistItems.filter(item => item.id !== id));
  };

  return (
    <div className="font-sans bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white z-50 shadow-sm rounded-b-xl px-4 py-3 flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <FiHeart className="text-pink-500 text-2xl" />
          <h1 className="text-xl font-bold text-gray-800">My Wishlist</h1>
        </div>
      </div>

      <div className="px-4">
        {wishlistItems.length > 0 ? (
          <div className="mb-4 space-y-4">
            {wishlistItems.map(item => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm p-4 flex gap-4">
                <img 
                  src={item.mainImage || item.image} 
                  alt={item.name} 
                  className="w-24 h-24 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                  {item.size && <p className="text-gray-500 text-xs mb-1">Size: {item.size}</p>}
                  {item.color && <p className="text-gray-500 text-xs mb-1">Color: {item.color}</p>}
                  <p className="font-bold text-gray-900 mb-3">₹{item.price}</p>
                  <button 
                    className="w-full mt-2 py-3 bg-red-50 text-red-600 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                    onClick={() => removeFromWishlist(item.id)}
                  >
                    <FiTrash2 /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
            <FiHeart className="text-gray-300 text-5xl mb-4" />
            <p className="text-gray-600 font-medium mb-1">Your wishlist is empty</p>
            <p className="text-gray-400 text-sm">Looks like you haven't added anything to your wishlist yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
