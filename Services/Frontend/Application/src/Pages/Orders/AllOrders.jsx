import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch('https://localhost:7209/api/Order')
      .then(res => res.json())
      .then(data => {
        setOrders(data);
        setFilteredOrders(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to fetch orders');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let filtered = orders;

    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(order =>
        order.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredOrders(filtered);
  }, [searchQuery, statusFilter, orders]);

  const handleProductClick = (id) => {
    navigate(`/product/${id}`);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
        <p className="text-gray-500">View and manage your orders</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search orders..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setStatusFilter("")}
          className={`px-4 py-2 rounded-full text-sm font-medium ${!statusFilter ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
        >
          All
        </button>
        <button
          onClick={() => setStatusFilter("Pending")}
          className={`px-4 py-2 rounded-full text-sm font-medium ${statusFilter === "Pending" ? 'bg-yellow-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
        >
          Pending
        </button>
        <button
          onClick={() => setStatusFilter("Shipped")}
          className={`px-4 py-2 rounded-full text-sm font-medium ${statusFilter === "Shipped" ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
        >
          Shipped
        </button>
        <button
          onClick={() => setStatusFilter("Delivered")}
          className={`px-4 py-2 rounded-full text-sm font-medium ${statusFilter === "Delivered" ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
        >
          Delivered
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredOrders.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p className="text-lg">No orders found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Orders List */}
      {!loading && !error && filteredOrders.length > 0 && (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => handleProductClick(order.product.id)}
              className="bg-white rounded-xl shadow-sm p-4 flex items-start space-x-3 active:bg-gray-50"
            >
              <div className="flex-shrink-0">
                <img
                  src={order.product.mainImage || "/placeholder.png"}
                  alt={order.product.name}
                  onError={(e) => (e.target.src = "/placeholder.png")}
                  className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-medium text-gray-900 truncate">{order.product.name}</h3>
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusColor(order.status)}`}>
                  {order.status}
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">₹{order.unitPrice}</span>
                  <span className="text-sm text-gray-500">Qty: {order.quantity}</span>
                </div>
              </div>
              <div className="text-xs text-gray-400">
                #{order.id.slice(0, 6)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AllOrders;