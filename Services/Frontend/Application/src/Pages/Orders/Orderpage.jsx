import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle2, MapPin, ShoppingCart } from 'lucide-react';

const OrderPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const item = location.state?.item;

  // If no item is passed via navigation
  if (!item) {
    return (
      <div className="h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-pink-50">
        <div className="bg-white p-8 rounded-3xl shadow-lg max-w-md w-full text-center">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-8">Please add items to proceed with your order</p>
          <button
            onClick={() => navigate('/cart')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Cart
          </button>
        </div>
      </div>
    );
  }

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const address = localStorage.getItem('address') || '123 Main St, Anytown, USA';

  const createOrder = async (orderData) => {
    const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
    
    try {
      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Order failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  const handlePlaceOrder = async () => {
    if (!address) {
      setError('Please provide a shipping address!');
      return;
    }
  
    setIsProcessing(true);
    setError(null);
    
    const order = {
      buyerId: localStorage.getItem('userId') || 'demo-user-123',
      productId: item.product.id,
      product: {
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        image: item.product.mainImage || item.product.imageUrls?.[0]
      },
      quantity: item.quantity,
      totalPrice: (item.product.price * item.quantity),
      shippingAddress: address,
      paymentMethod: 'COD',
    };
  
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const createdOrder = {
        ...order,
        id: `order-${Date.now()}`,
        status: 'Confirmed',
        orderDate: new Date().toISOString()
      };

      navigate('/ordersuccess', { 
        state: { 
          orderId: createdOrder.id,
          orderDetails: createdOrder,
          product: createdOrder.product
        } 
      });
    } catch (error) {
      setError(error.message || 'Failed to place order. Please try again.');
      console.error('Order Error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const total = (item.product?.price || 0) * item.quantity;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 pb-10">
      {/* Mobile Header */}
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <h1 className="text-xl font-bold mt-2 text-gray-800">Complete Your Order</h1>
      </div>

      {/* Mobile Content */}
      <div className="p-4">
        {/* Product Card */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-6">
          <div className="flex gap-4 items-start">
            <div className="w-28 h-28 bg-gradient-to-br from-blue-100 to-pink-100 rounded-xl overflow-hidden flex items-center justify-center">
              <img 
                src={item.product?.mainImage || item.product?.imageUrls?.[0] || '/fallback.png'} 
                alt={item.product?.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-800">{item.product?.name}</h2>
              <div className="mt-2 flex items-center gap-4">
                <span className="text-blue-600 font-bold">₹{item.product?.price}</span>
                <span className="text-gray-500">× {item.quantity}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => navigate('/cart')}
            className="mt-4 w-full text-blue-600 hover:text-blue-800 font-medium py-2 rounded-lg flex items-center justify-center gap-2 border border-blue-200"
          >
            <ArrowLeft className="h-5 w-5" /> Modify Order
          </button>
        </div>

        {/* Shipping Details */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-6">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-3">
            <MapPin className="w-5 h-5 text-blue-500" />
            Shipping Details
          </h3>
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="font-medium text-gray-800 mb-1">Delivery Address</p>
            <p className="text-gray-600 whitespace-pre-line">{address}</p>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-6">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            Order Summary
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">₹{total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="text-green-600 font-medium">FREE</span>
            </div>
            <div className="border-t border-gray-200 my-3"></div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total Amount</span>
              <span className="text-blue-600">₹{total}</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
            {error}
          </div>
        )}

        {/* Place Order Button - Now in main content area */}
        <button
          onClick={handlePlaceOrder}
          disabled={isProcessing}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-70"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> Processing...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5" /> Place Order (₹{total})
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default OrderPage;