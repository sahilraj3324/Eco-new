// This updated version enables dynamic filters for your product listing page
// NOTE: Ensure this code is added inside your AllProductsPage component

import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "../../../assets/logo.png";

const AllProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(12);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [availableFilters, setAvailableFilters] = useState({});

  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("q")?.toLowerCase() || "";

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const res = await axios.get("/api/Product/get-all");
        let fetched = res.data;

        if (searchQuery) {
          fetched = fetched.filter((p) =>
            p.name.toLowerCase().includes(searchQuery)
          );
        }

        setProducts(fetched);
        extractAvailableFilters(fetched);
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, [searchQuery]);

  useEffect(() => {
    applyFilters();
  }, [filters, products]);

  const extractAvailableFilters = (data) => {
    const all = {
      category: new Set(),
      subcategory: new Set(),
      brand: new Set(),
      material: new Set(),
      size: new Set(),
      color: new Set(),
      fitShape: new Set(),
      neckType: new Set(),
      occasion: new Set(),
      pattern: new Set(),
      sleeveLength: new Set(),
    };

    data.forEach((p) => {
      all.category.add(p.category);
      all.subcategory.add(p.subcategory);
      all.brand.add(p.brand);
      all.material.add(p.material);
      all.fitShape.add(p.fitShape);
      all.neckType.add(p.neckType);
      all.occasion.add(p.occasion);
      all.pattern.add(p.pattern);
      all.sleeveLength.add(p.sleeveLength);
      p.variants?.forEach((variant) => {
        all.size.add(variant.size);
        all.color.add(variant.color);
      });
    });

    // Convert Sets to arrays
    const converted = {};
    Object.keys(all).forEach((key) => {
      converted[key] = Array.from(all[key]).filter(Boolean);
    });

    setAvailableFilters(converted);
  };

  const applyFilters = () => {
    let result = [...products];
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter((p) => {
          if (key === "size" || key === "color") {
            return p.variants?.some((v) => v[key] === value);
          } else {
            return p[key] === value;
          }
        });
      }
    });
    setFilteredProducts(result);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? null : value,
    }));
  };

  const renderFilterOptions = (title, key) => (
    <div key={key} className="border-b border-gray-100 pb-4 last:border-b-0">
      <h4 className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wider">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {availableFilters[key]?.map((option) => (
          <button
            key={option}
            onClick={() => handleFilterChange(key, option)}
            className={`px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              filters[key] === option
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md transform scale-105"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-9xl mx-auto flex gap-6 px-4 py-8">
        {/* Enhanced Sidebar */}
        <aside className="hidden md:block w-72 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 overflow-y-auto max-h-[85vh] sticky top-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Filters</h3>
            <button
              onClick={() => setFilters({})}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
            >
              Clear All
            </button>
          </div>
          
          <div className="space-y-6">
            {renderFilterOptions("Category", "category")}
            {renderFilterOptions("Subcategory", "subcategory")}
            {renderFilterOptions("Brand", "brand")}
            {renderFilterOptions("Material", "material")}
            {renderFilterOptions("Size", "size")}
            {renderFilterOptions("Color", "color")}
            {renderFilterOptions("Fit Shape", "fitShape")}
            {renderFilterOptions("Neck Type", "neckType")}
            {renderFilterOptions("Occasion", "occasion")}
            {renderFilterOptions("Pattern", "pattern")}
            {renderFilterOptions("Sleeve Length", "sleeveLength")}
          </div>
        </aside>

        <main className="flex-1">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">All Products</h1>
            <p className="text-gray-600 text-lg">
              Found {filteredProducts.length} amazing products
            </p>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-green-500 mx-auto mt-4"></div>
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600 mb-4"></div>
              <p className="text-gray-600 text-lg">Loading amazing products...</p>
            </div>
          ) : (
            <>
              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
                {filteredProducts.slice(0, visibleCount).map((product, index) => (
                  <Link
                    key={product.id || index}
                    to={`/product/${product.id}`}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 hover:border-blue-200"
                  >
                    <div className="relative overflow-hidden">
                      <span className={`absolute top-3 left-3 text-white text-xs font-medium px-3 py-1 rounded-full shadow-lg z-10 ${
                        index % 4 === 0
                          ? "bg-gradient-to-r from-green-500 to-green-600"
                          : index % 4 === 1
                          ? "bg-gradient-to-r from-blue-500 to-blue-600"
                          : index % 4 === 2
                          ? "bg-gradient-to-r from-purple-500 to-purple-600"
                          : "bg-gradient-to-r from-orange-500 to-orange-600"
                      }`}>
                        {index % 4 === 0
                          ? "New"
                          : index % 4 === 1
                          ? "Top Rated"
                          : index % 4 === 2
                          ? "Trending"
                          : "Top Pick"}
                      </span>
                      <img
                        src={product.mainImage || "/placeholder.png"}
                        alt={product.name}
                        onError={(e) => (e.target.src = "/placeholder.png")}
                        className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                        {product.name}
                      </h3>
                      <p className="text-gray-500 text-sm mb-3 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Sold by {product.sellerType || "Manufacturer"}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-xl text-gray-900">
                          ₹{product.price}
                          <span className="text-sm font-normal text-gray-500 ml-1">per pack</span>
                        </p>
                        <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-200">
                          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Load More Section */}
              {visibleCount < filteredProducts.length && (
                <div className="text-center py-8">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 12)}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-full hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Load More Products
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <p className="text-gray-500 text-sm mt-3">
                    Showing {visibleCount} of {filteredProducts.length} products
                  </p>
                </div>
              )}

              {/* End Message */}
              {visibleCount >= filteredProducts.length && filteredProducts.length > 0 && (
                <div className="text-center py-12 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">You've seen it all!</h3>
                    <p className="text-gray-600">You've viewed all {filteredProducts.length} available products.</p>
                  </div>
                </div>
              )}

              {/* No Products */}
              {filteredProducts.length === 0 && !loading && (
                <div className="text-center py-16">
                  <div className="max-w-md mx-auto">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-2.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 009.586 13H7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Products Found</h3>
                    <p className="text-gray-600">Try adjusting your filters or search criteria.</p>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AllProductsPage;
