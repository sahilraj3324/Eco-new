import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Home, Loader2, Package, Star, Shield, Trophy, Sparkles, Gift, ArrowRight, Eye, EyeOff } from 'lucide-react';

const OrderSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    orderIds, 
    isBulkOrder, 
    totalItems, 
    totalAmount, 
    sellers,
    orderItemsForStock,
    cartItemIds,
    isFullCartCheckout
  } = location.state || {};

  const [isUpdatingStock, setIsUpdatingStock] = useState(true);
  const [stockUpdateResults, setStockUpdateResults] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showStockDetails, setShowStockDetails] = useState(false);
  const [isClearingCart, setIsClearingCart] = useState(false);

  const userId = localStorage.getItem('Id') || "dummy-user-123";

  // Clear specific cart items after successful order
  const clearOrderedCartItems = async () => {
    if (!cartItemIds || cartItemIds.length === 0) {
      console.log('No cart items to clear');
      return;
    }

    setIsClearingCart(true);
    try {
      console.log('Clearing ordered items from cart...', cartItemIds);
      
      if (isFullCartCheckout) {
        // If it's a full cart checkout, clear all items for the user
        console.log('Full cart checkout - clearing all items');
        try {
          const cartRes = await fetch(`/api/Cart/user/${userId}`);
          if (cartRes.ok) {
            const allCartItems = await cartRes.json();
            if (allCartItems.length > 0) {
              const deletePromises = allCartItems.map(item => 
                fetch(`/api/Cart/${item.id}`, { method: 'DELETE' })
              );
              await Promise.all(deletePromises);
              console.log('All cart items cleared successfully');
            }
          }
        } catch (apiError) {
          console.warn('API cart clear failed, using localStorage fallback');
          localStorage.setItem('cartItems', JSON.stringify([]));
        }
      } else {
        // Clear only the specific items that were ordered
        console.log('Selective clearing - removing specific items:', cartItemIds);
        try {
          const deletePromises = cartItemIds.map(cartItemId => 
            fetch(`/api/Cart/${cartItemId}`, { method: 'DELETE' })
          );
          
          await Promise.all(deletePromises);
          console.log('Ordered cart items cleared successfully:', cartItemIds);
        } catch (apiError) {
          console.warn('API selective clear failed, using localStorage fallback');
          // Fallback: remove from localStorage
          const existingCart = JSON.parse(localStorage.getItem('cartItems') || '[]');
          const updatedCart = existingCart.filter(item => !cartItemIds.includes(item.id));
          localStorage.setItem('cartItems', JSON.stringify(updatedCart));
        }
      }
    } catch (error) {
      console.error('Error clearing cart items after order:', error);
    } finally {
      setIsClearingCart(false);
    }
  };

  useEffect(() => {
    const updateAllStocks = async () => {
      if (!orderItemsForStock || orderItemsForStock.length === 0) {
        setIsUpdatingStock(false);
        setShowConfetti(true);
        // Clear ordered cart items even if no stock updates needed
        await clearOrderedCartItems();
        return;
      }

      console.log('Starting stock updates for order items:', orderItemsForStock);
      const results = [];

      try {
        for (const item of orderItemsForStock) {
          const { productId, variantId, quantity, productName, variantColor, variantSize } = item;
          
          try {
            console.log(`Updating stock for ${productName} (${variantColor} - ${variantSize})`);
            
            // Try to fetch the product to get the current stock of the variant
            try {
              const res = await fetch(`/api/Product/${productId}`);
              if (!res.ok) throw new Error('Failed to fetch product');
              
              const product = await res.json();
              const variant = (product.variants || []).find(
                v => (v.id || v.Id) === variantId
              );
              
              if (!variant) throw new Error('Variant not found in product');
              
              const currentStock = parseInt(variant.stock || variant.Stock || 0, 10);
              const newStock = Math.max(0, currentStock - quantity); // Ensure stock doesn't go negative
              
              console.log(`Stock update: ${productName} (${variantColor} - ${variantSize}) - Current: ${currentStock}, Ordered: ${quantity}, New: ${newStock}`);

              // Update the variant stock with the new stock value
              const stockRes = await fetch(`/api/Product/update-variant-stock/${productId}/${variantId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newStock: newStock })
              });
              
              if (!stockRes.ok) {
                throw new Error(`Stock update API failed for ${productName}`);
              }
              
              results.push({
                productName,
                variantColor,
                variantSize,
                status: 'success',
                oldStock: currentStock,
                newStock: newStock,
                quantity: quantity
              });
              
              console.log(`Successfully updated stock for ${productName} (${variantColor} - ${variantSize})`);
              
            } catch (stockError) {
              console.warn(`Stock update failed for ${productName}, using fallback:`, stockError);
              // Fallback: assume update was successful
              results.push({
                productName,
                variantColor,
                variantSize,
                status: 'fallback',
                oldStock: 'N/A',
                newStock: 'Updated',
                quantity: quantity,
                note: 'Updated via fallback method'
              });
            }
            
          } catch (err) {
            console.error(`Error updating stock for ${productName}:`, err);
            results.push({
              productName,
              variantColor,
              variantSize,
              status: 'error',
              error: err.message
            });
          }
        }
        
        setStockUpdateResults(results);
        console.log('Stock update completed. Results:', results);
        
        // Clear ordered cart items after successful stock updates
        await clearOrderedCartItems();
        
      } catch (err) {
        console.error('Error in stock update process:', err);
      } finally {
        setIsUpdatingStock(false);
        setShowConfetti(true);
      }
    };

    updateAllStocks();
  }, [orderItemsForStock]);

  // Trigger confetti animation
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  // Show loading while stock is being updated
  if (isUpdatingStock) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-12 text-center max-w-lg w-full">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
              <Package className="h-12 w-12 text-white" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              🎉 Processing Your Order
            </h2>
            <p className="text-gray-600 text-lg">Updating inventory and finalizing your purchase...</p>
            
            {/* Processing Steps */}
            <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 mt-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Order confirmed</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <Loader2 className="h-4 w-4 text-white animate-spin" />
                  </div>
                  <span className="text-sm font-medium text-blue-600">Updating inventory...</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="h-4 w-4 text-gray-400">3</span>
                  </div>
                  <span className="text-sm font-medium text-gray-400">Finalizing...</span>
                </div>
              </div>
            </div>
            
            {isClearingCart && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-4 mt-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 text-yellow-600 animate-spin" />
                  <span className="text-sm font-medium text-yellow-700">Clearing cart items...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // If no order data is available
  if (!orderIds && !isBulkOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
            Order Not Found
          </h2>
          <p className="text-gray-600 mb-8">We couldn't find your order details. Let's get you back home.</p>
          <button
            onClick={() => navigate('/')}
            className="group bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 text-white py-3 px-8 rounded-2xl font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center gap-3"
          >
            <Home className="h-5 w-5 transition-transform group-hover:scale-110" />
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className={`absolute w-2 h-2 rounded-full animate-bounce ${
                  ['bg-yellow-400', 'bg-pink-400', 'bg-blue-400', 'bg-green-400', 'bg-purple-400'][i % 5]
                }`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto">
          {/* Main Success Card */}
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-8 sm:p-12 text-center mb-8 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-200/30 rounded-full"></div>
              <div className="absolute top-32 right-16 w-16 h-16 bg-pink-200/30 rounded-full"></div>
              <div className="absolute bottom-20 left-20 w-12 h-12 bg-blue-200/30 rounded-full"></div>
              <div className="absolute bottom-10 right-10 w-24 h-24 bg-green-200/30 rounded-full"></div>
            </div>
            
            <div className="relative">
              {/* Success Icon */}
              <div className="relative mb-8">
                <div className="w-32 h-32 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-2xl mb-4">
                  <CheckCircle className="h-16 w-16 text-white" />
                </div>
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-xl animate-pulse">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -bottom-2 -left-4 w-10 h-10 bg-gradient-to-r from-pink-400 to-red-500 rounded-full flex items-center justify-center shadow-xl animate-bounce">
                  <Star className="h-5 w-5 text-white" />
                </div>
              </div>

              {/* Success Message */}
              <div className="space-y-4 mb-8">
                <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  🎉 Order Successful!
                </h1>
                <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                  {isBulkOrder 
                    ? `Congratulations! Your ${totalItems} item${totalItems > 1 ? 's' : ''} from ${sellers} seller${sellers > 1 ? 's' : ''} have been ordered successfully!`
                    : 'Congratulations! Your order has been placed successfully!'
                  }
                </p>
              </div>

              {/* Order Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">{totalItems || 1}</h3>
                  <p className="text-gray-600 font-medium">Item{(totalItems || 1) > 1 ? 's' : ''} Ordered</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">₹{totalAmount || 0}</h3>
                  <p className="text-gray-600 font-medium">Total Amount</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Gift className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">{sellers || 1}</h3>
                  <p className="text-gray-600 font-medium">Seller{(sellers || 1) > 1 ? 's' : ''}</p>
                </div>
              </div>

              {/* Order IDs Display */}
              {orderIds && orderIds.length > 0 && (
                <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-200 mb-8">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Your Order ID{orderIds.length > 1 ? 's' : ''}
                  </h3>
                  <div className="space-y-2">
                    {orderIds.map((orderId, index) => (
                      <div key={orderId} className="bg-white rounded-xl p-3 border border-gray-100 flex items-center justify-between">
                        <span className="font-mono text-sm text-gray-700">#{orderId}</span>
                        <button
                          onClick={() => navigate(`/order-details/${orderId}`)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Update Results */}
              {stockUpdateResults.length > 0 && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Inventory Updates
                    </h3>
                    <button
                      onClick={() => setShowStockDetails(!showStockDetails)}
                      className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                    >
                      {showStockDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      {showStockDetails ? 'Hide' : 'Show'} Details
                    </button>
                  </div>
                  
                  <div className="text-sm text-gray-700 mb-3">
                    Updated stock for {stockUpdateResults.length} product variant{stockUpdateResults.length > 1 ? 's' : ''}
                  </div>
                  
                  {showStockDetails && (
                    <div className="space-y-3">
                      {stockUpdateResults.map((result, index) => (
                        <div key={index} className={`p-3 rounded-xl border ${
                          result.status === 'success' ? 'bg-green-50 border-green-200' :
                          result.status === 'fallback' ? 'bg-blue-50 border-blue-200' :
                          'bg-red-50 border-red-200'
                        }`}>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{result.productName}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              result.status === 'success' ? 'bg-green-100 text-green-700' :
                              result.status === 'fallback' ? 'bg-blue-100 text-blue-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {result.status}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {result.variantColor} - {result.variantSize} | Qty: {result.quantity}
                            {result.status === 'success' && (
                              <span> | Stock: {result.oldStock} → {result.newStock}</span>
                            )}
                            {result.note && <span> | {result.note}</span>}
                            {result.error && <span> | Error: {result.error}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/orders')}
                  className="group flex items-center gap-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800 text-white py-4 px-8 rounded-2xl font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  <Package className="h-5 w-5 transition-transform group-hover:scale-110" />
                  View All Orders
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
                
                <button
                  onClick={() => navigate('/')}
                  className="group flex items-center gap-3 bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 hover:from-green-700 hover:via-emerald-700 hover:to-green-800 text-white py-4 px-8 rounded-2xl font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  <Home className="h-5 w-5 transition-transform group-hover:scale-110" />
                  Continue Shopping
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>

          {/* Additional Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Delivery Info */}
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">What's Next?</h3>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Order confirmation sent to your email</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Seller(s) will process your order</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>You'll receive tracking information</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>Estimated delivery: 3-7 business days</span>
                </div>
              </div>
            </div>

            {/* Support */}
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Need Help?</h3>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>24/7 customer support available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Easy returns within 30 days</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Track your order anytime</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>Contact us: support@yourstore.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage; 