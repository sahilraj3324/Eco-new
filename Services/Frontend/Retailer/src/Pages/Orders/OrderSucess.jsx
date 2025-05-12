import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const OrderSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId } = location.state || {};

  return (
    <div className="p-6 lg:p-10">
      <h1 className="text-2xl font-bold mb-6">Order Placed Successfully!</h1>
      <div className="text-center">
        <h2 className="text-xl font-semibold">Your Order ID: {orderId}</h2>
        <p className="mt-4">Thank you for your purchase! Your order is being processed and will be shipped soon.</p>

        <button
          onClick={() => navigate('/')}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
