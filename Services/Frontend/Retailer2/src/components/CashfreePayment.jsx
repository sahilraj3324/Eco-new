import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, X, Loader2, Shield, CheckCircle } from 'lucide-react';

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
  const [paymentData, setPaymentData] = useState(null);
  const navigate = useNavigate();
  
  // Define payment method for consistency
  const actualPaymentMethod = 'Cashfree';

  // Load Cashfree SDK
  const loadCashfreeSDK = () => {
    return new Promise((resolve, reject) => {
      if (window.Cashfree) {
        resolve(window.Cashfree);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
      script.onload = () => {
        if (window.Cashfree) {
          resolve(window.Cashfree);
        } else {
          reject(new Error('Cashfree SDK failed to load'));
        }
      };
      script.onerror = () => reject(new Error('Failed to load Cashfree SDK'));
      document.head.appendChild(script);
    });
  };

  // Fetch buyer data from JWT token
  const fetchBuyerData = async () => {
    setLoadingBuyer(true);
    try {
      const response = await fetch('/api/Buyer/me', {
        method: 'GET',
        credentials: 'include',
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
    setPaymentStatus('Creating order...');
    
    try {
      let response;
      
      if (orderData.isBulkOrder) {
        // Handle bulk order payment
        setPaymentStatus('Creating bulk payment order...');
        response = await fetch('/api/order/create-bulk-payment', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            buyerId: currentBuyerData.id,
            orderItems: orderData.orderItems,
            totalAmount: orderData.totalAmount,
            shippingAddress: currentBuyerData.address || orderData.shippingAddress || 'Default Address',
            customerName: currentBuyerData.storename || 'Customer',
            customerEmail: currentBuyerData.email || 'customer@example.com',
            customerPhone: currentBuyerData.phoneNumber || '9999999999'
          }),
        });
      } else {
        // Handle single item payment (existing logic)
        response = await fetch('/api/order/create-payment', {
          method: 'POST',
          credentials: 'include',
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
      }

      if (!response.ok) {
        throw new Error('Failed to create payment order');
      }

      const data = await response.json();
      console.log('Payment data received:', data);

      if (!data.paymentSessionId) {
        throw new Error('Payment session ID not received');
      }

      setPaymentData(data);
      setPaymentStatus('Loading payment gateway...');

      // Load Cashfree SDK and initialize payment
      const Cashfree = await loadCashfreeSDK();

      // Initialize Cashfree
      const cashfree = Cashfree({
        mode: "sandbox" // Use "production" for live environment
      });

      setPaymentStatus('Opening Cashfree checkout...');

      // Open Cashfree checkout with payment session
      const checkoutOptions = {
        paymentSessionId: data.paymentSessionId,
        redirectTarget: "_modal" // Opens in a modal popup
      };

      console.log('Opening Cashfree checkout with session:', data.paymentSessionId);
      console.log('Checkout options:', checkoutOptions);

      // Handle checkout result
      const result = await cashfree.checkout(checkoutOptions);
      
      console.log('Checkout result:', result);
      console.log('Result type:', typeof result);
      console.log('Result keys:', Object.keys(result || {}));

      if (result.error) {
        console.error('Cashfree error:', result.error);
        throw new Error(result.error.message || 'Payment failed');
      }

      // Check various success indicators from Cashfree
      const hasPaymentDetails = result.paymentDetails;
      const hasRedirect = result.redirect;
      const hasOrder = result.order;
      const isSuccess = result.paymentStatus === 'SUCCESS' || result.status === 'SUCCESS';
      
      console.log('Payment success indicators:', {
        hasPaymentDetails,
        hasRedirect,
        hasOrder,
        isSuccess,
        paymentStatus: result.paymentStatus,
        status: result.status
      });

      // Check if payment details exist (indicates payment completed)
      if (hasPaymentDetails || isSuccess || hasOrder) {
        console.log('Payment completed with details:', result.paymentDetails);
        
        // Payment completed successfully
        setPaymentStatus('Payment completed! Updating order status...');
        
        // Call backend to update payment status
        try {
          const callbackResponse = await fetch('/api/order/payment-callback', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId: orderData.isBulkOrder ? (data.orderIds && data.orderIds[0]) || data.orderId : data.orderId,
              paymentId: result.paymentDetails?.paymentId || result.paymentDetails?.cf_payment_id || 'CASHFREE_PAYMENT',
              paymentStatus: 'SUCCESS',
              paymentMethod: 'Cashfree'
            }),
          });
          
          if (callbackResponse.ok) {
            console.log('Payment status updated successfully');
            setPaymentStatus('Payment completed! Redirecting...');
          } else {
            console.warn('Failed to update payment status, but payment was successful');
            setPaymentStatus('Payment completed! Redirecting...');
          }
        } catch (error) {
          console.warn('Error updating payment status:', error);
          setPaymentStatus('Payment completed! Redirecting...');
        }
        
        setIsProcessing(false);
        
        // Close modal first to prevent any interference
        onClose();
        
        // Navigate to success page after a short delay
        setTimeout(() => {
          const isBulk = orderData.isBulkOrder || false;
          const orderIds = isBulk ? (data.orderIds || [data.orderId]) : [data.orderId];
          const totalItems = isBulk ? orderData.orderItems?.length || 1 : 1;
          
          console.log('Navigating to success page with order data:', {
            orderIds,
            isBulkOrder: isBulk,
            totalItems,
            totalAmount: data.orderAmount || data.totalAmount
          });
          
          const navigationState = { 
            orderIds: orderIds,
            totalAmount: data.orderAmount || data.totalAmount,
            paymentDetails: result.paymentDetails,
            paymentId: result.paymentDetails?.paymentId || result.paymentDetails?.cf_payment_id || 'CASHFREE_PAYMENT',
            paymentMethod: actualPaymentMethod || 'Cashfree',
            isPaymentSuccess: true,
            isBulkOrder: isBulk,
            totalItems: totalItems,
            // Add proper order context to prevent "direct payment" classification
            isFromCart: true,
            paymentComplete: true,
            orderType: isBulk ? 'bulk' : 'single'
          };
          
          if (isBulk) {
            navigationState.sellers = orderData.orderItems?.length || 1;
            // Use actual cart item IDs for bulk orders
            navigationState.cartItemIds = orderData.cartItemIds || orderData.orderItems?.map(item => item.cartItemId).filter(Boolean) || [];
            navigationState.orderItemsForStock = orderData.orderItems || [];
            navigationState.isFullCartCheckout = orderData.isFullCartCheckout || false;
          } else {
            // For single orders, prepare stock update data
            navigationState.orderItemsForStock = [{
              productId: orderData.productId,
              variantId: orderData.variantId,
              quantity: orderData.quantity,
              productName: orderData.productName
            }];
            // If this came from cart, add cart item ID for deletion
            if (orderData.cartItemId) {
              navigationState.cartItemIds = [orderData.cartItemId];
            }
          }
          
          console.log('Navigation state:', navigationState);
          
          navigate('/ordersuccess', { state: navigationState });
        }, 1000);
      } else if (result.redirect) {
        // Handle redirect case (if any)
        console.log('Payment redirect result:', result);
        setPaymentStatus('Payment completed! Redirecting...');
        setIsProcessing(false);
        
        onClose();
        
        setTimeout(() => {
          navigate('/ordersuccess', { 
            state: { 
              orderIds: [data.orderId],
              totalAmount: data.orderAmount,
              paymentId: 'CASHFREE_PAYMENT',
              paymentMethod: 'Cashfree',
              isPaymentSuccess: true,
              isBulkOrder: false,
              totalItems: 1
            }
          });
        }, 1000);
      } else {
        // Handle case where payment was cancelled or failed
        console.log('Payment was cancelled or failed. Result:', result);
        
        // Check if the modal was simply closed without completion
        if (!result || Object.keys(result).length === 0) {
          console.log('Payment modal was closed without completion');
          setPaymentStatus('');
          setIsProcessing(false);
          setError('Payment was cancelled. Please try again.');
        } else {
          // Some other result structure we haven't handled
          console.log('Unhandled payment result structure:', result);
          setPaymentStatus('');
          setIsProcessing(false);
          setError('Payment status unclear. Please check your orders or try again.');
        }
      }

    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
      setPaymentStatus('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            disabled={isProcessing}
          >
            <X size={24} />
          </button>
          <div className="flex items-center space-x-3">
            <Shield size={28} />
            <div>
              <h3 className="text-xl font-bold">Secure Payment</h3>
              <p className="text-blue-100 text-sm">Powered by Cashfree</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loadingBuyer ? (
            <div className="text-center py-8">
              <Loader2 className="animate-spin mx-auto mb-4 text-blue-600" size={32} />
              <p className="text-gray-600">Loading user details...</p>
            </div>
          ) : (
            <>
              {/* Order Summary */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Order Summary</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  {orderData?.isBulkOrder ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Order Type:</span>
                        <span className="font-medium text-blue-600">Bulk Order</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Items:</span>
                        <span className="font-medium">{orderData?.orderItems?.length || 0} products</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Quantity:</span>
                        <span className="font-medium">
                          {orderData?.orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0} units
                        </span>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="text-sm text-gray-600 mb-2">Items:</div>
                        <div className="max-h-32 overflow-y-auto space-y-1">
                          {orderData?.orderItems?.map((item, index) => (
                            <div key={index} className="text-xs text-gray-500 flex justify-between">
                              <span className="truncate">{item.productName}</span>
                              <span>x{item.quantity} - ₹{item.unitPrice * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Product:</span>
                        <span className="font-medium">{orderData?.productName || 'Product'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-medium">{orderData?.quantity || 1}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Unit Price:</span>
                        <span className="font-medium">₹{orderData?.unitPrice || 0}</span>
                      </div>
                    </>
                  )}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total Amount:</span>
                      <span className="text-green-600">
                        ₹{orderData?.isBulkOrder 
                          ? orderData?.totalAmount || 0
                          : (orderData?.unitPrice || 0) * (orderData?.quantity || 1)
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              {buyerData && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Customer Details</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span>{buyerData.storename || 'Customer'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span>{buyerData.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span>{buyerData.phoneNumber}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Messages */}
              {paymentStatus && (
                <div className={`mb-4 p-4 rounded-lg ${
                  paymentStatus.includes('completed') 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-blue-50 border border-blue-200'
                }`}>
                  <div className="flex items-center space-x-2">
                    {paymentStatus.includes('completed') ? (
                      <CheckCircle className="text-green-600" size={16} />
                    ) : (
                      <Loader2 className="animate-spin text-blue-600" size={16} />
                    )}
                    <span className={`text-sm ${
                      paymentStatus.includes('completed') ? 'text-green-800' : 'text-blue-800'
                    }`}>
                      {paymentStatus}
                    </span>
                  </div>
                  {paymentStatus.includes('completed') && (
                    <button
                      onClick={() => navigate('/ordersuccess', { 
                        state: { 
                          orderIds: [paymentData?.orderId],
                          totalAmount: paymentData?.orderAmount,
                          paymentId: 'CASHFREE_PAYMENT',
                          paymentMethod: 'Cashfree',
                          isPaymentSuccess: true,
                          isBulkOrder: false,
                          totalItems: 1
                        }
                      })}
                      className="mt-2 w-full bg-green-600 text-white py-2 px-4 rounded-lg text-sm hover:bg-green-700 transition-colors"
                    >
                      Go to Order Success Page
                    </button>
                  )}
                </div>
              )}

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                  {error.includes('status unclear') && (
                    <button
                      onClick={() => navigate('/allorder')}
                      className="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
                    >
                      Check My Orders
                    </button>
                  )}
                </div>
              )}

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={isProcessing || loadingBuyer}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard size={20} />
                    <span>Pay ₹{orderData?.isBulkOrder 
                      ? orderData?.totalAmount || 0
                      : (orderData?.unitPrice || 0) * (orderData?.quantity || 1)
                    }</span>
                  </>
                )}
              </button>

              {/* Security Notice */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  🔒 Your payment is secured by 256-bit SSL encryption
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Payment gateway provided by Cashfree Payments
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CashfreePayment; 