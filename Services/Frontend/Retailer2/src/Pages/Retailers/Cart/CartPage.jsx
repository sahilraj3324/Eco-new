import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Loader2, Trash2, Plus, Minus, Check } from 'lucide-react';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState(null);
  const navigate = useNavigate();

  const userId = localStorage.getItem('Id') || "dummy-user-123";

  useEffect(() => {
    fetchCartItems();
  }, [userId]);

  const fetchCartItems = async () => {
    try {
      const res = await fetch(`/api/Cart/user/${userId}`);
      const data = await res.json();
      setCartItems(data);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (id, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await fetch(`/api/Cart/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuantity),
      });
      fetchCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleDelete = async (id) => {
    setIsRemoving(id);
    try {
      await fetch(`/api/Cart/${id}`, {
        method: 'DELETE',
      });
      fetchCartItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    } finally {
      setIsRemoving(null);
    }
  };

  const handleCheckout = (item) => {
    navigate('/order', { state: { item } });
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        <p className="mt-4 text-lg font-medium text-gray-600">Loading your cart...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="bg-blue-100 p-6 rounded-full mb-6">
          <ShoppingCart className="h-16 w-16 text-blue-500" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Your Cart is Empty</h2>
        <p className="text-gray-600 mb-6 max-w-md">
          Looks like you haven't added anything to your cart yet. Start shopping to discover amazing products!
        </p>
        <Link 
          to="/" 
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <ArrowLeft className="h-5 w-5" />
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="h-8 w-8 text-blue-600" />
            Your Shopping Cart
          </h1>
          <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-sm font-medium shadow-inner">
            {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="hidden md:grid grid-cols-12 bg-gradient-to-r from-blue-50 to-blue-100 p-4 text-sm font-medium text-gray-700 uppercase tracking-wider">
                <div className="col-span-5">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {cartItems.map((item) => (
                <div key={item.id} className="group p-4 border-b border-gray-200 last:border-b-0 hover:bg-blue-50/50 transition-colors">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-5 flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={item.product?.mainImage || item.product?.imageUrls?.[0] || '/fallback.png'}
                          alt={item.product?.name}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200 group-hover:border-blue-200 transition-colors"
                        />
                        <span className="absolute -top-2 -left-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-md">
                          {['New', 'Popular', 'Limited'][item.id % 3]}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 line-clamp-1 group-hover:text-blue-700 transition-colors">
                          {item.product?.name}
                        </h3>
                        <p className="text-sm text-gray-500">Sold by Wholesaler</p>
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          ₹{item.product?.price} / pack
                        </p>
                        <p className="md:hidden text-sm font-semibold mt-1">
                          Subtotal: ₹{(item.product?.price || 0) * item.quantity}
                        </p>
                      </div>
                    </div>

                    <div className="md:col-span-2 text-center hidden md:block">
                      <span className="font-medium">₹{item.product?.price}</span>
                    </div>

                    <div className="md:col-span-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors shadow-sm"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-10 text-center font-medium bg-white border border-gray-200 rounded-md py-1 shadow-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors shadow-sm"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="md:col-span-2 flex items-center justify-end gap-4">
                      <button
                        onClick={() => handleCheckout(item)}
                        className="hidden md:flex items-center gap-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        <Check className="h-4 w-4" />
                        Checkout
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to remove this item from your cart?')) {
                            handleDelete(item.id);
                          }
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        disabled={isRemoving === item.id}
                      >
                        {isRemoving === item.id ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <Trash2 className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 md:hidden flex gap-2">
                    <button
                      onClick={() => handleCheckout(item)}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Checkout
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to remove this item from your cart?')) {
                          handleDelete(item.id);
                        }
                      }}
                      className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                      disabled={isRemoving === item.id}
                    >
                      {isRemoving === item.id ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Trash2 className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between items-center">
              <Link
                to="/"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
                Continue Shopping
              </Link>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear your entire cart?')) {
                    // Implement clear cart functionality here
                  }
                }}
                className="text-red-500 hover:text-red-700 font-medium transition-colors flex items-center gap-1"
              >
                <Trash2 className="h-5 w-5" />
                Clear Cart
              </button>
            </div>
          </div>

          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
                  <span className="font-medium">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">FREE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (GST)</span>
                  <span className="font-medium">₹0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-medium text-green-600">-₹0</span>
                </div>

                <div className="border-t border-gray-200 my-4"></div>

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">₹{totalAmount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;