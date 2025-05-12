import React, { useState } from 'react';
import {  Menu, X } from 'lucide-react';
import logo from "../../../assets/logo.png";
import TopProduct from './TopProducts';
import NewProducts from './Newproduct';
import TrendingProducts from './TrendingProducts';
import sellerImg from './image.png';
import { Link } from 'react-router-dom';

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

const HomePage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Simulated auth status (replace with context or localStorage logic)
  const isLoggedIn = true;

  return (
    <div className="font-sans bg-gray-50 min-h-screen">
      {/* Header */}
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

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-purple-200 to-purple-300 h-60 rounded-2xl m-4 flex items-center justify-center text-3xl font-semibold text-purple-800">
        Discover What Moves the Market 🚀
      </section>

      {/* Product Sections */}
      <TopProduct />
      <NewProducts />
      <TrendingProducts />

      {/* Become A Seller Section */}
      <section className="my-10 px-4 flex justify-center">
        <img
          src={sellerImg}
          alt="Become a Seller"
          className="rounded-3xl w-full max-w-4xl object-cover shadow-xl"
        />
      </section>

      {/* Footer */}
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
    </div>
  );
};

export default HomePage;
