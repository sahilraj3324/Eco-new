import React, { useEffect, useState } from "react";
import { Heart, ShoppingCart, Trash2, ArrowRight, Loader2 } from "lucide-react";

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(null);
  const userId = localStorage.getItem("Id") || "dummy-user-123";

  useEffect(() => {
    fetchWishlist();
    // eslint-disable-next-line
  }, [userId]);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/Wishlist/user/${userId}`);
      const data = await res.json();
      setWishlist(data);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (id) => {
    setIsRemoving(id);
    try {
      await fetch(`/api/Wishlist/${id}`, {
        method: "DELETE",
      });
      fetchWishlist();
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    } finally {
      setIsRemoving(null);
    }
  };

  const addToCart = async (item) => {
    setIsAddingToCart(item.id);
    const cartItem = {
      Id: crypto.randomUUID(),
      UserId: userId,
      ProductId: item.product.id,
      Product: item.product,
      Quantity: 1,
      AddedAt: new Date().toISOString(),
    };
    try {
      const res = await fetch("/api/Cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cartItem),
      });
      if (!res.ok) {
        const errorData = await res.json();
        alert("Failed to add to cart: " + (errorData.message || "Unknown error"));
        setIsAddingToCart(null);
        return;
      }
      alert(`Added ${item.product.name} to cart!`);
      // Remove from wishlist after adding to cart
      await fetch(`/api/Wishlist/${item.id}`, { method: "DELETE" });
      fetchWishlist();
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add to cart!");
    } finally {
      setIsAddingToCart(null);
    }
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

        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[40vh]">
            <Loader2 className="h-12 w-12 animate-spin text-pink-500" />
            <p className="mt-4 text-lg font-medium text-gray-600">Loading your wishlist...</p>
          </div>
        ) : wishlist.length === 0 ? (
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
                    disabled={isRemoving === item.id}
                  >
                    {isRemoving === item.id ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Trash2 className="h-5 w-5" />
                    )}
                  </button>
                </div>

                <div className="relative overflow-hidden">
                  <img
                    src={item.product?.mainImage || item.product?.imageUrls?.[0] || "/fallback.png"}
                    alt={item.product?.name}
                    className="w-full h-60 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {item.product?.discount && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                      {item.product.discount}
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-1">
                    <h2 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {item.product?.name}
                    </h2>
                    <div className="flex items-center text-sm text-yellow-500">
                      <span className="mr-1">{item.product?.rating || 0}</span>
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
                      ₹{item.product?.price}
                    </span>
                    {item.product?.originalPrice && (
                      <span className="ml-2 text-sm text-gray-500 line-through">
                        ₹{item.product.originalPrice}
                      </span>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => addToCart(item)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
                      disabled={isAddingToCart === item.id}
                    >
                      {isAddingToCart === item.id ? (
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      ) : (
                        <ShoppingCart className="h-5 w-5 mr-2" />
                      )}
                      {isAddingToCart === item.id ? 'Adding...' : 'Add to Cart'}
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