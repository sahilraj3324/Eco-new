import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Loader2, Trash2, Plus, Minus, Check, Heart, Star, Package, Truck } from 'lucide-react';

const getVariantForCartItem = (item) => {
  if (!item.product || !item.variantId) return null;
  return (item.product.variants || []).find(
    v => (v.id || v.Id) === item.variantId
  );
};

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRemoving, setIsRemoving] = useState(null);
  const [isClearingCart, setIsClearingCart] = useState(false);
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

  const clearAllCartItems = async () => {
    if (cartItems.length === 0) return;
    
    setIsClearingCart(true);
    try {
      // Delete all cart items for the user
      const deletePromises = cartItems.map(item => 
        fetch(`/api/Cart/${item.id}`, { method: 'DELETE' })
      );
      
      await Promise.all(deletePromises);
      
      // Refresh cart items
      await fetchCartItems();
      
      console.log('Cart cleared successfully');
    } catch (error) {
      console.error('Error clearing cart:', error);
    } finally {
      setIsClearingCart(false);
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

  const handleSellerCheckout = (sellerItems) => {
    navigate('/order', { state: { items: sellerItems, isBulkOrder: true } });
  };

  // Group items by seller
  const groupedBySeller = cartItems.reduce((acc, item) => {
    const sellerId = item.product?.sellerId || item.product?.userId || 'unknown-seller';
    const sellerName = item.product?.sellerName || item.product?.seller?.name || 'Unknown Seller';
    
    if (!acc[sellerId]) {
      acc[sellerId] = {
        sellerId,
        sellerName,
        items: [],
        totalAmount: 0
      };
    }
    
    const variant = getVariantForCartItem(item);
    const price = (variant?.price || variant?.Price || item.product?.price || 0);
    const itemTotal = price * item.quantity;
    
    acc[sellerId].items.push(item);
    acc[sellerId].totalAmount += itemTotal;
    
    return acc;
  }, {});

  const sellers = Object.values(groupedBySeller);

  const totalAmount = cartItems.reduce((sum, item) => {
    const variant = getVariantForCartItem(item);
    const price = (variant?.price || variant?.Price || item.product?.price || 0);
    return sum + price * item.quantity;
  }, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center justify-center">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-white/20">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
                <ShoppingCart className="h-10 w-10 text-white" />
              </div>
              <Loader2 className="absolute -bottom-1 -right-1 h-8 w-8 animate-spin text-blue-500" />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Loading your cart</h3>
              <p className="text-gray-600">Fetching your amazing products...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-white/20 text-center max-w-md">
          <div className="mb-8">
            <div className="relative mx-auto w-24 h-24 mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse"></div>
              <div className="relative bg-white rounded-full p-6 shadow-xl">
                <ShoppingCart className="h-12 w-12 text-gray-400" />
              </div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
              Your Cart is Empty
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Looks like you haven't added anything to your cart yet. Start shopping to discover amazing products!
            </p>
          </div>
          <Link 
            to="/" 
            className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 text-white py-4 px-8 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
          >
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            <span className="font-semibold">Continue Shopping</span>
            <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <ShoppingCart className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-400 to-green-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                  {cartItems.length}
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Your Shopping Cart
                </h1>
                <p className="text-gray-600 mt-1">Ready to checkout your amazing finds</p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 py-3 px-6 rounded-2xl shadow-inner">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ₹{totalAmount}
                </span>
                <p className="text-sm text-gray-600 mt-1">Total Amount</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3 space-y-6">
            {sellers.map((seller, sellerIndex) => (
              <div key={seller.sellerId} className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
                {/* Seller Header */}
                <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl">
                          <span className="text-white font-bold text-xl">
                            {seller.sellerName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{seller.sellerName}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Package className="h-4 w-4 text-white/80" />
                          <span className="text-white/90 text-sm">{seller.items.length} item{seller.items.length > 1 ? 's' : ''}</span>
                          <Star className="h-4 w-4 text-yellow-400 fill-current ml-2" />
                          <span className="text-white/90 text-sm">4.8</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white/80 text-sm">Seller Total</p>
                      <p className="text-3xl font-bold text-white">₹{seller.totalAmount}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Truck className="h-4 w-4 text-green-300" />
                        <span className="text-green-300 text-sm">Free Shipping</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Seller Checkout Button */}
                  <div className="mt-6">
                    <button
                      onClick={() => handleSellerCheckout(seller.items)}
                      className="group w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white py-3 px-6 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 border border-white/20"
                    >
                      <Check className="h-5 w-5 transition-transform group-hover:scale-110" />
                      <span>Checkout All from {seller.sellerName}</span>
                      <div className="ml-auto bg-white/20 px-3 py-1 rounded-full text-sm">
                        {seller.items.length} items
                      </div>
                    </button>
                  </div>
                </div>

                {/* Products */}
                <div className="p-6 space-y-4">
                  {seller.items.map((item, index) => {
                    const variant = getVariantForCartItem(item);
                    return (
                      <div key={item.id} className="group bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200">
                        <div className="flex items-center gap-6">
                          {/* Product Image */}
                          <div className="relative">
                            <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300">
                              <img
                                src={item.product?.mainImage || item.product?.imageUrls?.[0] || '/fallback.png'}
                                alt={item.product?.name}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                            </div>
                            <div className="absolute -top-2 -left-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                              {['✨ New', '🔥 Hot', '⭐ Top'][index % 3]}
                            </div>
                            <button className="absolute -top-2 -right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-red-50 transition-colors group/heart">
                              <Heart className="h-4 w-4 text-gray-400 group-hover/heart:text-red-500 transition-colors" />
                            </button>
                          </div>

                          {/* Product Details */}
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">
                              {item.product?.name}
                            </h3>
                            {variant && (
                              <div className="flex items-center gap-4 mb-2">
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
                                    style={{ backgroundColor: variant.color === 'Black' ? '#000' : variant.color === 'White' ? '#fff' : '#6B7280' }}
                                  ></div>
                                  <span className="text-sm font-medium text-gray-700">{variant.color || variant.Color}</span>
                                </div>
                                {(variant.size || variant.Size) && (
                                  <div className="bg-gradient-to-r from-blue-100 to-purple-100 px-3 py-1 rounded-full">
                                    <span className="text-sm font-medium text-gray-700">Size: {variant.size || variant.Size}</span>
                                  </div>
                                )}
                              </div>
                            )}
                            <p className="text-gray-600 text-sm mb-2">Sold by {seller.sellerName}</p>
                            <div className="flex items-center gap-4">
                              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                ₹{(variant?.price || variant?.Price || item.product?.price)}
                              </span>
                              <span className="text-sm text-gray-500">per pack</span>
                            </div>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex flex-col items-center gap-4">
                            <div className="flex items-center gap-3 bg-white rounded-2xl shadow-lg p-2">
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-r from-red-100 to-pink-100 hover:from-red-200 hover:to-pink-200 text-red-600 transition-all duration-200 shadow-sm hover:shadow-md"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-12 text-center font-bold text-lg bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-r from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 text-green-600 transition-all duration-200 shadow-sm hover:shadow-md"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-gray-500">Subtotal</p>
                              <p className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                ₹{((variant?.price || variant?.Price || item.product?.price || 0) * item.quantity)}
                              </p>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-3">
                            <button
                              onClick={() => handleCheckout(item)}
                              className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-6 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                            >
                              <Check className="h-4 w-4 transition-transform group-hover:scale-110" />
                              Checkout
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm('Are you sure you want to remove this item from your cart?')) {
                                  handleDelete(item.id);
                                }
                              }}
                              className="group bg-gradient-to-r from-red-100 to-pink-100 hover:from-red-200 hover:to-pink-200 text-red-600 py-2 px-4 rounded-xl font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                              disabled={isRemoving === item.id}
                            >
                              {isRemoving === item.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 transition-transform group-hover:scale-110" />
                              )}
                              <span className="text-sm">Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Footer Actions */}
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6">
              <div className="flex justify-between items-center">
                <Link
                  to="/"
                  className="group flex items-center gap-3 text-purple-600 hover:text-purple-800 font-semibold transition-all duration-200"
                >
                  <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                  Continue Shopping
                </Link>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear your entire cart? This action cannot be undone.')) {
                      clearAllCartItems();
                    }
                  }}
                  className="group flex items-center gap-2 text-red-500 hover:text-red-700 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isClearingCart}
                >
                  {isClearingCart ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Trash2 className="h-5 w-5 transition-transform group-hover:scale-110" />
                  )}
                  {isClearingCart ? 'Clearing...' : 'Clear Cart'}
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 sticky top-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  Order Summary
                </h2>
                <p className="text-gray-600">Review your items before checkout</p>
              </div>

              {/* Seller-wise breakdown */}
              <div className="space-y-4 mb-8">
                <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  By Seller
                </h3>
                {sellers.map((seller, index) => (
                  <div key={seller.sellerId} className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-4 shadow-lg border border-gray-100">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-xs">{seller.sellerName.charAt(0)}</span>
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">{seller.sellerName}</span>
                      </div>
                      <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        ₹{seller.totalAmount}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                      <span>{seller.items.length} item{seller.items.length > 1 ? 's' : ''}</span>
                      <div className="flex items-center gap-1">
                        <Truck className="h-3 w-3 text-green-500" />
                        <span className="text-green-600">Free shipping</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSellerCheckout(seller.items)}
                      className="group w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white py-2.5 px-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <Check className="h-4 w-4 transition-transform group-hover:scale-110" />
                      Checkout
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 my-6"></div>

              {/* Overall summary */}
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Subtotal ({cartItems.length} items)
                  </span>
                  <span className="font-semibold text-lg">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Shipping
                  </span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tax (GST)</span>
                  <span className="font-semibold">₹0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-semibold text-green-600">-₹0</span>
                </div>

                <div className="border-t border-gray-200 my-4"></div>

                <div className="flex justify-between text-xl font-bold bg-gradient-to-r from-gray-50 to-white rounded-2xl p-4 shadow-inner">
                  <span>Total</span>
                  <span className="text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    ₹{totalAmount}
                  </span>
                </div>

                {/* Checkout All Button */}
                {sellers.length > 1 && (
                  <button
                    onClick={() => {
                      navigate('/order', { state: { items: cartItems, isBulkOrder: true, allSellers: true } });
                    }}
                    className="group w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center gap-3"
                  >
                    <Check className="h-6 w-6 transition-transform group-hover:scale-110" />
                    <span>Checkout All ({sellers.length} Sellers)</span>
                    <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                )}
              </div>

              {/* Trust Badges */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
                <div className="flex items-center gap-3 text-sm text-green-700">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Secure Checkout</p>
                    <p className="text-xs text-green-600">Protected by SSL encryption</p>
                  </div>
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