import React, { useState } from "react";
import { Package, ShoppingBag, Clock, CheckCircle, Pause, XCircle, Eye } from "lucide-react";
import AllProducts from './AllProducts';
import ActiveProduct from "./ActiveProducts";
import InReview from "./InReview";
import Paused from "./PausedProducts";
import Rejected from "./Rejected";

const VendorProducts = () => {
  const [activeTab, setActiveTab] = useState("All");

  const tabs = {
    "All": { 
      component: <AllProducts />, 
      icon: ShoppingBag, 
      label: "All Products",
      description: "View all your products"
    },
    "Active": { 
      component: <ActiveProduct />, 
      icon: CheckCircle, 
      label: "Active",
      description: "Live products in store"
    },
    "In Review": { 
      component: <InReview />, 
      icon: Clock, 
      label: "In Review",
      description: "Products under review"
    },
    "Paused": { 
      component: <Paused />, 
      icon: Pause, 
      label: "Paused",
      description: "Temporarily disabled products"
    },
    "Rejected": { 
      component: <Rejected />, 
      icon: XCircle, 
      label: "Rejected",
      description: "Products that need attention"
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Product Inventory</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Manage your product catalog and inventory from one place
                </p>
              </div>
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                <Package className="h-5 w-5" />
                <span>Vendor Dashboard</span>
              </div>
            </div>
          </div>

          {/* Tabs Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {Object.entries(tabs).map(([key, tab]) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === key;
                
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                      isActive
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <IconComponent 
                      className={`mr-2 h-5 w-5 transition-colors duration-200 ${
                        isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
                      }`}
                    />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{key}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Active Tab Description */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${
              activeTab === "All" ? "bg-blue-100" :
              activeTab === "Active" ? "bg-green-100" :
              activeTab === "In Review" ? "bg-yellow-100" :
              activeTab === "Paused" ? "bg-gray-100" :
              "bg-red-100"
            }`}>
              {React.createElement(tabs[activeTab].icon, { 
                className: `h-5 w-5 ${
                  activeTab === "All" ? "text-blue-600" :
                  activeTab === "Active" ? "text-green-600" :
                  activeTab === "In Review" ? "text-yellow-600" :
                  activeTab === "Paused" ? "text-gray-600" :
                  "text-red-600"
                }`
              })}
            </div>
            <div className="ml-3">
              <h2 className="text-lg font-medium text-gray-900">
                {tabs[activeTab].label}
              </h2>
              <p className="text-sm text-gray-500">
                {tabs[activeTab].description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        <div className="transition-all duration-300 ease-in-out">
          {tabs[activeTab].component}
        </div>
      </div>
    </div>
  );
};

export default VendorProducts;
