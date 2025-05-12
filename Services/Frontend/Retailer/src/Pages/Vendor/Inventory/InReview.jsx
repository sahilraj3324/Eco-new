import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const InReview = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
        setProducts(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [sellerid]);

  const handleProductClick = (id) => {
    navigate(`/product/${id}`);
  };
  return (
    <div className="p-6 max-w-4xl mx-auto">
    
    {loading ? (
      <p className="text-gray-500">Loading...</p>
    ) : error ? (
      <p className="text-red-500">{error}</p>
    ) : products.length === 0 ? (
      <p className="text-gray-500">No products found.</p>
    ) : (
        <ul className="space-y-3">
        {products
          .filter((product) => product.status?.toLowerCase() === "in review")
          .map((product) => (
            <li
              key={product.id}
              className="p-4 bg-white shadow hover:bg-gray-100 rounded cursor-pointer flex justify-between items-center"
              onClick={() => handleProductClick(product.id)}
            >
              <span className="font-medium">{product.name}</span>
              <span className="text-sm text-yellow-400 capitalize">{product.status}</span>
            </li>
          ))}
      </ul>
    )}
  </div>
  )
}

export default InReview
