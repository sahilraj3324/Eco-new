import React, { useState } from "react";

const OrdersPage = () => {
  const [activeTab, setActiveTab] = useState("New Orders");

  const tabs = {
    "New Orders": <>hii</>,
    "Active Orders": <>hii</>,
    "Ready To Ship": <>hii</>,
    "Dispatched":<>hii</>,
    "Completed": <>hii</>,
    "Cancelled": <>hii</>,
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
      <div className="mt-4 flex items-center border p-2 rounded-md bg-gray-100 w-96">
        <span className="text-gray-400">🔍</span>
        <input
          type="text"
          placeholder="Search by Product Name / SKU ID"
          className="ml-2 bg-transparent outline-none w-full"
        />
      </div>

      {/* Orders Content */}
      <div className="mt-4 p-6 bg-white border rounded-md">
        <p className="text-center text-gray-500 text-lg font-semibold">Order Details</p>
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
  );
};

export default OrdersPage;
