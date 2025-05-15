import React, { useState } from 'react';
import { FiHeart, FiTrash2, FiArrowRight, FiChevronDown, FiShoppingCart, FiPlus, FiMinus } from 'react-icons/fi';
import { BsCartPlus, BsCartCheck } from 'react-icons/bs';
import { IoIosArrowRoundBack } from 'react-icons/io';

// Sample product images
const menShirtImg = './men shirts.png';
const tshirtImg = './men shirts.png';
const jeansImg = './men shirts.png';
const shoesImg = './men shirts.png';
const formalShoesImg = './men shirts.png';

const CartAndWishlist = () => {
  const [activeTab, setActiveTab] = useState('cart');
  const [cartItems, setCartItems] = useState([
    { id: 1, name: 'Stylish Glamorous Men Shirts', seller: 'Wholesaler', price: 500, quantity: 1, image: menShirtImg, tag: 'Recently Added', rating: 4.5 },
    { id: 2, name: 'Casual Cotton T-Shirts', seller: 'FashionHub', price: 350, quantity: 2, image: tshirtImg, tag: 'Popular', rating: 4.2 }
  ]);
  
  const [wishlistItems, setWishlistItems] = useState([
    { id: 3, name: 'Premium Denim Jeans', seller: 'DenimWorld', price: 1200, image: jeansImg, tag: 'Trending', rating: 4.7 },
    { id: 4, name: 'Sports Running Shoes', seller: 'AthleFit', price: 2500, image: shoesImg, tag: 'Best Seller', rating: 4.8 },
    { id: 5, name: 'Formal Leather Shoes', seller: 'EliteWear', price: 1800, image: formalShoesImg, tag: 'Luxury', rating: 4.6 }
  ]);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(cartItems.map(item => 
      item.id === id ? {...item, quantity: newQuantity} : item
    ));
  };

  const removeFromCart = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const removeFromWishlist = (id) => {
    setWishlistItems(wishlistItems.filter(item => item.id !== id));
  };

  const addToCart = (item) => {
    if (!cartItems.some(cartItem => cartItem.id === item.id)) {
      setCartItems([...cartItems, {...item, quantity: 1}]);
      // Optional: Show a success message or animation
    }
  };

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 50;
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

  return (
    <div className="font-sans bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <div className="sticky top-0 bg-white z-50 shadow-sm rounded-b-xl px-4 py-3 flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <IoIosArrowRoundBack className="text-blue-500 text-2xl" />
          <h1 className="text-xl font-bold text-gray-800">
            {activeTab === 'cart' ? 'My Cart' : 'Wishlist'}
          </h1>
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
        {activeTab === 'cart' ? (
          <>
            {cartItems.length > 0 ? (
              <>
                <div className="mb-4 space-y-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="bg-white rounded-xl shadow-sm p-4 flex gap-4">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-24 h-24 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-1 rounded-full mb-2 inline-block">
                          {item.tag}
                        </span>
                        <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                        <p className="text-gray-500 text-xs mb-1">Sold by {item.seller}</p>
                        <div className="flex items-center gap-1 text-yellow-500 text-xs mb-2">
                          ★ {item.rating}
                        </div>
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

                        <button className="w-full mt-2 py-3 bg-blue-500 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2">
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
                  
                  <button className="w-full py-4 bg-blue-500 text-white rounded-xl font-semibold text-base flex items-center justify-center gap-2 shadow-blue-200 shadow-md">
                    <BsCartCheck size={20} /> Proceed to Checkout
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
                <FiShoppingCart className="text-gray-300 text-5xl mb-4" />
                <p className="text-gray-600 font-medium mb-1">Your cart is empty</p>
                <p className="text-gray-400 text-sm">Looks like you haven't added anything to your cart yet</p>
                <button 
                  className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold text-sm"
                  onClick={() => setActiveTab('wishlist')}
                >
                  Browse Wishlist
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            {wishlistItems.length > 0 ? (
              <div className="mb-4 space-y-4">
                {wishlistItems.map(item => (
                  <div key={item.id} className="bg-white rounded-xl shadow-sm p-4 flex gap-4">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-24 h-24 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-1 rounded-full mb-2 inline-block">
                        {item.tag}
                      </span>
                      <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-gray-500 text-xs mb-1">Sold by {item.seller}</p>
                      <div className="flex items-center gap-1 text-yellow-500 text-xs mb-2">
                        ★ {item.rating}
                      </div>
                      <p className="font-bold text-gray-900 mb-3">₹{item.price}</p>
                      
                      <div className="flex gap-2 mt-3">
                        <button 
                          className="flex-1 py-3 bg-red-50 text-red-600 rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                          onClick={() => removeFromWishlist(item.id)}
                        >
                          <FiTrash2 size={14} /> Remove
                        </button>
                        <button 
                          className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-200"
                          onClick={() => addToCart(item)}
                        >
                          <BsCartPlus size={16} className="text-white" /> Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
                <FiHeart className="text-gray-300 text-5xl mb-4" />
                <p className="text-gray-600 font-medium mb-1">Your wishlist is empty</p>
                <p className="text-gray-400 text-sm">Save items you love by adding them to your wishlist</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white px-4 py-3 flex justify-between items-center shadow-top z-40">
        <button 
          className={`flex flex-col items-center justify-center py-2 flex-1 ${activeTab === 'cart' ? 'text-blue-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('cart')}
        >
          <FiShoppingCart className="text-xl mb-1" />
          <span className="text-xs font-semibold">Cart</span>
          {cartItems.length > 0 && (
            <span className="bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold mt-1">
              {cartItems.length}
            </span>
          )}
        </button>
        <button 
          className={`flex flex-col items-center justify-center py-2 flex-1 ${activeTab === 'wishlist' ? 'text-blue-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('wishlist')}
        >
          <FiHeart className="text-xl mb-1" />
          <span className="text-xs font-semibold">Wishlist</span>
          {wishlistItems.length > 0 && (
            <span className="bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold mt-1">
              {wishlistItems.length}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default CartAndWishlist;