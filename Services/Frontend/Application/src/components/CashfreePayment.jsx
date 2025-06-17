import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, X, Loader2, Shield, CheckCircle } from 'lucide-react';
import { load } from '@cashfreepayments/cashfree-js';

const CashfreePayment = ({ 
  isOpen, 
  onClose, 
  orderData
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [error, setError] = useState('');
  const [buyerData, setBuyerData] = useState(null);
  const [loadingBuyer, setLoadingBuyer] = useState(false);
  const navigate = useNavigate();

  // Fetch buyer data from JWT token
  const fetchBuyerData = async () => {
    setLoadingBuyer(true);
    try {
      const response = await fetch('/api/Buyer/me', {
        method: 'GET',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBuyerData(data.buyer);
        return data.buyer;
      } else {
        throw new Error('Failed to fetch buyer data');
      }
    } catch (error) {
      console.error('Error fetching buyer data:', error);
      setError('Failed to fetch user details. Please login again.');
      return null;
    } finally {
      setLoadingBuyer(false);
    }
  };

  // Fetch buyer data when modal opens
  React.useEffect(() => {
    if (isOpen && !buyerData) {
      fetchBuyerData();
    }
  }, [isOpen]);

  const handlePayment = async () => {
    if (!orderData) {
      setError('Order data is missing');
      return;
    }

    // Ensure we have buyer data before proceeding
    let currentBuyerData = buyerData;
    if (!currentBuyerData) {
      currentBuyerData = await fetchBuyerData();
      if (!currentBuyerData) {
        setError('Please login to continue with payment');
        return;
      }
    }

    setIsProcessing(true);
    setError('');
    
    try {
      // Create payment order on backend using authenticated buyer data
      const response = await fetch('/api/order/create-payment', {
        method: 'POST',
        credentials: 'include', // Include cookies for authentication
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buyerId: currentBuyerData.id,
          productId: orderData.productId,
          variantId: orderData.variantId,
          quantity: orderData.quantity,
          shippingAddress: currentBuyerData.address || orderData.shippingAddress || 'Default Address',
          customerName: currentBuyerData.storename || 'Customer',
          customerEmail: currentBuyerData.email || 'customer@example.com',
          customerPhone: currentBuyerData.phoneNumber || '9999999999'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment order');
      }

      const paymentData = await response.json();
      
      // Initialize Cashfree SDK
      const cashfree = await load({
        mode: "sandbox", // Use "production" for live environment
      });

      // Open Cashfree checkout
      const checkoutOptions = {
        paymentSessionId: paymentData.paymentSessionId,
        redirectTarget: "_modal",
      };

      setPaymentStatus('Please complete your payment in the popup window...');

      const result = await cashfree.checkout(checkoutOptions);
      
      if (result.error) {
        console.error('Cashfree payment error:', result.error);
        setError('Payment failed. Please try again.');
        setIsProcessing(false);
        return;
      }

      if (result.redirect) {
        console.log('Payment redirect:', result.redirect);
      }

      // Check payment status
      await checkPaymentStatus(paymentData.orderId);

    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const checkPaymentStatus = async (orderId) => {
    try {
      // Enhanced polling with better error handling
      let attempts = 0;
      const maxAttempts = 20; // Increased attempts
      
      const pollStatus = async () => {
        if (attempts >= maxAttempts) {
          setPaymentStatus('Payment verification taking longer than expected...');
          // Still try to navigate to success page for manual verification
          setTimeout(() => {
            navigate('/ordersuccess', {
              state: {
                orderIds: [orderId],
                paymentId: 'PENDING_VERIFICATION',
                totalAmount: (orderData?.unitPrice || 0) * (orderData?.quantity || 1),
                paymentMethod: 'Online Payment',
                isPaymentSuccess: true,
                isManualVerification: true
              }
            });
          }, 3000);
          return;
        }

        try {
          const statusResponse = await fetch(`/api/order/payment-status/${orderId}`, {
            credentials: 'include'
          });
          
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            console.log('Payment status check:', statusData);
            
            if (statusData.paymentStatus === 'SUCCESS') {
              setPaymentStatus('Payment successful! Redirecting...');
              
              // Redirect to success page with both order ID and payment ID
              setTimeout(() => {
                navigate('/ordersuccess', {
                  state: {
                    orderIds: [statusData.orderId],
                    paymentId: statusData.paymentId,
                    totalAmount: statusData.totalAmount,
                    paymentMethod: statusData.paymentMethod,
                    isPaymentSuccess: true
                  }
                });
              }, 2000);
              return;
              
            } else if (statusData.paymentStatus === 'FAILED') {
              setError('Payment failed. Please try again.');
              setIsProcessing(false);
              return;
              
            } else {
              // Still processing, update status message
              setPaymentStatus(`Verifying payment... (${attempts + 1}/${maxAttempts})`);
              attempts++;
              setTimeout(pollStatus, 3000); // Increased interval
            }
          } else {
            console.warn('Payment status check failed, retrying...');
            attempts++;
            setTimeout(pollStatus, 3000);
          }
        } catch (statusError) {
          console.error('Payment status check error:', statusError);
          attempts++;
          setTimeout(pollStatus, 3000);
        }
      };

      // Start polling after a short delay
      setTimeout(pollStatus, 2000);
      
    } catch (err) {
      console.error('Status check error:', err);
      setError('Failed to verify payment status');
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full mx-auto overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-white/20 rounded-full">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Secure Payment</h2>
              <p className="text-blue-100 text-sm">Powered by Cashfree</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Customer Info */}
          {buyerData && (
            <div className="bg-blue-50 rounded-2xl p-4 mb-4">
              <h3 className="font-semibold text-gray-800 mb-3">Customer Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name</span>
                  <span className="font-medium">{buyerData.storename}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email</span>
                  <span className="font-medium">{buyerData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone</span>
                  <span className="font-medium">{buyerData.phoneNumber}</span>
                </div>
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Product</span>
                <span className="font-medium">{orderData?.productName || 'Product'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity</span>
                <span className="font-medium">{orderData?.quantity || 1}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Unit Price</span>
                <span className="font-medium">₹{orderData?.unitPrice || 0}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold">
                  <span>Total Amount</span>
                  <span className="text-blue-600">₹{(orderData?.unitPrice || 0) * (orderData?.quantity || 1)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Security Badge */}
          <div className="flex items-center gap-2 text-green-600 mb-6">
            <Shield className="h-5 w-5" />
            <span className="text-sm font-medium">Your payment is secured with 256-bit SSL encryption</span>
          </div>

          {/* Status Messages */}
          {paymentStatus && (
            <div className="flex items-center gap-2 text-blue-600 mb-4 p-3 bg-blue-50 rounded-xl">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">{paymentStatus}</span>
            </div>
          )}

          {error && (
            <div className="text-red-600 mb-4 p-3 bg-red-50 rounded-xl">
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={isProcessing || loadingBuyer}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
          >
            {loadingBuyer ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading User Details...
              </>
            ) : isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing Payment...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                Pay ₹{(orderData?.unitPrice || 0) * (orderData?.quantity || 1)}
              </>
            )}
          </button>

          {/* Payment Methods Info */}
          <div className="mt-4 text-center text-xs text-gray-500">
            <p>We accept all major payment methods</p>
            <p className="mt-1">Credit/Debit Cards • UPI • Net Banking • Wallets</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashfreePayment; 