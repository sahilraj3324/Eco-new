import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Home, Loader2, Package, Star, Shield, Trophy, Sparkles, Gift, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuthContext } from '../../../contexts/AuthContext';

const OrderSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthContext();
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
  const [countdown, setCountdown] = useState(10);

  const userId = user?.id || "dummy-user-123";

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
      } else {
        // Clear only the specific items that were ordered
        console.log('Selective clearing - removing specific items:', cartItemIds);
        const deletePromises = cartItemIds.map(cartItemId => 
          fetch(`/api/Cart/${cartItemId}`, { method: 'DELETE' })
        );
        
        await Promise.all(deletePromises);
        console.log('Ordered cart items cleared successfully:', cartItemIds);
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
            
            // Fetch the product to get the current stock of the variant
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
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isClearingCart 
                      ? 'bg-gradient-to-r from-purple-400 to-purple-600' 
                      : 'bg-gray-200'
                  }`}>
                    {isClearingCart ? (
                      <Loader2 className="h-4 w-4 text-white animate-spin" />
                    ) : (
                      <Gift className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <span className={`text-sm font-medium ${
                    isClearingCart ? 'text-purple-600' : 'text-gray-400'
                  }`}>
                    {isClearingCart 
                      ? (isFullCartCheckout ? 'Clearing entire cart...' : 'Removing ordered items...') 
                      : 'Preparing for shipment'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-pink-400/20 to-yellow-400/20 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-green-400/10 to-blue-400/10 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>
      )}

      <div className="max-w-2xl w-full bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden relative">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl">
                  <CheckCircle className="h-14 w-14 text-white" strokeWidth={1.5} />
                </div>
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <Trophy className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">🎉 Order Confirmed!</h1>
            <p className="text-white/90 text-lg font-medium">Your payment was successful</p>
            {isClearingCart && (
              <p className="text-white/70 text-sm mt-2">
                ✨ {isFullCartCheckout ? 'Cart cleared automatically' : 'Ordered items removed from cart'}
              </p>
            )}
          </div>
          
          {/* Floating Icons */}
          <div className="absolute top-4 left-4 opacity-20">
            <Sparkles className="h-8 w-8 text-white animate-spin" />
          </div>
          <div className="absolute top-4 right-4 opacity-20">
            <Star className="h-8 w-8 text-white animate-pulse" />
          </div>
        </div>
        
        <div className="p-8">
          {/* Order Details Card */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Order Details
              </h3>
            </div>
            
            {isBulkOrder ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Items Ordered</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{totalItems}</p>
                </div>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">Sellers</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600">{sellers}</p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Total Amount</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">₹{totalAmount}</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Order ID</span>
                  </div>
                  <p className="text-lg font-mono font-bold text-blue-600 break-all">
                    {orderIds?.[0] || 'N/A'}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">Total Amount</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600">₹{totalAmount}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Stock Update Results */}
          {stockUpdateResults.length > 0 && (
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Inventory Updated</h3>
                    <p className="text-sm text-gray-600">
                      {stockUpdateResults.filter(r => r.status === 'success').length}/{stockUpdateResults.length} items processed successfully
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowStockDetails(!showStockDetails)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  {showStockDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showStockDetails ? 'Hide' : 'Show'} Details
                </button>
              </div>
              
              {showStockDetails && (
                <div className="space-y-3">
                  {stockUpdateResults.map((result, index) => (
                    <div 
                      key={index} 
                      className={`rounded-xl p-4 border transition-all duration-200 ${
                        result.status === 'success' 
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:shadow-md' 
                          : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          result.status === 'success' 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                            : 'bg-gradient-to-r from-red-500 to-pink-600'
                        }`}>
                          {result.status === 'success' ? (
                            <CheckCircle className="h-4 w-4 text-white" />
                          ) : (
                            <Package className="h-4 w-4 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-gray-800">{result.productName}</div>
                          <div className="text-sm text-gray-600">
                            {result.variantColor} - {result.variantSize}
                          </div>
                        </div>
                      </div>
                      {result.status === 'success' ? (
                        <div className="bg-white/50 rounded-lg p-3 text-sm">
                       
                        </div>
                      ) : (
                        <div className="bg-white/50 rounded-lg p-3 text-sm">
                          <span className="text-red-700 font-medium">Error: {result.error}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Success Message */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Thank You for Your Purchase!</h3>
              <p className="text-gray-600 leading-relaxed">
                We've received your order and it's now being processed. You'll receive a confirmation email shortly with all the details and tracking information.
              </p>
              <p className="text-sm text-gray-500 mt-3">
                ✨ {isFullCartCheckout 
                  ? 'Your entire cart has been cleared for your next shopping session.' 
                  : `${cartItemIds?.length || 0} ordered item${(cartItemIds?.length || 0) > 1 ? 's have' : ' has'} been removed from your cart.`
                }
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              className="group flex-1 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 text-white py-4 px-8 rounded-2xl font-bold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center gap-3"
            >
              <Home className="h-6 w-6 transition-transform group-hover:scale-110" />
              <span>Continue Shopping</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
          
          {/* Support Section */}
          <div className="mt-8 text-center">
            <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-100">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Need Help?</span>
              </div>
              <p className="text-sm text-gray-500">
                Our support team is here to help. 
                <a href="/contact" className="text-blue-600 hover:text-blue-800 font-medium transition-colors ml-1">
                  Contact us →
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
