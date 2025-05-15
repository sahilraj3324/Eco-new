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
    <div key={key} className="mb-4">
      <h4 className="font-semibold text-gray-700 mb-1">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {availableFilters[key]?.map((option) => (
          <button
            key={option}
            onClick={() => handleFilterChange(key, option)}
            className={`px-2 py-1 border rounded-full text-sm ${
              filters[key] === option
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="flex gap-4 px-4 mt-6">
        <aside className="hidden md:block w-64 bg-white p-4 rounded-xl shadow overflow-y-auto max-h-[80vh]">
          <h3 className="font-semibold text-gray-700 mb-3">Filters</h3>
          <button
            onClick={() => setFilters({})}
            className="mb-4 text-sm text-blue-500"
          >
            Clear Filters
          </button>
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
        </aside>

        <main className="flex-1">
          <h1 className="text-2xl font-bold text-center mb-2">Category Name Here</h1>
          <p className="text-center text-gray-600 mb-6">
            Found {filteredProducts.length} items
          </p>

          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.slice(0, visibleCount).map((product, index) => (
                <Link
                                key={product.id || index}
                                to={`/product/${product.id}`}
                                className="bg-white p-3 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer"
                              >
                <div
                  key={index}
                  className=""
                >
                  <div className="relative">
                    <img
                      src={product.mainImage || "/placeholder.png"}
                      alt={product.name}
                      onError={(e) => (e.target.src = "/placeholder.png")}
                      className="w-full h-48 object-cover rounded"
                    />
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      {index % 4 === 0
                        ? "Recently Added"
                        : index % 4 === 1
                        ? "Top Rated"
                        : index % 4 === 2
                        ? "Trending"
                        : "Top Pick Of Day"}
                    </span>
                  </div>
                  <h3 className="mt-2 font-medium text-sm line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Sold by {product.sellerType || "Wholesaler"}
                  </p>
                  <p className="text-sm font-semibold mt-1">
                    ₹{product.price} / Per Pack
                  </p>
                </div>
                </Link>
              ))}
            </div>
          )}

          {visibleCount < filteredProducts.length && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setVisibleCount((prev) => prev + 12)}
                className="bg-blue-500 text-white px-6 py-2 rounded-full shadow hover:bg-blue-600 transition"
              >
                Load More
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AllProductsPage;
