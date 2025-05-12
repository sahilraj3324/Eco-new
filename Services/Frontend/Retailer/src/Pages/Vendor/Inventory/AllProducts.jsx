import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const storedUserId = localStorage.getItem("Id");

    if (!storedUserId) {
      setError("Seller ID not found.");
      setLoading(false);
      return;
    }

    const fetchProducts = async () => {
      try {
        const res = await axios.get(`/api/Product/get-by-seller/${storedUserId}`);
        setProducts(res.data);
      } catch (err) {
        console.error(err.response?.data || err.message || err);
        setError("Failed to fetch products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleProductClick = (id) => {
    navigate(`/product/${id}`);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <ul className="space-y-4">
          {products.map((product) => (
            <li
              key={product.id}
              className="p-4 bg-white rounded-lg shadow hover:bg-gray-50 cursor-pointer flex items-center"
              onClick={() => handleProductClick(product.id)}
            >
              <img
                src={product.mainImage || "/placeholder.png"}
                alt={product.name}
                onError={(e) => (e.target.src = "/placeholder.png")}
                className="w-20 h-20 object-cover rounded border"
              />
              <div className="ml-4 flex-1">
                <p className="text-lg font-semibold">{product.name}</p>
                <p className="text-sm text-gray-600 capitalize">Status: {product.status}</p>
                <p className="text-sm text-gray-700 mt-1">₹{product.price}</p>
              </div>
              <div className="text-sm text-gray-500">
                ID: {product.id.slice(0, 6)}...
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AllProducts;
