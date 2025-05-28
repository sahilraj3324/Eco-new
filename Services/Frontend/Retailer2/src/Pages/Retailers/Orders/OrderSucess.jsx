import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Home } from 'lucide-react';

const OrderSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, productId, variantId, quantity } = location.state || {};

  useEffect(() => {
    const updateStock = async () => {
      if (!productId || !variantId || !quantity) return;
      try {
        // Fetch the product to get the current stock of the variant
        const res = await fetch(`/api/Product/${productId}`);
        if (!res.ok) throw new Error('Failed to fetch product');
        const product = await res.json();
        const variant = (product.variants || []).find(
          v => (v.id || v.Id) === variantId
        );
        if (!variant) throw new Error('Variant not found in product');
        const currentStock = parseInt(variant.stock || variant.Stock || 0, 10);
        const newStock = currentStock - quantity;

        // Update the variant stock with the new stock value
        try {
          const stockRes = await fetch(`/api/Product/update-variant-stock/${productId}/${variantId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newStock: newStock })
          });
          if (!stockRes.ok) throw new Error('Stock update failed');
        } catch (err) {
          // If stock update fails, try to add the quantity back
          try {
            const addBackStock = currentStock; // revert to original stock
            await fetch(`/api/Product/update-variant-stock/${productId}/${variantId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ newStock: addBackStock })
            });
          } catch (addBackErr) {
            console.error('Failed to add back to stock after stock update failure:', addBackErr);
          }
          alert('Order placed, but failed to update stock. Please contact support.');
        }
      } catch (err) {
        console.error('Error updating stock after order:', err);
      }
    };

    updateStock();
  }, [productId, variantId, quantity]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-green-500 p-6 text-center">
          <div className="flex justify-center">
            <CheckCircle className="h-16 w-16 text-white" strokeWidth={1.5} />
          </div>
        </div>
        
        <div className="p-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
          <p className="text-green-600 font-medium mb-6">Your payment was successful</p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Order Reference</p>
            <p className="text-lg font-mono font-bold text-gray-800">{orderId || 'N/A'}</p>
          </div>
          
          <p className="text-gray-600 mb-8">
            Thank you for your purchase! We've received your order and it's now being processed. 
            You'll receive a confirmation email shortly with all the details.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Home className="h-5 w-5" /> Home
            </button>
          </div>
          
          <p className="mt-8 text-sm text-gray-500">
            Need help? <a href="/contact" className="text-blue-600 hover:underline">Contact us</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
