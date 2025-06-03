import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Package, Clock, AlertCircle, CheckCircle, Truck, XCircle, ShoppingBag } from "lucide-react";

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

const Allorder = () => {
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
      setError("Seller ID not found.");
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await axios.get(`/api/order/seller/${storedUserId}`);
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

  const handleProductClick = (order) => {
    navigate(`/vendor/orders/details/${order.id}`, { 
      state: { order } 
    });
  };

  const getStatusConfig = (status) => {
    const configs = {
      'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      'Processed': { bg: 'bg-blue-100', text: 'text-blue-800', icon: Package },
      'Shipped': { bg: 'bg-purple-100', text: 'text-purple-800', icon: Truck },
      'Delivered': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      'Cancelled': { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle }
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">All Orders</h1>
                <p className="text-gray-600">View and manage all your orders across all statuses</p>
              </div>
              <div className="mt-4 lg:mt-0">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <ShoppingBag className="h-4 w-4" />
                  <span>{filteredOrders.length} Total Orders</span>
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
                  <option value="">All Statuses</option>
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
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Found</h3>
            <p className="text-gray-600">No orders match your current search and filter criteria.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredOrders.map((order) => {
              const variant = getVariantForOrder(order);
              const statusConfig = getStatusConfig(order.status);
              const StatusIcon = statusConfig.icon;
              
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                  onClick={() => handleProductClick(order)}
                >
                  <div className="p-6">
                    <div className="flex items-center space-x-6">
                      {/* Product Image */}
                      <div className="relative">
                        <img
                          src={order.product.mainImage || "/placeholder.png"}
                          alt={order.product.name}
                          onError={(e) => (e.target.src = "/placeholder.png")}
                          className="w-24 h-24 object-cover rounded-xl border-2 border-gray-200"
                        />
                        <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                          {order.quantity}
                        </div>
                      </div>
                      
                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                          {order.product.name}
                        </h3>
                        
                        {variant && (
                          <div className="flex items-center flex-wrap gap-4 mb-3">
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
                        
                        <div className="flex items-center space-x-6">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                            <StatusIcon className="w-4 h-4 mr-2" />
                            {order.status}
                          </div>
                          <span className="text-lg font-bold text-green-600">₹{order.unitPrice}</span>
                          <span className="text-sm text-gray-500">Quantity: {order.quantity}</span>
                        </div>
                      </div>
                      
                      {/* Order Info */}
                      <div className="text-right">
                        <div className="text-sm text-gray-500 mb-1">Order ID</div>
                        <div className="font-mono text-sm font-medium text-gray-900">
                          {order.id.slice(0, 8)}...
                        </div>
                        <div className="text-xs text-gray-400 mt-2">
                          Total: ₹{order.unitPrice * order.quantity}
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

export default Allorder;
