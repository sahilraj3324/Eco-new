import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';

const OrderPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const item = location.state?.item;

  // If no item is passed via navigation
  if (!item) {
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

  const handlePlaceOrder = async () => {
    if (!address) {
      alert('Please provide a shipping address!');
      return;
    }

    setIsProcessing(true);
    

    const order = {
      buyerId: localStorage.getItem('Id') || 'dummy-user-123',  // Replace with actual user ID
      productId: item.product.id,
      product: item.product,
      quantity: item.quantity,
      unitPrice: item.product.price,
      sellerId: item.product.sellerId,
      status: 'Pending', // Order status
      orderDate: new Date().toISOString(),
      processedAt: null,
      shippingAddress: address,
    };

    try {
      const response = await fetch('/api/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order),
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      // Navigate to the order success page or wherever you want
      navigate('/ordersuccess', { state: { orderId: order.id } });
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again!');
    } finally {
      setIsProcessing(false);
    }
  };

  const total = (item.product?.price || 0) * item.quantity;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-pink-50 py-10 px-2">
      {/* Stepper */}
     

      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 flex flex-col lg:flex-row gap-8">
        {/* Product Card */}
        <div className="flex flex-col items-center lg:items-start gap-4 w-full lg:w-1/2">
          <div className="bg-gradient-to-br from-blue-100 to-pink-100 p-4 rounded-xl shadow-md w-full flex flex-col items-center">
            <img 
              src={item.product?.mainImage || item.product?.imageUrls?.[0] || '/fallback.png'} 
              alt={item.product?.name} 
              className="w-32 h-32 object-cover rounded-lg border border-gray-200 mb-2"
            />
            <h2 className="text-lg font-bold text-gray-800 text-center">{item.product?.name}</h2>
            <span className="text-blue-600 font-semibold text-base">INR {item.product?.price}</span>
            <span className="text-gray-500 text-sm">Quantity: {item.quantity}</span>
          </div>
          <button
            onClick={() => navigate('/cart')}
            className="mt-2 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <ArrowLeft className="h-5 w-5" /> Back to Cart
          </button>
        </div>

        {/* Order & Address Section */}
        <div className="flex-1 flex flex-col justify-between">
          {/* Order Summary */}
          <div className="mb-6 bg-gray-50 rounded-xl p-5 shadow-sm">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" /> Order Summary
            </h3>
            <div className="flex justify-between text-gray-700 mb-1">
              <span>Price</span>
              <span>INR {item.product?.price}</span>
            </div>
            <div className="flex justify-between text-gray-700 mb-1">
              <span>Quantity</span>
              <span>{item.quantity}</span>
            </div>
            <div className="flex justify-between text-gray-700 mb-1">
              <span>Subtotal</span>
              <span>INR {total}</span>
            </div>
            <div className="flex justify-between text-gray-700 mb-1">
              <span>Shipping</span>
              <span className="text-green-600 font-medium">FREE</span>
            </div>
            <div className="border-t border-gray-200 my-2"></div>
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span className="text-blue-600">INR {total}</span>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2 text-gray-700">Shipping Address</label>
            <pre>{address}</pre>
          </div>

          <button
            onClick={handlePlaceOrder}
            className="mt-2 w-full bg-gradient-to-r from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 shadow-md transition-all text-lg disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5" /> Place Order
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
