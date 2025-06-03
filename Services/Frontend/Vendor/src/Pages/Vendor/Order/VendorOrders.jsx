import React, { useState } from "react";
import { Package, Clock, Ship, Truck, CheckCircle, XCircle, ShoppingBag } from "lucide-react";
import Allorder from "./AllOrders";
import ActiveOrder from "./ActiveOrders";
import ReadyToShip from "./ReadyToShip";
import Dispached from "./Dispached";
import Delivered from "./Delivered";
import Canceled from "./Canceled";

const VendorOrders = () => {
  const [activeTab, setActiveTab] = useState("All");

  const tabs = {
    "All": { 
      component: <Allorder />, 
      icon: ShoppingBag, 
      label: "All Orders",
      description: "View all orders"
    },
    "Active": { 
      component: <ActiveOrder />, 
      icon: Clock, 
      label: "Active",
      description: "Pending orders"
    },
    "Ready To Ship": { 
      component: <ReadyToShip />, 
      icon: Ship, 
      label: "Ready To Ship",
      description: "Processed orders"
    },
    "Dispached": { 
      component: <Dispached />, 
      icon: Truck, 
      label: "Dispatched",
      description: "Shipped orders"
    },
    "Completed": { 
      component: <Delivered />, 
      icon: CheckCircle, 
      label: "Completed",
      description: "Delivered orders"
    },
    "Cancelled": { 
      component: <Canceled />, 
      icon: XCircle, 
      label: "Cancelled",
      description: "Cancelled orders"
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
                <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Manage and track all your orders from one place
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
              activeTab === "Active" ? "bg-yellow-100" :
              activeTab === "Ready To Ship" ? "bg-indigo-100" :
              activeTab === "Dispached" ? "bg-purple-100" :
              activeTab === "Completed" ? "bg-green-100" :
              "bg-red-100"
            }`}>
              {React.createElement(tabs[activeTab].icon, { 
                className: `h-5 w-5 ${
                  activeTab === "All" ? "text-blue-600" :
                  activeTab === "Active" ? "text-yellow-600" :
                  activeTab === "Ready To Ship" ? "text-indigo-600" :
                  activeTab === "Dispached" ? "text-purple-600" :
                  activeTab === "Completed" ? "text-green-600" :
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

export default VendorOrders;