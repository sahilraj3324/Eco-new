import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Package, Clock, AlertCircle, CheckCircle, Truck, XCircle } from "lucide-react";
import useUser from "../../../hooks/useUser";

const getVariantForOrder = (order) => {
  if (!order.product || !order.variantId) return null;
  return (order.product.variants || []).find(
    v => (v.id || v.Id) === order.variantId
  );
};

const getColorValue = (colorName) => {
  if (!colorName) return '#6B7280'; // Default gray
  
  const colorMap = {
    // Basic colors
    'red': '#EF4444',
    'blue': '#3B82F6',
    'green': '#10B981',
    'yellow': '#F59E0B',
    'purple': '#8B5CF6',
    'pink': '#EC4899',
    'orange': '#F97316',
    'brown': '#A16207',
    'black': '#1F2937',
    'white': '#F9FAFB',
    'gray': '#6B7280',
    'grey': '#6B7280',
    
    // Extended colors
    'navy': '#1E3A8A',
    'maroon': '#7F1D1D',
    'lime': '#65A30D',
    'cyan': '#0891B2',
    'magenta': '#C2185B',
    'violet': '#7C3AED',
    'indigo': '#4F46E5',
    'teal': '#0D9488',
    'emerald': '#059669',
    'rose': '#F43F5E',
    'amber': '#D97706',
    'slate': '#475569',
    'zinc': '#52525B',
    'neutral': '#525252',
    'stone': '#57534E',
    
    // Specific shades
    'light blue': '#7DD3FC',
    'dark blue': '#1E40AF',
    'light green': '#86EFAC',
    'dark green': '#065F46',
    'light pink': '#F9A8D4',
    'dark pink': '#BE185D',
    'light purple': '#C4B5FD',
    'dark purple': '#581C87',
    'light gray': '#D1D5DB',
    'dark gray': '#374151',
    'light grey': '#D1D5DB',
    'dark grey': '#374151',
    
    // Fashion colors
    'beige': '#F5F5DC',
    'cream': '#FFFDD0',
    'ivory': '#FFFFF0',
    'khaki': '#F0E68C',
    'coral': '#FF7F50',
    'salmon': '#FA8072',
    'gold': '#FFD700',
    'silver': '#C0C0C0',
    'bronze': '#CD7F32',
    'turquoise': '#40E0D0',
    'olive': '#808000',
    'burgundy': '#800020',
    'mint': '#98FB98',
    'lavender': '#E6E6FA',
    'peach': '#FFCBA4',
    'mustard': '#FFDB58',
    'charcoal': '#36454F',
    'plum': '#DDA0DD',
    'forest': '#228B22',
    'sky': '#87CEEB'
  };
  
  const normalizedColor = colorName.toLowerCase().trim();
  return colorMap[normalizedColor] || '#6B7280';
};

const ColorIndicator = ({ color, size = 'w-3 h-3' }) => {
  const colorValue = getColorValue(color);
  const isLightColor = ['white', 'ivory', 'cream', 'beige', 'light gray', 'light grey'].includes(color?.toLowerCase());
  
  return (
    <div 
      className={`${size} rounded-full inline-block mr-1 ${isLightColor ? 'border border-gray-300' : ''}`}
      style={{ backgroundColor: colorValue }}
      title={color}
    />
  );
};

