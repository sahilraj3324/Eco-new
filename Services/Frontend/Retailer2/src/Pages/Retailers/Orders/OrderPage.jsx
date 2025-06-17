import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle2, Package, CreditCard, MapPin, Star, Shield, Truck, Heart } from 'lucide-react';
import { useAuthContext } from '../../../contexts/AuthContext';
import CashfreePayment from '../../../components/CashfreePayment';
import { api } from '../../../api';

const getVariantForOrderItem = (item) => {
  if (!item.product || !item.variantId) return null;
  return (item.product.variants || []).find(
    v => (v.id || v.Id) === item.variantId
  );
};

const OrderPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuthContext();
  
  // Handle both single item and bulk orders
  const item = location.state?.item;
  const items = location.state?.items;
  const isBulkOrder = location.state?.isBulkOrder;
  const allSellers = location.state?.allSellers;
  const cartItemIds = location.state?.cartItemIds;
  const isFullCartCheckout = location.state?.isFullCartCheckout;

  // Determine what we're working with
  const orderItems = isBulkOrder ? items : (item ? [item] : []);

  // If no item(s) are passed via navigation
  if (!orderItems || orderItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
            No Order Details Found
          </h2>
          <p className="text-gray-600 mb-8">Looks like something went wrong. Let's get you back to your cart.</p>
          <button
            onClick={() => navigate('/cart')}
            className="group bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 text-white py-3 px-8 rounded-2xl font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center gap-3"
          >
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            Back to Cart
          </button>
        </div>
      </div>
    );
  }

  const [shippingAddress, setShippingAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentOrderData, setPaymentOrderData] = useState(null);
  const address = localStorage.getItem('address') || 'dummy-user-123'

  // Calculate totals for all items
  const calculateTotals = () => {
    return orderItems.reduce((acc, currentItem) => {
      const variant = getVariantForOrderItem(currentItem);
      const price = (variant?.price || variant?.Price || currentItem.product?.price || 0);
      const itemTotal = price * currentItem.quantity;
      
      acc.totalAmount += itemTotal;
      acc.totalQuantity += currentItem.quantity;
      return acc;
    }, { totalAmount: 0, totalQuantity: 0 });
  };

  const { totalAmount, totalQuantity } = calculateTotals();

  // Group items by seller for display
  const groupedBySeller = orderItems.reduce((acc, currentItem) => {
    const sellerId = currentItem.product?.sellerId || currentItem.product?.userId || 'unknown-seller';
    const sellerName = currentItem.product?.sellerName || currentItem.product?.seller?.name || 'Unknown Seller';
    
    if (!acc[sellerId]) {
      acc[sellerId] = {
        sellerId,
        sellerName,
        items: [],
        sellerTotal: 0
      };
    }
    
    const variant = getVariantForOrderItem(currentItem);
    const price = (variant?.price || variant?.Price || currentItem.product?.price || 0);
    const itemTotal = price * currentItem.quantity;
    
    acc[sellerId].items.push(currentItem);
    acc[sellerId].sellerTotal += itemTotal;
    
    return acc;
  }, {});

  const sellers = Object.values(groupedBySeller);

  const handlePlaceOrder = async () => {
    if (!address) {
      alert('Please provide a shipping address!');
      return;
    }

    // Debug logging
    console.log('Order details:', {
      isBulkOrder,
      orderItemsLength: orderItems.length,
      orderItems,
      locationState: location.state
    });

    // Production logic: Use Cashfree payment gateway for all orders
    console.log('Using Cashfree payment gateway for order processing');
    
    if (orderItems.length === 1) {
      // Single item order - use Cashfree payment modal
      console.log('Processing single item order via Cashfree');
      const currentItem = orderItems[0];
      const variant = getVariantForOrderItem(currentItem);
      const price = (variant?.price || variant?.Price || currentItem.product?.price || 0);
      
      // Prepare order data for payment
      const orderData = {
        buyerId: auth.user.id,
        productId: currentItem.product.id,
        productName: currentItem.product.name,
        variantId: currentItem.variantId,
        quantity: currentItem.quantity,
        unitPrice: price,
        shippingAddress: address,
        sellerId: currentItem.product.sellerId || currentItem.product.userId,
        customerName: auth.user.storename || auth.user.name || 'Customer',
        customerEmail: auth.user.email || 'customer@example.com',
        customerPhone: auth.user.phoneNumber || auth.user.phone || '9999999999',
        cartItemId: currentItem.cartItemId // Pass cart item ID for deletion
      };
      
      console.log('Single item payment order data:', orderData);
      setPaymentOrderData(orderData);
      setShowPaymentModal(true);
      return;
    } else {
      // Bulk order - create a consolidated Cashfree payment
      console.log('Processing bulk order via Cashfree');
      
      // Calculate total amount for bulk order
      const bulkTotalAmount = orderItems.reduce((total, item) => {
        const variant = getVariantForOrderItem(item);
        const price = (variant?.price || variant?.Price || item.product?.price || 0);
        return total + (price * item.quantity);
      }, 0);
      
      // For bulk orders, we'll create a single payment session for the total amount
      // and then create individual orders on the backend after payment success
      const bulkOrderData = {
        buyerId: auth.user.id,
        isBulkOrder: true,
        totalAmount: bulkTotalAmount,
        orderItems: orderItems.map(item => {
          const variant = getVariantForOrderItem(item);
          const price = (variant?.price || variant?.Price || item.product?.price || 0);
          return {
            productId: item.product.id,
            productName: item.product.name,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: price,
            sellerId: item.product.sellerId || item.product.userId,
            cartItemId: item.cartItemId // Pass cart item ID for deletion
          };
        }),
        shippingAddress: address,
        customerName: auth.user.storename || auth.user.name || 'Customer',
        customerEmail: auth.user.email || 'customer@example.com',
        customerPhone: auth.user.phoneNumber || auth.user.phone || '9999999999',
        cartItemIds: cartItemIds, // Pass cart item IDs for bulk deletion
        isFullCartCheckout: isFullCartCheckout
      };
      
      console.log('Bulk order payment data:', bulkOrderData);
      setPaymentOrderData(bulkOrderData);
      setShowPaymentModal(true);
      return;
    }


  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-xl">
                  {isBulkOrder ? <Package className="h-10 w-10 text-white" /> : <CreditCard className="h-10 w-10 text-white" />}
                </div>
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                  {orderItems.length}
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
              {isBulkOrder ? '🛍️ Bulk Order Checkout' : '🛒 Order Checkout'}
            </h1>
            <p className="text-gray-600 text-lg">
              {isBulkOrder 
                ? `${orderItems.length} amazing items from ${sellers.length} trusted seller${sellers.length > 1 ? 's' : ''}`
                : 'Review your order details and complete your purchase'
              }
            </p>
            
            {/* Progress Indicator */}
            <div className="flex items-center justify-center mt-6 space-x-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">✓</div>
                <span className="ml-2 text-sm font-medium text-gray-700">Cart</span>
              </div>
              <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                <span className="ml-2 text-sm font-medium text-purple-600">Checkout</span>
              </div>
              <div className="h-1 w-12 bg-gray-200 rounded-full"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 font-bold text-sm">3</div>
                <span className="ml-2 text-sm font-medium text-gray-400">Success</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Products Section */}
          <div className="lg:col-span-2 space-y-6">
            {isBulkOrder ? (
              // Bulk Order Display
              <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6 flex items-center gap-3">
                    <Package className="h-6 w-6 text-purple-600" />
                    Order Items ({orderItems.length})
                  </h2>
                  
                  {sellers.map((seller, sellerIndex) => (
                    <div key={seller.sellerId} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6 last:mb-0">
                      {/* Seller Header */}
                      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-4 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-lg">{seller.sellerName.charAt(0).toUpperCase()}</span>
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="h-3 w-3 text-white" />
                              </div>
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-white">{seller.sellerName}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="text-white/90 text-sm">4.8 rating</span>
                                <span className="text-white/70">•</span>
                                <span className="text-white/90 text-sm">{seller.items.length} item{seller.items.length > 1 ? 's' : ''}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white/80 text-sm">Seller Total</p>
                            <p className="text-2xl font-bold text-white">₹{seller.sellerTotal}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Seller Items */}
                      <div className="space-y-4">
                        {seller.items.map((currentItem, index) => {
                          const variant = getVariantForOrderItem(currentItem);
                          const price = (variant?.price || variant?.Price || currentItem.product?.price || 0);
                          return (
                            <div key={index} className="group bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200">
                              <div className="flex items-center gap-4">
                                <div className="relative">
                                  <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg">
                                    <img 
                                      src={currentItem.product?.mainImage || currentItem.product?.imageUrls?.[0] || '/fallback.png'} 
                                      alt={currentItem.product?.name} 
                                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                  </div>
                                  <div className="absolute -top-2 -left-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                                    ✨ Premium
                                  </div>
                                  <button className="absolute -top-2 -right-2 w-6 h-6 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-red-50 transition-colors">
                                    <Heart className="h-3 w-3 text-gray-400 hover:text-red-500 transition-colors" />
                                  </button>
                                </div>
                                
                                <div className="flex-1">
                                  <h4 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-purple-700 transition-colors">
                                    {currentItem.product?.name}
                                  </h4>
                                  {variant && (
                                    <div className="flex items-center gap-3 mb-2">
                                      <div className="flex items-center gap-2">
                                        <div 
                                          className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
                                          style={{ backgroundColor: variant.color === 'Black' ? '#000' : variant.color === 'White' ? '#fff' : '#6B7280' }}
                                        ></div>
                                        <span className="text-sm font-medium text-gray-700">{variant.color || variant.Color}</span>
                                      </div>
                                      {(variant.size || variant.Size) && (
                                        <div className="bg-gradient-to-r from-blue-100 to-purple-100 px-2 py-1 rounded-full">
                                          <span className="text-xs font-medium text-gray-700">Size: {variant.size || variant.Size}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">₹{price}</span>
                                      <span className="text-sm text-gray-500">× {currentItem.quantity}</span>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm text-gray-500">Subtotal</p>
                                      <p className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                        ₹{price * currentItem.quantity}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Single Item Display
              <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 p-6">
                  <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                    <CreditCard className="h-6 w-6" />
                    Your Selected Item
                  </h2>
                  <p className="text-white/90">Ready for checkout</p>
                </div>
                
                <div className="p-8">
                  <div className="flex flex-col lg:flex-row items-center gap-8">
                    <div className="relative">
                      <div className="w-48 h-48 rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-100 to-gray-200">
                        <img 
                          src={orderItems[0].product?.mainImage || orderItems[0].product?.imageUrls?.[0] || '/fallback.png'} 
                          alt={orderItems[0].product?.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -top-3 -left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold px-3 py-2 rounded-2xl shadow-xl">
                        🏆 Bestseller
                      </div>
                      <div className="absolute -bottom-3 -right-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold px-3 py-2 rounded-2xl shadow-xl">
                        ✨ Premium
                      </div>
                    </div>
                    
                    <div className="flex-1 text-center lg:text-left">
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
                        {orderItems[0].product?.name}
                      </h3>
                      {(() => {
                        const variant = getVariantForOrderItem(orderItems[0]);
                        return variant && (
                          <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-6 h-6 rounded-full border-2 border-white shadow-lg"
                                style={{ backgroundColor: variant.color === 'Black' ? '#000' : variant.color === 'White' ? '#fff' : '#6B7280' }}
                              ></div>
                              <span className="font-semibold text-gray-700">{variant.color || variant.Color}</span>
                            </div>
                            {(variant.size || variant.Size) && (
                              <div className="bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full">
                                <span className="font-semibold text-gray-700">Size: {variant.size || variant.Size}</span>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                      <div className="space-y-2 mb-6">
                        <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                          ₹{(() => {
                            const variant = getVariantForOrderItem(orderItems[0]);
                            return (variant?.price || variant?.Price || orderItems[0].product?.price || 0);
                          })()}
                        </div>
                        <div className="bg-gradient-to-r from-gray-100 to-white px-4 py-2 rounded-2xl inline-block">
                          <span className="text-gray-600 font-medium">Quantity: </span>
                          <span className="text-xl font-bold text-purple-600">{orderItems[0].quantity}</span>
                        </div>
                      </div>
                      
                      {/* Product Features */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-xl border border-green-100">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-semibold text-green-700">Quality Assured</span>
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-3 rounded-xl border border-blue-100">
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-blue-600" />
                          
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Back to Cart Button */}
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6">
              <button
                onClick={() => navigate('/cart')}
                className="group flex items-center gap-3 text-purple-600 hover:text-purple-800 font-semibold transition-all duration-200 text-lg"
              >
                <ArrowLeft className="h-6 w-6 transition-transform group-hover:-translate-x-1" />
                Back to Cart
              </button>
            </div>
          </div>

          {/* Order Summary & Address Section */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 sticky top-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                  <CheckCircle2 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                  Order Summary
                </h3>
                <p className="text-gray-600">Review your purchase details</p>
              </div>
              
              {isBulkOrder && (
                <div className="mb-6 space-y-3">
                  <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wider flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    By Seller
                  </h4>
                  {sellers.map((seller, index) => (
                    <div key={seller.sellerId} className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-4 shadow-lg border border-gray-100">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xs">{seller.sellerName.charAt(0)}</span>
                          </div>
                          <span className="font-semibold text-gray-900 text-sm">{seller.sellerName}</span>
                        </div>
                        <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                          ₹{seller.sellerTotal}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 my-4"></div>
                </div>
              )}
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Items ({totalQuantity})
                  </span>
                  <span className="font-semibold text-lg">₹{totalAmount}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tax (GST)</span>
                  <span className="font-semibold">₹0</span>
                </div>
                
                <div className="border-t border-gray-200 my-4"></div>
                <div className="flex justify-between text-xl font-bold bg-gradient-to-r from-gray-50 to-white rounded-2xl p-4 shadow-inner">
                  <span>Total</span>
                  <span className="text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    ₹{totalAmount}
                  </span>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="mb-8">
                <h4 className="font-bold text-gray-700 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Shipping Address
                </h4>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-blue-600 mt-1" />
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap flex-1">{address}</pre>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                className="group relative w-full bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 hover:from-green-700 hover:via-emerald-700 hover:to-green-800 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3 text-lg"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-6 w-6 transition-transform group-hover:scale-110" />
                    <span>{isBulkOrder ? `Place ${orderItems.length} Orders` : 'Place Order'}</span>
                  </>
                )}
                <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              
              {/* Trust Badges */}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 border border-green-100">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-xs font-semibold text-green-700">Secure Payment</span>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-3 border border-blue-100">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-700">Fast Delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cashfree Payment Modal */}
      <CashfreePayment
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        orderData={paymentOrderData}
      />
    </div>
  );
};

export default OrderPage;
