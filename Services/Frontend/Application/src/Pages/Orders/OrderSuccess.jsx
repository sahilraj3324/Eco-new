import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Home, ShoppingBag, Mail, Truck } from 'lucide-react';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, orderDetails, product } = location.state || {};

  // Redirect if no orderId is present
  useEffect(() => {
    if (!orderId) {
      navigate('/', { replace: true });
    }
  }, [orderId, navigate]);

  if (!orderId) {
    return (
      <div className="h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center p-6 bg-white rounded-2xl shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold mb-4 text-gray-800">No Order Information Found</h2>
          <button
            onClick={() => navigate('/')}
            className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl flex items-center justify-center gap-2 mx-auto transition-colors"
          >
            <Home className="h-5 w-5" /> Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-center relative">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-2 rounded-full shadow-lg">
              <CheckCircle className="h-12 w-12 text-green-600" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">Order Confirmed!</h1>
          <p className="text-green-100 font-medium mt-1">Payment Successful</p>
        </div>
        
        {/* Order Content */}
        <div className="px-6 pb-8 text-center">
          {/* Order Tracking Info */}
          {/* <div className="flex justify-center gap-6 mb-6">
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 p-3 rounded-full mb-2">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-xs text-gray-600">Confirmation Sent</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-yellow-100 p-3 rounded-full mb-2">
                <Truck className="h-5 w-5 text-yellow-600" />
              </div>
              <p className="text-xs text-gray-600">Preparing Order</p>
            </div>
          </div> */}

          {/* Order Details */}
          <div className="bg-gray-50 rounded-xl p-5 mb-6 text-left border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Order Number</p>
            <p className="text-lg font-mono font-bold text-gray-800 mb-4">{orderId}</p>
            
            {product && (
              <div className="flex items-center gap-3 border-t border-gray-200 pt-4 mt-4">
                <div className="relative">
                  <img 
                    src={product.image || '/fallback.png'} 
                    alt={product.name}
                    className="w-14 h-14 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      e.target.src = '/fallback.png';
                    }}
                  />
                  <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {orderDetails?.quantity || 1}
                  </span>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-medium text-gray-800">{product.name}</h3>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-gray-500">Item Total</span>
                    <span className="font-medium">₹{orderDetails?.totalPrice || (product.price * (orderDetails?.quantity || 1))}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Thank You Message */}
          <div className="mb-6">
            <p className="text-sm text-gray-500">
              Thank you for your purchase! We've received your order and it's now being processed. 
            </p>
            <p className="text-sm text-gray-500 mt-2">
              You'll receive a confirmation message shortly with all the details.
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {orderDetails && (
              <button
                onClick={() => navigate('/orders')}
                className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 px-6 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <ShoppingBag className="h-5 w-5" /> View My Orders
              </button>
            )}
            <button
              onClick={() => navigate('/')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Home className="h-5 w-5" /> Back to Home
            </button>
          </div>
          
          {/* Help Link */}
          <p className="mt-6 text-sm text-gray-500">
            Need help? <a href="/contact" className="text-blue-600 hover:underline font-medium">Contact us</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess; 