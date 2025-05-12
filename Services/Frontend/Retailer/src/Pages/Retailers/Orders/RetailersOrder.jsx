import React, { useState } from "react";

import Allorder from "./AllOrders";
import logo from "../../../assets/logo.png";
import {  Menu, X } from 'lucide-react';
import { Link } from "react-router-dom";
import NewProducts from "../Home/Newproduct";


const RetailerOrders = () => {
    const [activeTab, setActiveTab] = useState("All");
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
  
    const tabs = {
      "All": <Allorder />,
      
    };
  return (
    <div className="p-1">
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
      {/* Tabs */}
      <div className="flex border-b ">
        {Object.keys(tabs).map((tab) => (
          <button
            key={tab}
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === tab ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search */}
      {/* Orders Content */}
      <div className="mt-4 p-6 bg-white border rounded-md">
        <p className="text-center text-gray-500 text-lg font-semibold">Order Details</p>
        <div className="mt-4 space-y-3">{tabs[activeTab]}</div>
      </div>

      {/* Info Box */}

      <NewProducts />
      <NewProducts />
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
  )
}

export default RetailerOrders