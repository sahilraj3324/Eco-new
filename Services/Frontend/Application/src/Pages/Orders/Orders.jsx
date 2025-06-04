import React, { useState } from "react";
import { Package, Calendar, XCircle, Clock, CheckCircle2, Truck, Filter } from "lucide-react";
import AllOrders from "./AllOrders";
import NewProducts from "../Homepage/NewProducts";

const Orders = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const tabs = {
    "All": <AllOrders />,
    "Pending": <AllOrders statusFilter="pending" />,
    "Processing": <AllOrders statusFilter="processing" />,
    "Shipped": <AllOrders statusFilter="shipped" />,
    "Delivered": <AllOrders statusFilter="delivered" />,
    "Cancelled": <AllOrders statusFilter="cancelled" />
  };

  const getTabIcon = (tab) => {
    const icons = {
      "All": Package,
      "Pending": Clock,
      "Processing": Filter,
      "Shipped": Truck,
      "Delivered": CheckCircle2,
      "Cancelled": XCircle
    };
    return icons[tab] || Package;
  };

  const getTabColor = (tab) => {
    const colors = {
      "All": "text-blue-600 border-blue-600 bg-blue-50",
      "Pending": "text-yellow-600 border-yellow-600 bg-yellow-50",
      "Processing": "text-purple-600 border-purple-600 bg-purple-50",
      "Shipped": "text-indigo-600 border-indigo-600 bg-indigo-50",
      "Delivered": "text-green-600 border-green-600 bg-green-50",
      "Cancelled": "text-red-600 border-red-600 bg-red-50"
    };
    return colors[tab] || "text-gray-600 border-gray-600 bg-gray-50";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6 sm:p-8 mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Package className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
              📦 Order Management
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Track, manage, and review all your orders in one convenient location
            </p>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 mb-8 overflow-hidden">
          {/* Desktop Tabs */}
          <div className="hidden sm:flex border-b border-gray-200">
            {Object.keys(tabs).map((tab) => {
              const Icon = getTabIcon(tab);
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  className={`flex-1 py-4 px-6 text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 relative ${
                    isActive
                      ? `${getTabColor(tab)} border-b-3`
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-full"></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile Dropdown */}
          <div className="sm:hidden border-b border-gray-200">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-full py-4 px-6 text-left font-semibold text-gray-700 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                {React.createElement(getTabIcon(activeTab), { className: "h-4 w-4" })}
                <span>{activeTab}</span>
              </div>
              <Calendar className={`h-4 w-4 transition-transform ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isMobileMenuOpen && (
              <div className="border-t border-gray-200 bg-gray-50">
                {Object.keys(tabs).map((tab) => {
                  const Icon = getTabIcon(tab);
                  return (
                    <button
                      key={tab}
                      className={`w-full py-3 px-6 text-left text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                        activeTab === tab
                          ? `${getTabColor(tab)}`
                          : "text-gray-600 hover:text-gray-800 hover:bg-white"
                      }`}
                      onClick={() => {
                        setActiveTab(tab);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                {React.createElement(getTabIcon(activeTab), { className: "h-5 w-5" })}
                {activeTab} Orders
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {activeTab === "All" 
                  ? "View and manage all your orders across all statuses"
                  : `View and manage your ${activeTab.toLowerCase()} orders`
                }
              </p>
            </div>
            
            {/* Orders Content */}
            <div className="mt-6">
              {tabs[activeTab]}
            </div>
          </div>
        </div>

        {/* Enhanced Product Sections */}
        <div className="space-y-8">
          {/* New Products Section */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">✨ New Products</h3>
                <p className="text-gray-600 text-sm">Discover the latest additions to our collection</p>
              </div>
            </div>
            <NewProducts />
          </div>

          {/* Trending Products Section */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">🔥 Trending Products</h3>
                <p className="text-gray-600 text-sm">Popular items other customers are ordering</p>
              </div>
            </div>
            <NewProducts />
          </div>

          {/* Recommended Section */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">💝 Recommended for You</h3>
                <p className="text-gray-600 text-sm">Personalized recommendations based on your order history</p>
              </div>
            </div>
            <NewProducts />
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="mt-12 bg-white/60 backdrop-blur-lg rounded-3xl shadow-lg border border-white/20 p-6 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Package className="h-4 w-4 text-white" />
              </div>
              <span className="text-gray-700 font-medium">Order Management System</span>
            </div>
            <div className="text-gray-500 text-sm">
              © {new Date().getFullYear()} EcoCys. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
