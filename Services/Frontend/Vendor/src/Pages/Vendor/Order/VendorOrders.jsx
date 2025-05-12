import React, { useState } from "react";
import Allorder from "./AllOrders";
import ActiveOrder from "./ActiveOrders";
import ReadyToShip from "./ReadyToShip";
import Dispached from "./Dispached";
import Delivered from "./Delivered";
import Canceled from "./Canceled";

const VendorOrders = () => {
    const [activeTab, setActiveTab] = useState("All");
  
    const tabs = {
      "All": <Allorder />,
      "Active":<ActiveOrder />,
      "Ready To Ship" : <ReadyToShip />,
      "Dispached": <Dispached />,
      "Completed" : <Delivered />,
      "Cancled" :<Canceled />
      
    };
  return (
    <div className="p-6">
      {/* Tabs */}
      <div className="flex border-b">
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
      <div className="mt-4 p-6 bg-white  rounded-md">
        <div className="mt-4 space-y-3">{tabs[activeTab]}</div>
      </div>
      {/* Info Box */}
      <div className="mt-4 w-64 p-4 bg-black text-white rounded-md">
        <p className="font-bold text-lg">Managing Orders & Tracking Sales</p>
        <p>Ecocys Seller</p>
        <p>14 Mins</p>
        <span className="text-yellow-500 text-xl">▶</span>
      </div>
    </div>
  )
}

export default VendorOrders