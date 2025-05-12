import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "../../../assets/logo.png";

const AllProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(12);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("q")?.toLowerCase() || "";

  const footerSections = [
    {
      title: "Explore",
      links: ["Top Products", "Trending Products", "New Products", "Find Vendors", "Post Requirements", "View All"]
    },
    {
      title: "Seller",
      links: ["Become A Seller", "Add Products", "Manage Products", "My Profile", "Orders", "Payments", "Dashboard"]
    },
    {
      title: "Quick Links",
      links: ["Help & Support", "About Ecocys", "FAQs", "Privacy Policy", "Refund Policy", "Terms Of Use"]
    },
    {
      title: "User",
      links: ["My Cart", "My Wishlist", "My Account", "Help & Support"]
    },
    {
      title: "Social",
      links: ["Instagram", "Facebook", "YouTube", "Twitter"]
    }
  ];

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
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, [searchQuery]);

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      navigate(`?q=${e.target.value}`);
    }
  };

  const filters = [
    "Gender",
    "Color",
    "Fabric",
    "Size",
    "Price",
    "Sort by",
    "State",
    "Seller Type",
  ];

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-center justify-between p-4 bg-white shadow-md rounded-2xl gap-4 mx-4 mt-4">
        <div className="flex items-center gap-2">
          <img src={logo} alt="EcoCys Logo" className="h-10 w-auto" />
        </div>

        <input
          type="text"
          placeholder="Search Products, Sellers & More..."
          onKeyDown={handleSearch}
          className="border rounded-full px-4 py-2 w-full max-w-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <button
          className="md:hidden text-gray-700"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav
          className={`w-full md:w-auto flex-col md:flex-row md:flex flex-wrap items-center justify-center md:justify-end gap-4 text-sm text-gray-700 transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? "flex" : "hidden md:flex"
          }`}
        >
          {["Men", "Women", "Boy", "Girl", "View All", "Become A Seller"].map((link) => (
            <Link key={link} href="#" className="text-black font-medium text-decoration-none"  >
              {link}
            </Link>
          ))}
        </nav>
      </header>

      {/* Main Layout */}
      <div className="flex gap-4 px-4 mt-6">
        {/* Sidebar Filters */}
        <aside className="hidden md:block w-64 bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold text-gray-700 mb-3">Filter & Search</h3>
          <button className="mb-4 text-sm text-blue-500">Clear Filters</button>
          {filters.map((filter) => (
            <div key={filter} className="py-2 border-b text-gray-600 flex justify-between">
              {filter}
              <span>+</span>
            </div>
          ))}
        </aside>

        {/* Products Section */}
        <main className="flex-1">
          <h1 className="text-2xl font-bold text-center mb-2">Category Name Here</h1>
          <p className="text-center text-gray-600 mb-6">
            Found {products.length} items
          </p>

          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.slice(0, visibleCount).map((product, index) => (
                <div key={index} className="bg-white p-3 rounded-lg shadow-md hover:shadow-lg transition cursor-pointer">
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
                  <p className="text-xs text-gray-500">Sold by {product.sellerType || "Wholesaler"}</p>
                  <p className="text-sm font-semibold mt-1">₹{product.price} / Per Pack</p>
                </div>
              ))}
            </div>
          )}

          {visibleCount < products.length && (
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
      <footer className="py-10 mt-10 bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 text-sm text-gray-600">
          {footerSections.map((section, index) => (
            <div key={index}>
              <h4 className="mb-3 font-bold text-gray-800">{section.title}</h4>
              {section.links.map(link => (
                <a key={link} href="#" className="block hover:text-purple-500 transition">
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">
          © 2025 EcoCys. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
};

export default AllProductsPage;
