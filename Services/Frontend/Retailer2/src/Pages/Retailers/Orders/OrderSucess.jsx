import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Home, Loader2 } from 'lucide-react';

const OrderSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    orderIds, 
    isBulkOrder, 
    totalItems, 
    totalAmount, 
    sellers,
    orderItemsForStock 
  } = location.state || {};

  const [isUpdatingStock, setIsUpdatingStock] = useState(true);
  const [stockUpdateResults, setStockUpdateResults] = useState([]);

  useEffect(() => {
    const updateAllStocks = async () => {
      if (!orderItemsForStock || orderItemsForStock.length === 0) {
        setIsUpdatingStock(false);
        return;
      }

      console.log('Starting stock updates for order items:', orderItemsForStock);
      const results = [];

      try {
        for (const item of orderItemsForStock) {
          const { productId, variantId, quantity, productName, variantColor, variantSize } = item;
          
          try {
            console.log(`Updating stock for ${productName} (${variantColor} - ${variantSize})`);
            
            // Fetch the product to get the current stock of the variant
            const res = await fetch(`/api/Product/${productId}`);
            if (!res.ok) throw new Error('Failed to fetch product');
            
            const product = await res.json();
            const variant = (product.variants || []).find(
              v => (v.id || v.Id) === variantId
            );
            
            if (!variant) throw new Error('Variant not found in product');
            
            const currentStock = parseInt(variant.stock || variant.Stock || 0, 10);
            const newStock = Math.max(0, currentStock - quantity); // Ensure stock doesn't go negative
            
            console.log(`Stock update: ${productName} (${variantColor} - ${variantSize}) - Current: ${currentStock}, Ordered: ${quantity}, New: ${newStock}`);

            // Update the variant stock with the new stock value
            const stockRes = await fetch(`/api/Product/update-variant-stock/${productId}/${variantId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ newStock: newStock })
            });
            
            if (!stockRes.ok) {
              throw new Error(`Stock update API failed for ${productName}`);
            }
            
            results.push({
              productName,
              variantColor,
              variantSize,
              status: 'success',
              oldStock: currentStock,
              newStock: newStock,
              quantity: quantity
            });
            
            console.log(`Successfully updated stock for ${productName} (${variantColor} - ${variantSize})`);
            
          } catch (err) {
            console.error(`Error updating stock for ${productName}:`, err);
            results.push({
              productName,
              variantColor,
              variantSize,
              status: 'error',
              error: err.message
            });
          }
        }
        
        setStockUpdateResults(results);
        console.log('Stock update completed. Results:', results);
        
      } catch (err) {
        console.error('Error in stock update process:', err);
      } finally {
        setIsUpdatingStock(false);
      }
    };

    updateAllStocks();
  }, [orderItemsForStock]);

  // Show loading while stock is being updated
  if (isUpdatingStock) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <Loader2 className="h-16 w-16 text-blue-500 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Processing Your Order</h2>
          <p className="text-gray-600">Updating inventory...</p>
        </div>
      </div>
    );
  }

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
            <p className="text-sm text-gray-600 mb-1">Order Details</p>
            {isBulkOrder ? (
              <div className="space-y-1">
                <p className="text-lg font-bold text-gray-800">{totalItems} Items Ordered</p>
                <p className="text-sm text-gray-600">From {sellers} seller{sellers > 1 ? 's' : ''}</p>
                <p className="text-lg font-bold text-green-600">₹{totalAmount}</p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-lg font-mono font-bold text-gray-800">{orderIds?.[0] || 'N/A'}</p>
                <p className="text-lg font-bold text-green-600">₹{totalAmount}</p>
              </div>
            )}
          </div>
          
          {/* Stock Update Results */}
          {stockUpdateResults.length > 0 && (
            <div className="mb-6">
              <details className="text-left">
                <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                  Stock Update Results ({stockUpdateResults.filter(r => r.status === 'success').length}/{stockUpdateResults.length} successful)
                </summary>
                <div className="mt-2 space-y-1 text-xs">
                  {stockUpdateResults.map((result, index) => (
                    <div key={index} className={`p-2 rounded ${result.status === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      <div className="font-medium">{result.productName} ({result.variantColor} - {result.variantSize})</div>
                      {result.status === 'success' ? (
                        <div>Stock: {result.oldStock} → {result.newStock} (-{result.quantity})</div>
                      ) : (
                        <div>Error: {result.error}</div>
                      )}
                    </div>
                  ))}
                </div>
              </details>
            </div>
          )}
          
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
