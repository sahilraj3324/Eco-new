import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, User, MapPin, Calendar, CreditCard, Truck, Phone, Mail, ShoppingBag, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';

const OrderDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(location.state?.order);

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">No order details were provided.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleCancelOrder = async () => {
    if (order.status === 'Cancelled') return;
    setLoading(true);
    setMessage('');
    
    try {
      console.log('Starting order cancellation process...', {
        orderId: order.id,
        productId: order.productId,
        variantId: order.variantId,
        quantity: order.quantity
      });

      // 1. Update order status to Cancelled
      const statusRes = await fetch(`/api/Order/${order.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify('Cancelled'),
      });
      
      if (!statusRes.ok) {
        const errorData = await statusRes.json();
        throw new Error(`Failed to update order status: ${errorData.message || statusRes.statusText}`);
      }
      
      console.log('Order status updated to Cancelled');

      // 2. Re-add quantity to variant stock
      const productRes = await fetch(`/api/Product/${order.productId}`);
      if (!productRes.ok) {
        throw new Error(`Failed to fetch product: ${productRes.statusText}`);
      }
      
      const product = await productRes.json();
      console.log('Product fetched:', product.name);
      
      const variant = (product.variants || []).find(v => (v.id || v.Id) === order.variantId);
      if (!variant) {
        throw new Error(`Variant not found for ID: ${order.variantId}`);
      }
      
      const currentStock = parseInt(variant.stock || variant.Stock || 0, 10);
      const orderQuantity = parseInt(order.quantity, 10);
      const newStock = currentStock + orderQuantity;
      
      console.log('Stock calculation:', {
        currentStock,
        orderQuantity,
        newStock,
        variantColor: variant.color || variant.Color,
        variantSize: variant.size || variant.Size
      });

      const stockRes = await fetch(`/api/Product/update-variant-stock/${order.productId}/${order.variantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newStock: newStock })
      });
      
      if (!stockRes.ok) {
        const errorData = await stockRes.json();
        throw new Error(`Failed to update stock: ${errorData.message || stockRes.statusText}`);
      }
      
      console.log('Stock updated successfully');
      
      // Update local order state
      setOrder({ ...order, status: 'Cancelled' });
      setMessage(`Order cancelled successfully! Stock restored: ${orderQuantity} units added back to ${variant.color || variant.Color} - ${variant.size || variant.Size}`);
      
    } catch (err) {
      console.error('Error cancelling order:', err);
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      'Pending': { 
        bg: 'bg-gradient-to-r from-yellow-400 to-orange-400', 
        text: 'text-white', 
        icon: Clock,
        ring: 'ring-yellow-200'
      },
      'Processed': { 
        bg: 'bg-gradient-to-r from-blue-500 to-blue-600', 
        text: 'text-white', 
        icon: Package,
        ring: 'ring-blue-200'
      },
      'Shipped': { 
        bg: 'bg-gradient-to-r from-purple-500 to-purple-600', 
        text: 'text-white', 
        icon: Truck,
        ring: 'ring-purple-200'
      },
      'Delivered': { 
        bg: 'bg-gradient-to-r from-green-500 to-green-600', 
        text: 'text-white', 
        icon: CheckCircle,
        ring: 'ring-green-200'
      },
      'Cancelled': { 
        bg: 'bg-gradient-to-r from-red-500 to-red-600', 
        text: 'text-white', 
        icon: XCircle,
        ring: 'ring-red-200'
      }
    };
    return configs[status] || configs['Pending'];
  };

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
          >
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Orders</span>
          </button>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Details</h1>
                <p className="text-gray-600 text-lg">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Placed on {order.orderDate ? new Date(order.orderDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'N/A'}
                </p>
              </div>
              <div className="mt-6 sm:mt-0">
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${statusConfig.bg} ${statusConfig.text} ring-4 ${statusConfig.ring} shadow-lg`}>
                  <StatusIcon className="w-4 h-4 mr-2" />
                  {order.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Product Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <ShoppingBag className="h-6 w-6 mr-3" />
                  Product Information
                </h2>
              </div>
              
              <div className="p-8">
                <div className="flex items-start space-x-6">
                  <div className="relative">
                    <img
                      src={order.product?.mainImage || '/placeholder.png'}
                      alt={order.product?.name}
                      className="w-32 h-32 object-cover rounded-xl border shadow-md"
                      onError={(e) => e.target.src = '/placeholder.png'}
                    />
                    <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                      Qty: {order.quantity}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{order.product?.name}</h3>
                    
                    {order.variant && (
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg">
                          <span className="text-sm font-medium text-gray-700">Color:</span>
                          <span className="ml-2 font-semibold text-gray-900">{order.variant?.color}</span>
                        </div>
                        {order.variant?.size && (
                          <div className="flex items-center bg-gray-100 px-3 py-2 rounded-lg">
                            <span className="text-sm font-medium text-gray-700">Size:</span>
                            <span className="ml-2 font-semibold text-gray-900">{order.variant?.size}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="text-gray-600">Unit Price</span>
                        <p className="text-xl font-bold text-green-600">₹{order.unitPrice}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="text-gray-600">Total Amount</span>
                        <p className="text-xl font-bold text-blue-600">₹{order.unitPrice * order.quantity}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <span className="text-gray-600">Quantity</span>
                        <p className="text-xl font-bold text-yellow-500">{order.quantity}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <User className="h-6 w-6 mr-3" />
                  Customer Information
                </h2>
              </div>
              
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">                  
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-4 text-lg">Shipping Address</h3>
                    <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                      <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">{order.shippingAddress || 'Address not provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Order Actions */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">Order Actions</h3>
              </div>
              
              <div className="p-6 space-y-4">
                <button
                  onClick={() => navigate(-1)}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors font-medium flex items-center justify-center"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back to Orders
                </button>
                
                {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                  <button
                    onClick={handleCancelOrder}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-xl hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center justify-center shadow-lg"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Cancelling...
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 mr-2" />
                        Cancel Order
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <CreditCard className="h-5 w-5 mr-2" />
                  Order Summary
                </h3>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold">₹{order.unitPrice * order.quantity}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-semibold">₹0</span>
                  </div>
                  <div className="flex justify-between items-center pt-4">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-blue-600">₹{order.unitPrice * order.quantity}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Timeline */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Order Timeline
                </h3>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Order Placed</p>
                      <p className="text-sm text-gray-500">
                        {order.orderDate ? new Date(order.orderDate).toLocaleString() : 'Recently'}
                      </p>
                    </div>
                  </div>
                  
                  {order.status !== 'Pending' && (
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${order.status === 'Cancelled' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Order {order.status}</p>
                        <p className="text-sm text-gray-500">Status updated</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mt-8 p-6 rounded-2xl border-l-4 ${
            message.includes('Error') 
              ? 'bg-red-50 border-red-400 text-red-700' 
              : 'bg-green-50 border-green-400 text-green-700'
          } shadow-lg`}>
            <div className="flex items-center">
              {message.includes('Error') ? (
                <AlertTriangle className="h-6 w-6 mr-3" />
              ) : (
                <CheckCircle className="h-6 w-6 mr-3" />
              )}
              <p className="font-medium">{message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetails; 