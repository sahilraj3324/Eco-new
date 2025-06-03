import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Package, AlertCircle, Eye, Edit3, Pause, PauseCircle } from "lucide-react";

const Paused = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sellerid, setSellerid] = useState("");

  const navigate = useNavigate();

  // Step 1: Get seller ID from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem("Id");
    if (storedUserId) {
      setSellerid(storedUserId);
    } else {
      setLoading(false);
      setError("Seller ID not found.");
    }
  }, []);

  // Step 2: Fetch products once seller ID is available
  useEffect(() => {
    if (!sellerid) return;

    const fetchProducts = async () => {
      try {
        const res = await axios.get(`/api/Product/get-by-seller/${sellerid}`);
        const pausedProducts = res.data.filter((product) => product.status?.toLowerCase() === "paused");
        setProducts(pausedProducts);
        setFilteredProducts(pausedProducts);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [sellerid]);

  useEffect(() => {
    let filtered = products;

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  const handleProductClick = (id) => {
    navigate(`/product/${id}`);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Paused Products</h1>
                <p className="text-gray-600">Temporarily disabled products not visible to customers</p>
              </div>
              <div className="mt-4 lg:mt-0">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <PauseCircle className="h-4 w-4" />
                  <span>{filteredProducts.length} Paused Products</span>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by product name or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading paused products...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Products</h3>
            <p className="text-red-600">{error}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
            <PauseCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Paused Products</h3>
            <p className="text-gray-600">
              {searchQuery 
                ? "No paused products match your search criteria." 
                : "You don't have any paused products at the moment."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => handleProductClick(product.id)}
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                    {/* Product Info */}
                    <div className="flex items-center space-x-6 flex-1">
                      <div className="relative">
                        <img
                          src={product.mainImage || "/placeholder.png"}
                          alt={product.name}
                          onError={(e) => (e.target.src = "/placeholder.png")}
                          className="w-24 h-24 object-cover rounded-xl border-2 border-gray-200 opacity-75"
                        />
                        <div className="absolute -top-2 -right-2 bg-gray-600 text-white text-xs px-2 py-1 rounded-full font-medium">
                          ₹{product.price}
                        </div>
                        <div className="absolute -bottom-2 -left-2 bg-gray-500 text-white p-1 rounded-full">
                          <Pause className="h-4 w-4" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-1">
                          {product.name}
                        </h3>
                        
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                            <Pause className="w-4 h-4 mr-2" />
                            Paused
                          </div>
                          <span className="text-lg font-bold text-gray-500">₹{product.price}</span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>ID: {product.id.slice(0, 8)}...</span>
                          {product.category && (
                            <span>Category: {product.category}</span>
                          )}
                        </div>
                        
                        <div className="mt-2 text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-lg inline-block">
                          Not visible to customers
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3 lg:w-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductClick(product.id);
                        }}
                        className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </button>
                      
                      
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Paused;
