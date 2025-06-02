import React, { useState } from "react";

import Allorder from "./AllOrders";

import NewProducts from "../Home/Newproduct";


const RetailerOrders = () => {
    const [activeTab, setActiveTab] = useState("All");
     const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
      
  
    const tabs = {
      "All": <Allorder />,
      
    };
  return (
    <div className="p-1">
        
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
        <div className="mt-4 space-y-">{tabs[activeTab]}</div>
      </div>

      {/* Info Box */}

      <NewProducts />
      <NewProducts />
      
    </div>
  )
}

export default RetailerOrders