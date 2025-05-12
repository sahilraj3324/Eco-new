import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from "../../../assets/logo.png";
import {  Menu, X } from 'lucide-react';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  const footerSections = [
    {
      title: "Explore",
      links: ["Top Products", "Trending Products", "New Products", "Find Vendors", "Post Requirements", "View All"]
    },
    {
      title: "Seller",
      links: ["Become A Seller", "Add Products", "Manage Products", "My Profile", "Orders", "Payments", "Dashboard"]
    },
    {
      title: "Quick Links",
      links: ["Help & Support", "About Ecocys", "FAQs", "Privacy Policy", "Refund Policy", "Terms Of Use"]
    },
    {
      title: "User",
      links: ["My Cart", "My Wishlist", "My Account", "Help & Support"]
    },
    {
      title: "Social",
      links: ["Instagram", "Facebook", "YouTube", "Twitter"]
    }
  ];
  
    // Simulated auth status (replace with context or localStorage logic)
    const isLoggedIn = true;

  const userId = localStorage.getItem('Id') || "dummy-user-123";

  useEffect(() => {
    fetchCartItems();
  }, [userId]);

  const fetchCartItems = async () => {
    try {
      const res = await fetch(`/api/Cart/user/${userId}`);
      const data = await res.json();
      setCartItems(data);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (id, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await fetch(`/api/Cart/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuantity),
      });
      fetchCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this item?')) return;

    try {
      await fetch(`/api/Cart/${id}`, {
        method: 'DELETE',
      });
      fetchCartItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleCheckout = (item) => {
    navigate('/order', { state: { item } });
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  if (loading) {
    return <div className="text-center mt-10">Loading your cart...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center mt-10">
        <h2 className="text-2xl font-bold">Your Cart is Empty</h2>
        <Link to="/" className="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <>
    <header className="flex flex-col md:flex-row items-center justify-between p-4 bg-white shadow-md rounded-2xl gap-4 mx-4 mt-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <img src={logo} alt="EcoCys Logo" className="h-10 w-auto" />
            </div>
    
            {/* Search Bar */}
            <Link to="/all">
            <input
              type="text"
              placeholder="Search Products, Sellers & More..."
              className="border rounded-full px-4 py-2 w-full max-w-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            </Link>
    
            {/* Mobile Toggle */}
            <button
              className="md:hidden text-gray-700"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
    
            {/* Navigation */}
            <nav
              className={`w-full md:w-auto flex-col md:flex-row md:flex flex-wrap items-center justify-center md:justify-end gap-4 text-sm text-gray-700 transition-all duration-300 ease-in-out ${
                isMobileMenuOpen ? 'flex' : 'hidden md:flex'
              }`}
            >
              {['Men', 'Women', 'Boy', 'Girl', 'View All', 'Become A Seller'].map(link => (
                <Link
                  key={link}
                  href="#"
                  className="text-decoration-none"
                >
                  <li className='text-purple-600 font-medium transition-all duration-200 '> {link}</li>
                  
                </Link>
              ))}
    
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    console.log("Logout clicked");
                    // Add logout logic here (e.g., remove token, redirect)
                  }}
                  className="text-red-600 font-medium hover:text-red-800 transition"
                >
                  Logout
                </button>
              ) : (
                <a
                  href="#"
                  className="hover:text-purple-600 font-medium transition-all duration-200"
                >
                  Login / Sign Up
                </a>
              )}
            </nav>
          </header>
    <div className="p-6 lg:p-10 flex flex-col lg:flex-row justify-between gap-8">
      {/* Left: Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
        {cartItems.map((item, index) => (
          <div key={item.id} className="relative bg-white rounded-lg shadow-md p-4 text-center">
            <img
              src={item.product?.mainImage || item.product?.imageUrls?.[0] || '/fallback.png'}
              alt={item.product?.name}
              className="w-full h-60 object-cover rounded-md mb-4"
            />

            {/* Badge */}
            <span className="absolute top-2 left-2 bg-white text-xs px-2 py-1 rounded-full shadow">
              {['Recently Added', 'Top Rated', 'Trending'][index % 3]}
            </span>

            <h3 className="font-semibold text-base">{item.product?.name}</h3>
            <p className="text-sm text-gray-500">Sold By Wholesaler</p>
            <p className="font-bold text-sm mt-1">₹{item.product?.price} / Per Pack</p>

            {/* Quantity Controls */}
            <div className="flex justify-center items-center gap-3 mt-2">
              <button
                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 text-xl flex items-center justify-center"
              >
                −
              </button>
              <span className="font-semibold">{item.quantity}</span>
              <button
                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 text-xl flex items-center justify-center"
              >
                +
              </button>
            </div>

            {/* Subtotal */}
            <p className="mt-2 font-semibold">Subtotal: ₹{(item.product?.price || 0) * item.quantity}</p>

            {/* Buttons */}
            <div className="flex flex-col gap-2 mt-3">
              <button
                className="bg-green-500 hover:bg-green-600 text-white py-1 rounded text-sm"
                onClick={() => handleCheckout(item)}
              >
                Checkout
              </button>
              <button
                className="bg-gray-700 text-white py-1 rounded hover:bg-gray-800 text-sm"
                onClick={() => handleDelete(item.id)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Right: Cart Summary */}
      <div className="w-full lg:w-1/3">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Cart Subtotal</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex justify-between"><span>Cart Subtotal</span><span>INR {totalAmount}/-</span></div>
            <div className="flex justify-between"><span>GST</span><span>INR 0/-</span></div>
            <div className="flex justify-between"><span>Shipping & Delivery</span><span>INR 0/-</span></div>
            <div className="flex justify-between"><span>1% TCS</span><span>INR 0/-</span></div>
            <div className="flex justify-between"><span>Discount</span><span>INR 0/-</span></div>
          </div>
          <hr className="my-4" />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span><span>INR {totalAmount}/-</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-6">
         
          <button className="bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-full font-semibold">
            Scroll To Wishlist
          </button>
        </div>
      </div>
    </div>
    <footer className="py-10 mt-10 bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 text-sm text-gray-600">
          {footerSections.map((section, index) => (
            <div key={index}>
              <h4 className="mb-3 font-bold text-gray-800">{section.title}</h4>
              {section.links.map(link => (
                <a key={link} href="#" className="block hover:text-purple-500 transition">
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">
          © 2025 EcoCys. All Rights Reserved.
        </p>
      </footer>
    </>
  );
};

export default CartPage;
