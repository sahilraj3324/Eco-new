import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const OrderDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(location.state?.order);

  if (!order) return <div className="p-6">No order details found.</div>;

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

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Order Details</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p><strong>Order ID:</strong> {order.id}</p>
        <p><strong>Status:</strong> {order.status}</p>
        <p><strong>Product:</strong> {order.product?.name}</p>
        <p><strong>Variant:</strong> {order.variant?.color} | {order.variant?.size}</p>
        <p><strong>Quantity:</strong> {order.quantity}</p>
        <p><strong>Unit Price:</strong> ₹{order.unitPrice}</p>
        <p><strong>Total:</strong> ₹{order.unitPrice * order.quantity}</p>
        <p><strong>Shipping Address:</strong> {order.shippingAddress}</p>
        <p><strong>Order Date:</strong> {order.orderDate ? new Date(order.orderDate).toLocaleString() : ''}</p>
        <div className="mt-4 flex gap-2">
          <button onClick={() => navigate(-1)} className="bg-blue-500 text-white px-4 py-2 rounded">Back</button>
          <button
            onClick={handleCancelOrder}
            className={`bg-red-500 text-white px-4 py-2 rounded ${order.status === 'Cancelled' ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={order.status === 'Cancelled' || loading}
          >
            {loading ? 'Cancelling...' : 'Cancel Order'}
          </button>
        </div>
        {message && <div className="mt-4 text-sm text-green-600">{message}</div>}
      </div>
    </div>
  );
};

export default OrderDetails; 