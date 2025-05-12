import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

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
          Back to Cart
        </button>
      </div>
    );
  }

  const [shippingAddress, setShippingAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePlaceOrder = async () => {
    if (!shippingAddress) {
      alert('Please provide a shipping address!');
      return;
    }

    setIsProcessing(true);

    const order = {
      buyerId: localStorage.getItem('Id') || 'dummy-user-123', // Replace with actual user ID
      productId: item.product.id,
      product: item.product,
      quantity: item.quantity,
      unitPrice: item.product.price,
      sellerId: item.product.sellerId,
      status: 'Pending', // Order status
      orderDate: new Date().toISOString(),
      processedAt: null,
      shippingAddress: shippingAddress,
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

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-2xl font-bold mb-6">Confirm Your Order</h1>

      <div className="flex flex-col lg:flex-row gap-6 p-4 border rounded-md shadow-md">
        {/* Product Image */}
        <img 
          src={item.product?.mainImage || item.product?.imageUrls?.[0] || '/fallback.png'} 
          alt={item.product?.name} 
          className="w-32 h-32 object-cover rounded-md"
        />

        {/* Product Info */}
        <div className="flex-1">
          <h2 className="text-xl font-semibold">{item.product?.name}</h2>
          <p className="text-gray-600">INR {item.product?.price} each</p>
          <p className="text-gray-500 mt-2">Quantity: {item.quantity}</p>
          <p className="mt-4 font-bold text-lg">Total: INR {(item.product?.price || 0) * item.quantity}</p>

          {/* Shipping Address */}
          <div className="mt-4">
            <label className="block text-sm font-semibold">Shipping Address</label>
            <textarea
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              className="mt-2 w-full p-3 border rounded-md"
              rows="4"
              placeholder="Enter your shipping address here..."
            ></textarea>
          </div>

          <button
            onClick={handlePlaceOrder}
            className="mt-6 bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded"
            disabled={isProcessing}
          >
            {isProcessing ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
