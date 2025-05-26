import React, { useState, useEffect } from 'react';
import { FiTrash2, FiShoppingCart, FiPlus, FiMinus } from 'react-icons/fi';
import { BsCartCheck } from 'react-icons/bs';
import { IoIosArrowRoundBack } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  // Load cart items from localStorage
  const [cartItems, setCartItems] = useState(() => {
    const stored = localStorage.getItem('cartItems');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeFromCart = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = cartItems.length > 0 ? 50 : 0;
    const tax = subtotal * 0.1;
    const discount = subtotal > 1000 ? 200 : 0;
    return {
      subtotal,
      shipping,
      tax,
      discount,
      total: subtotal + shipping + tax - discount
    };
  };

  const totals = calculateTotal();

  const navigate = useNavigate();

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    // Get existing orders from localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    // Add new order
    orders.push({
      id: Date.now(),
      items: cartItems,
      status: 'active',
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('orders', JSON.stringify(orders));
    setCartItems([]); // clear cart
    navigate('/orders');
  };

  return (
    <div className="font-sans bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white z-50 shadow-sm rounded-b-xl px-4 py-3 flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-gray-800">My Cart</h1>
        </div>
        <div className="relative">
          <FiShoppingCart className="text-blue-500 text-2xl" />
          {cartItems.length > 0 && (
            <div className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              {cartItems.length}
            </div>
          )}
        </div>
      </div>

      <div className="px-4">
        {cartItems.length > 0 ? (
          <>
            <div className="mb-4 space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm p-4 flex gap-4">
                  <img 
                    src={item.mainImage || item.image} 
                    alt={item.name} 
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                    {item.size && <p className="text-gray-500 text-xs mb-1">Size: {item.size}</p>}
                    {item.color && <p className="text-gray-500 text-xs mb-1">Color: {item.color}</p>}
                    <p className="font-bold text-gray-900 mb-3">₹{item.price}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <button 
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-blue-500 font-bold"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <FiMinus />
                      </button>
                      <span className="font-semibold">{item.quantity}</span>
                      <button 
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-blue-500 font-bold"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <FiPlus />
                      </button>
                    </div>
                    <button 
                      className="w-full mt-2 py-3 bg-red-50 text-red-600 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <FiTrash2 /> Remove
                    </button>
                    <button
                      className="w-full mt-2 py-3 bg-blue-500 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                      onClick={() => navigate('/order', { state: { item: { product: item, quantity: item.quantity } } })}
                    >
                      <BsCartCheck /> Proceed to Checkout
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Order Summary</h2>
              <div className="flex justify-between text-gray-500 text-sm mb-3">
                <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span>₹{totals.subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-500 text-sm mb-3">
                <span>Shipping</span>
                <span>₹{totals.shipping}</span>
              </div>
              <div className="flex justify-between text-gray-500 text-sm mb-3">
                <span>Tax</span>
                <span>₹{totals.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-500 text-sm mb-3">
                <span>Discount</span>
                <span className="text-green-500">-₹{totals.discount}</span>
              </div>
              <div className="flex justify-between text-gray-900 font-bold text-base my-4 pt-3 border-t border-dashed border-gray-200">
                <span>Total</span>
                <span>₹{totals.total.toFixed(2)}</span>
              </div>

            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
            <FiShoppingCart className="text-gray-300 text-5xl mb-4" />
            <p className="text-gray-600 font-medium mb-1">Your cart is empty</p>
            <p className="text-gray-400 text-sm">Looks like you haven't added anything to your cart yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart; 