const ActiveOrders = () => {
  // Get user data from cookies via useUser hook
  const { user, loading: userLoading } = useUser();

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState({});
  const [cancellingOrders, setCancellingOrders] = useState({});
  const [messages, setMessages] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    if (userLoading) {
      return; // Wait for user data to load
    }

    if (!user) {
      setError("Seller ID not found.");
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const userIdValue = user.id || user.sellerId;
        const res = await axios.get(`/api/order/seller/${userIdValue}`);
        setOrders(res.data);
        setFilteredOrders(res.data);
      } catch (err) {
        console.error(err.response?.data || err.message || err);
        setError("Failed to fetch orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, userLoading]);

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

  const handleProductClick = (order) => {
    navigate(`/vendor/orders/details/${order.id}`, { 
      state: { order } 
    });
  };

  const handleStatusChange = (orderId, newStatus) => {
    setSelectedStatuses((prev) => ({ ...prev, [orderId]: newStatus }));
  };

  const handleSetStatus = async (orderId) => {
    const newStatus = selectedStatuses[orderId];
    if (!newStatus) return;

    try {
      await axios.put(
        `/api/order/${orderId}/status`,
        JSON.stringify(newStatus),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      alert("Status updated successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    }
  };

  const handleCancelOrder = async (order) => {
    if (order.status === 'Cancelled') return;
    
    setCancellingOrders(prev => ({ ...prev, [order.id]: true }));
    setMessages(prev => ({ ...prev, [order.id]: '' }));
    
    try {
      console.log('Starting order cancellation process...', {
        orderId: order.id,
        productId: order.productId,
        variantId: order.variantId,
        quantity: order.quantity
      });

      // 1. Update order status to Cancelled
      const statusRes = await fetch(`/api/Order/${order.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify('Cancelled'),
      });
      
      if (!statusRes.ok) {
        const errorData = await statusRes.json();
        throw new Error(`Failed to update order status: ${errorData.message || statusRes.statusText}`);
      }
      
      console.log('Order status updated to Cancelled');

      // 2. Re-add quantity to variant stock
      const productRes = await fetch(`/api/Product/${order.productId}`);
      if (!productRes.ok) {
        throw new Error(`Failed to fetch product: ${productRes.statusText}`);
      }
      
      const product = await productRes.json();
      console.log('Product fetched:', product.name);
      
      const variant = (product.variants || []).find(v => (v.id || v.Id) === order.variantId);
      if (!variant) {
        throw new Error(`Variant not found for ID: ${order.variantId}`);
      }
      
      const currentStock = parseInt(variant.stock || variant.Stock || 0, 10);
      const orderQuantity = parseInt(order.quantity, 10);
      const newStock = currentStock + orderQuantity;
      
      console.log('Stock calculation:', {
        currentStock,
        orderQuantity,
        newStock,
        variantColor: variant.color || variant.Color,
        variantSize: variant.size || variant.Size
      });

      const stockRes = await fetch(`/api/Product/update-variant-stock/${order.productId}/${order.variantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newStock: newStock })
      });
      
      if (!stockRes.ok) {
        const errorData = await stockRes.json();
        throw new Error(`Failed to update stock: ${errorData.message || stockRes.statusText}`);
      }
      
      console.log('Stock updated successfully');
      
      // Update local order state
      setOrders(prev => prev.map(o => 
        o.id === order.id ? { ...o, status: 'Cancelled' } : o
      ));
      
      setMessages(prev => ({ 
        ...prev, 
        [order.id]: `Order cancelled successfully! Stock restored: ${orderQuantity} units added back to ${variant.color || variant.Color} - ${variant.size || variant.Size}` 
      }));
      
    } catch (err) {
      console.error('Error cancelling order:', err);
      setMessages(prev => ({ 
        ...prev, 
        [order.id]: `Error: ${err.message}` 
      }));
    } finally {
      setCancellingOrders(prev => ({ ...prev, [order.id]: false }));
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, ring: 'ring-yellow-200' },
      'Processed': { bg: 'bg-blue-100', text: 'text-blue-800', icon: Package, ring: 'ring-blue-200' },
      'Shipped': { bg: 'bg-purple-100', text: 'text-purple-800', icon: Truck, ring: 'ring-purple-200' },
      'Delivered': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, ring: 'ring-green-200' },
      'Cancelled': { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, ring: 'ring-red-200' }
    };
    return configs[status] || configs['Pending'];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Active Orders</h1>
                <p className="text-gray-600">Manage your pending orders and track their status</p>
              </div>
              <div className="mt-4 lg:mt-0">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Package className="h-4 w-4" />
                  <span>{filteredOrders.filter(order => order.status === "Pending").length} Active Orders</span>
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by product name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 transition-colors"
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 transition-colors appearance-none min-w-[150px]"
                >
                  <option value="">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Processed">Processed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading orders...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Orders</h3>
            <p className="text-red-600">{error}</p>
          </div>
        ) : filteredOrders.filter(order => order.status === "Pending").length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Orders</h3>
            <p className="text-gray-600">You don't have any pending orders at the moment.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredOrders
              .filter((order) => order.status === "Pending")
              .map((order) => {
                const variant = getVariantForOrder(order);
                const statusConfig = getStatusConfig(order.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
                  >
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                        {/* Product Info */}
                        <div
                          className="flex items-center space-x-4 cursor-pointer group flex-1"
                          onClick={() => handleProductClick(order)}
                        >
                          <div className="relative">
                            <img
                              src={order.product.mainImage || "/placeholder.png"}
                              alt={order.product.name}
                              onError={(e) => (e.target.src = "/placeholder.png")}
                              className="w-20 h-20 object-cover rounded-xl border-2 border-gray-200 group-hover:border-blue-300 transition-colors"
                            />
                            <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                              {order.quantity}
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                              {order.product.name}
                            </h3>
                            
                            {variant && (
                              <div className="flex items-center flex-wrap gap-3 mt-2">
                                <div className="flex items-center">
                                  <ColorIndicator color={variant.color || variant.Color} size="w-4 h-4" />
                                  <span className="text-sm font-medium text-gray-700">
                                    {variant.color || variant.Color}
                                  </span>
                                </div>
                                {(variant.size || variant.Size) && (
                                  <div className="text-sm text-gray-500">
                                    Size: <span className="font-medium text-gray-700">{variant.size || variant.Size}</span>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            <div className="flex items-center space-x-4 mt-3">
                              <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {order.status}
                              </div>
                              <span className="text-lg font-bold text-green-600">₹{order.unitPrice}</span>
                              <span className="text-sm text-gray-500 font-semibold">Qty: {order.quantity}</span>
                            </div>
                            
                            <p className="text-xs text-gray-400 mt-1">Order ID: {order.id.slice(0, 8)}</p>
                            
                            {messages[order.id] && (
                              <div className={`mt-3 p-3 rounded-lg text-sm ${
                                messages[order.id].includes('Error') 
                                  ? 'bg-red-50 text-red-700 border border-red-200' 
                                  : 'bg-green-50 text-green-700 border border-green-200'
                              }`}>
                                {messages[order.id]}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col space-y-3 lg:w-64">
                          <select
                            value={selectedStatuses[order.id] || order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processed">Process</option>
                            <option value="Cancelled">Cancel</option>
                          </select>

                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleSetStatus(order.id)}
                              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 px-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-medium text-sm shadow-lg"
                            >
                              Update Status
                            </button>
                            
                            {order.status !== 'Cancelled' && (
                              <button
                                onClick={() => handleCancelOrder(order)}
                                disabled={cancellingOrders[order.id]}
                                className="bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-lg hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-sm shadow-lg"
                              >
                                {cancellingOrders[order.id] ? (
                                  <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                                    <span className="text-xs">Cancelling...</span>
                                  </div>
                                ) : (
                                  'Cancel'
                                )}
                              </button>
                            )}
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

export default ActiveOrders;
