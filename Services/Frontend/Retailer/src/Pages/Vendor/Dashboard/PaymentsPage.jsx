import React, { useState } from "react";

const PaymentsPage = () => {
  const [activeTab, setActiveTab] = useState("incoming");

  // Dummy data
  const dummyPayments = {
    incoming: [
      { id: 1, buyer: "John Doe", amount: "₹1,500", date: "2025-04-03" },
      { id: 2, buyer: "Jane Smith", amount: "₹2,000", date: "2025-04-01" },
    ],
    inprogress: [
      { id: 3, buyer: "Michael Scott", amount: "₹800", date: "2025-03-30" },
    ],
    completed: [
      { id: 4, buyer: "Pam Beesly", amount: "₹3,000", date: "2025-03-25" },
      { id: 5, buyer: "Jim Halpert", amount: "₹2,200", date: "2025-03-20" },
    ],
  };

  const totalPayments = Object.values(dummyPayments)
    .flat()
    .reduce((sum, item) => sum + parseInt(item.amount.replace("₹", "")), 0);

  const totalTransactions = Object.values(dummyPayments).flat().length;

  return (
    <div className="p-6">
      {/* Tabs */}
      <div className="flex border-b w-[600px]">
        {["Incoming", "In Progress", "Completed"].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 text-lg font-semibold ${
              activeTab === tab.toLowerCase().replace(" ", "")
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab(tab.toLowerCase().replace(" ", ""))}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Total Payments & Transactions */}
      <div className="mt-6">
        <div className="flex bg-white shadow-sm px-6 py-4 w-[400px]">
          <div className="text-center w-1/2">
            <p className="text-gray-600 text-lg">Total Payments</p>
            <p className="text-2xl font-bold">₹{totalPayments}</p>
          </div>
          <div className="text-center w-1/2 border-l">
            <p className="text-gray-600 text-lg">Transactions</p>
            <p className="text-2xl font-bold">{totalTransactions}</p>
          </div>
        </div>
      </div>

      {/* Transaction List */}
      <div className="mt-6 w-[500px] bg-white shadow-sm p-6">
        {dummyPayments[activeTab].length === 0 ? (
          <p className="text-center text-gray-500 text-xl font-semibold">
            Nothing To Show Here......
          </p>
        ) : (
          dummyPayments[activeTab].map((payment) => (
            <div
              key={payment.id}
              className="flex justify-between border-b py-2 text-gray-700"
            >
              <span>{payment.buyer}</span>
              <span>{payment.amount}</span>
              <span>{payment.date}</span>
            </div>
          ))
        )}
      </div>

      {/* Video Tutorial Box */}
      <div className="mt-6">
        <div className="bg-black text-white p-6 rounded-lg relative w-[400px] h-[160px]">
          <p className="text-2xl font-semibold leading-snug">
            Adding Payment Methods & Manage Payments
          </p>
          <p className="text-lg mt-2">14 Mins</p>
          <button className="absolute bottom-4 left-4 bg-yellow-400 p-2 rounded-full">
            ▶️
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;
