import React, { useState } from "react";
import { Plus, Upload, Package, FileSpreadsheet } from "lucide-react";
import SingleProduct from "./SingleProduct";
import BulkUpload from "./BulkUpload";

const AddProduct = () => {
  const [activeTab, setActiveTab] = useState("Add Single Product");

  const tabs = {
    "Add Single Product": { 
      component: <SingleProduct />, 
      icon: Plus, 
      label: "Single Product",
      description: "Add one product at a time with detailed information"
    },
    "Bulk Upload": { 
      component: <BulkUpload />, 
      icon: FileSpreadsheet, 
      label: "Bulk Upload",
      description: "Upload multiple products using CSV file"
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
                <h1 className="text-3xl font-bold text-gray-900">Add Products</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Add new products to your catalog individually or in bulk
                </p>
              </div>
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                <Package className="h-5 w-5" />
                <span>Product Management</span>
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
      

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        <div className="transition-all duration-300 ease-in-out">
          {tabs[activeTab].component}
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
