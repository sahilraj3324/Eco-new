import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Search, Filter, Clock, Truck, CheckCircle2, AlertCircle, Eye, Calendar, ShoppingBag, Star, ArrowRight, Loader2 } from "lucide-react";

const getVariantForOrder = (order) => {
  if (!order.product || !order.variantId) return null;
  return (order.product.variants || []).find(
    v => (v.id || v.Id) === order.variantId
  );
};

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const storedUserId = localStorage.getItem("Id");

    if (!storedUserId) {
      setError("User ID not found. Please log in again.");
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        // Try API first
        const res = await fetch(`/api/order/buyer/${storedUserId}`);
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
          setFilteredOrders(data);
        } else {
          throw new Error(`API failed with status ${res.status}`);
        }
      } catch (err) {
        console.error('API Error:', err);
        // Fallback to localStorage for development
        const localOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        setOrders(localOrders);
        setFilteredOrders(localOrders);
        if (localOrders.length === 0) {
          setError("No orders found. Start shopping to see your orders here!");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    let filtered = orders;

    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(order =>
        order.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredOrders(filtered);
  }, [searchQuery, statusFilter, orders]);

  const handleOrderClick = (order) => {
    navigate(`/order-details/${order.id}`, { state: { order } });
  };

  const getStatusConfig = (status) => {
    const configs = {
      'pending': {
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Clock,
        bgGradient: 'from-yellow-50 to-orange-50'
      },
      'processing': {
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Package,
        bgGradient: 'from-blue-50 to-indigo-50'
      },
      'shipped': {
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        icon: Truck,
        bgGradient: 'from-purple-50 to-pink-50'
      },
      'delivered': {
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: CheckCircle2,
        bgGradient: 'from-green-50 to-emerald-50'
      },
      'cancelled': {
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: AlertCircle,
        bgGradient: 'from-red-50 to-pink-50'
      }
    };
    return configs[status?.toLowerCase()] || configs.pending;
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-12 text-center max-w-md w-full">
          <div className="relative mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
              <ShoppingBag className="h-10 w-10 text-white" />
            </div>
            <Loader2 className="absolute -bottom-1 -right-1 h-8 w-8 animate-spin text-blue-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Loading your orders</h3>
          <p className="text-gray-600">Fetching your purchase history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <ShoppingBag className="h-8 w-8 text-white" />
                </div>
                {orders.length > 0 && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-400 to-green-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    {orders.length}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  My Orders
                </h1>
                <p className="text-gray-600 mt-1">Track and manage your purchases</p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 py-3 px-6 rounded-2xl shadow-inner">
                <span className="text-sm text-gray-600">Total Orders</span>
                <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {orders.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders by product name or order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm"
              />
            </div>
            
            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-12 pr-8 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm appearance-none cursor-pointer"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          
          {/* Filter Pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status === "All" ? "" : status.toLowerCase())}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  (status === "All" && !statusFilter) || statusFilter === status.toLowerCase()
                    ? getStatusConfig(status.toLowerCase()).color.replace('100', '500').replace('800', 'white') + ' shadow-lg transform scale-105'
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:shadow-md'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-red-400 to-pink-500 rounded-2xl flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Oops! Something went wrong</h3>
                <p className="text-gray-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredOrders.length === 0 && orders.length === 0 && (
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-4">
              No orders yet!
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You haven't placed any orders yet. Start shopping to see your orders here!
            </p>
            <button
              onClick={() => navigate('/')}
              className="group bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 text-white py-4 px-8 rounded-2xl font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center gap-3 mx-auto"
            >
              <ShoppingBag className="h-5 w-5 transition-transform group-hover:scale-110" />
              Start Shopping
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        )}

        {/* No Search Results */}
        {!loading && !error && filteredOrders.length === 0 && orders.length > 0 && (
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No matching orders found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && filteredOrders.length > 0 && (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const variant = getVariantForOrder(order);
              const price = (variant?.price || variant?.Price || order.unitPrice || order.product?.price || 0);
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <div
                  key={order.id}
                  onClick={() => handleOrderClick(order)}
                  className="group bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02]"
                >
                  <div className={`bg-gradient-to-r ${statusConfig.bgGradient} p-6 border-b border-gray-100`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 bg-white/50 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                            <StatusIcon className="h-6 w-6 text-gray-700" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.color}`}>
                              {order.status?.charAt(0).toUpperCase() + order.status?.slice(1).toLowerCase()}
                            </span>
                            <span className="text-sm text-gray-600">Order #{order.id?.slice(0, 8)}...</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(order.orderDate || order.createdAt)}
                            </div>
                            <div className="flex items-center gap-1">
                              <Package className="h-4 w-4" />
                              Qty: {order.quantity}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                          ₹{price}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600">Rate Order</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center gap-6">
                      {/* Product Image */}
                      <div className="relative">
                        <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300">
                          <img
                            src={order.product?.mainImage || order.product?.imageUrls?.[0] || "/placeholder.png"}
                            alt={order.product?.name}
                            onError={(e) => (e.target.src = "/placeholder.png")}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        </div>
                        <div className="absolute -top-2 -left-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                          ✨ Premium
                        </div>
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">
                          {order.product?.name || 'Unknown Product'}
                        </h3>
                        {variant && (
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
                                style={{ backgroundColor: variant.color === 'Black' ? '#000' : variant.color === 'White' ? '#fff' : '#6B7280' }}
                              ></div>
                              <span className="text-sm font-medium text-gray-700">{variant.color || variant.Color}</span>
                            </div>
                            {(variant.size || variant.Size) && (
                              <div className="bg-gradient-to-r from-blue-100 to-purple-100 px-3 py-1 rounded-full">
                                <span className="text-sm font-medium text-gray-700">Size: {variant.size || variant.Size}</span>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Total: ₹{(price * order.quantity).toFixed(2)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-purple-600 group-hover:text-purple-800 transition-colors">
                            <Eye className="h-4 w-4" />
                            <span className="text-sm font-medium">View Details</span>
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllOrders;