import React, { useState } from "react";
import { Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-react";

const initialWishlist = [
  {
    id: 1,
    title: "Vintage Denim Jacket",
    price: "₹1,299",
    originalPrice: "₹1,999",
    discount: "35% OFF",
    image: "https://via.placeholder.com/300x300?text=Denim+Jacket",
    rating: 4.5,
  },
  {
    id: 2,
    title: "Premium Running Sneakers",
    price: "₹2,499",
    originalPrice: "₹3,299",
    discount: "25% OFF",
    image: "https://via.placeholder.com/300x300?text=Sneakers",
    rating: 4.8,
  },
  {
    id: 3,
    title: "Genuine Leather Backpack",
    price: "₹999",
    originalPrice: "₹1,499",
    discount: "33% OFF",
    image: "https://via.placeholder.com/300x300?text=Backpack",
    rating: 4.2,
  },
];

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState(initialWishlist);

  const removeFromWishlist = (id) => {
    setWishlist(wishlist.filter((item) => item.id !== id));
  };

  const addToCart = (item) => {
    console.log("Adding to cart:", item);
    alert(`Added ${item.title} to cart!`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Heart className="h-8 w-8 text-pink-500 mr-3" fill="currentColor" />
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
          </div>
          <span className="text-gray-600">
            {wishlist.length} {wishlist.length === 1 ? "item" : "items"}
          </span>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-medium text-gray-700 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-gray-500 mb-6">
              Start adding items you love to your wishlist
            </p>
            <button className="bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-6 rounded-lg flex items-center mx-auto">
              Continue Shopping <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden group relative"
              >
                <div className="absolute top-3 right-3 z-10">
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 hover:text-red-500 transition-colors"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                <div className="relative overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-60 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {item.discount && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      {item.discount}
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h2 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {item.title}
                    </h2>
                    <div className="flex items-center text-sm text-yellow-500">
                      <span className="mr-1">{item.rating}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 fill-current"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </div>

                  <div className="flex items-center mb-3">
                    <span className="text-lg font-bold text-gray-900">
                      {item.price}
                    </span>
                    {item.originalPrice && (
                      <span className="ml-2 text-sm text-gray-500 line-through">
                        {item.originalPrice}
                      </span>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => addToCart(item)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Add to Cart
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

export default WishlistPage;