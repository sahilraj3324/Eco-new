import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

const getVariantForOrderItem = (item) => {
  if (!item.product || !item.variantId) return null;
  return (item.product.variants || []).find(
    v => (v.id || v.Id) === item.variantId
  );
};

const OrderPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Handle both single item and bulk orders
  const item = location.state?.item;
  const items = location.state?.items;
  const isBulkOrder = location.state?.isBulkOrder;
  const allSellers = location.state?.allSellers;

  // Determine what we're working with
  const orderItems = isBulkOrder ? items : (item ? [item] : []);

  // If no item(s) are passed via navigation
  if (!orderItems || orderItems.length === 0) {
    return (
      <div className="text-center mt-10">
        <h2 className="text-2xl font-bold">No Order Details Found</h2>
        <button
          onClick={() => navigate('/cart')}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          <ArrowLeft className="inline-block mr-2 w-4 h-4" /> Back to Cart
        </button>
      </div>
    );
  }

  const [shippingAddress, setShippingAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
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

    setIsProcessing(true);
    
    try {
      const orderPromises = orderItems.map(async (currentItem) => {
        const variant = getVariantForOrderItem(currentItem);
        const price = (variant?.price || variant?.Price || currentItem.product?.price || 0);
        
        const order = {
          buyerId: localStorage.getItem('Id') || 'dummy-user-123',
          productId: currentItem.product.id,
          product: currentItem.product,
          variantId: currentItem.variantId,
          variant: variant,
          quantity: currentItem.quantity,
          unitPrice: price,
          sellerId: currentItem.product.sellerId || currentItem.product.userId,
          status: 'Pending',
          orderDate: new Date().toISOString(),
          processedAt: null,
          shippingAddress: address,
          isBulkOrder: isBulkOrder,
          orderType: isBulkOrder ? (allSellers ? 'multi-seller' : 'single-seller') : 'single-item'
        };

        const response = await fetch('/api/order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(order),
        });

        if (!response.ok) {
          throw new Error(`Failed to place order for ${currentItem.product.name}`);
        }

        return await response.json();
      });

      const orderResults = await Promise.all(orderPromises);

      // Navigate to success page with bulk order info
      navigate('/ordersuccess', { 
        state: { 
          orderIds: orderResults.map(r => r.id),
          isBulkOrder: isBulkOrder,
          totalItems: orderItems.length,
          totalAmount: totalAmount,
          sellers: sellers.length
        } 
      });

    } catch (error) {
      console.error('Error placing order:', error);
      alert(`Failed to place order. Please try again! Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 py-10 px-2">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isBulkOrder ? 'Bulk Order Checkout' : 'Order Checkout'}
          </h1>
          <p className="text-gray-600">
            {isBulkOrder 
              ? `${orderItems.length} items from ${sellers.length} seller${sellers.length > 1 ? 's' : ''}`
              : 'Review your order details'
            }
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Products Section */}
            <div className="flex-1">
              {isBulkOrder ? (
                // Bulk Order Display
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
                  {sellers.map((seller) => (
                    <div key={seller.sellerId} className="border border-gray-200 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">{seller.sellerName}</h3>
                        <span className="text-lg font-bold text-indigo-600">₹{seller.sellerTotal}</span>
                      </div>
                      
                      <div className="space-y-4">
                        {seller.items.map((currentItem, index) => {
                          const variant = getVariantForOrderItem(currentItem);
                          const price = (variant?.price || variant?.Price || currentItem.product?.price || 0);
                          return (
                            <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                              <img 
                                src={currentItem.product?.mainImage || currentItem.product?.imageUrls?.[0] || '/fallback.png'} 
                                alt={currentItem.product?.name} 
                                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                              />
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{currentItem.product?.name}</h4>
                                {variant && (
                                  <div className="text-xs text-gray-500">
                                    Color: <span className="font-semibold">{variant.color || variant.Color}</span>
                                    {(variant.size || variant.Size) ? (
                                      <> | Size: <span className="font-semibold">{variant.size || variant.Size}</span></>
                                    ) : null}
                                  </div>
                                )}
                                <div className="flex items-center gap-4 mt-1">
                                  <span className="text-sm text-gray-600">₹{price} × {currentItem.quantity}</span>
                                  <span className="font-semibold">₹{price * currentItem.quantity}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Single Item Display
                <div className="flex flex-col items-center lg:items-start gap-4">
                  <div className="bg-gradient-to-br from-blue-100 to-pink-100 p-6 rounded-xl shadow-md w-full max-w-md flex flex-col items-center">
                    <img 
                      src={orderItems[0].product?.mainImage || orderItems[0].product?.imageUrls?.[0] || '/fallback.png'} 
                      alt={orderItems[0].product?.name} 
                      className="w-32 h-32 object-cover rounded-lg border border-gray-200 mb-4"
                    />
                    <h2 className="text-lg font-bold text-gray-800 text-center">{orderItems[0].product?.name}</h2>
                    {(() => {
                      const variant = getVariantForOrderItem(orderItems[0]);
                      return variant && (
                        <div className="text-xs text-gray-500 mt-1 text-center">
                          Color: <span className="font-semibold">{variant.color || variant.Color}</span>
                          {(variant.size || variant.Size) ? (
                            <> | Size: <span className="font-semibold">{variant.size || variant.Size}</span></>
                          ) : null}
                        </div>
                      );
                    })()}
                    <span className="text-blue-600 font-semibold text-base mt-2">₹{(() => {
                      const variant = getVariantForOrderItem(orderItems[0]);
                      return (variant?.price || variant?.Price || orderItems[0].product?.price || 0);
                    })()}</span>
                    <span className="text-gray-500 text-sm">Quantity: {orderItems[0].quantity}</span>
                  </div>
                </div>
              )}
              
              <button
                onClick={() => navigate('/cart')}
                className="mt-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                <ArrowLeft className="h-5 w-5" /> Back to Cart
              </button>
            </div>

            {/* Order Summary & Address Section */}
            <div className="lg:w-96">
              {/* Order Summary */}
              <div className="mb-6 bg-gray-50 rounded-xl p-5 shadow-sm">
                <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" /> Order Summary
                </h3>
                
                {isBulkOrder && (
                  <div className="mb-4 space-y-2">
                    {sellers.map((seller) => (
                      <div key={seller.sellerId} className="flex justify-between text-sm">
                        <span className="text-gray-600">{seller.sellerName}</span>
                        <span className="font-medium">₹{seller.sellerTotal}</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 my-2"></div>
                  </div>
                )}
                
                <div className="flex justify-between text-gray-700 mb-1">
                  <span>Items ({totalQuantity})</span>
                  <span>₹{totalAmount}</span>
                </div>
                <div className="flex justify-between text-gray-700 mb-1">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
                <div className="border-t border-gray-200 my-2"></div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">₹{totalAmount}</span>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 text-gray-700">Shipping Address</label>
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">{address}</pre>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                className="w-full bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 shadow-md transition-all text-lg disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5" /> 
                    {isBulkOrder ? `Place ${orderItems.length} Orders` : 'Place Order'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
