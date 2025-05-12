import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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

  const handleProductClick = (id) => {
    navigate(`/product/${id}`);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">All Orders</h1>

      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4 gap-2">
        <input
          type="text"
          placeholder="Search by product name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border p-2 rounded w-full md:w-1/2"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded w-full md:w-1/4"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : filteredOrders.length === 0 ? (
        <p className="text-gray-500">No matching orders found.</p>
      ) : (
        <ul className="space-y-4">
          {filteredOrders.map((order) => (
            <li
              key={order.id}
              className="p-4 bg-white rounded-lg shadow hover:bg-gray-50 cursor-pointer flex items-center"
              onClick={() => handleProductClick(order.product.id)}
            >
              <img
                src={order.product.mainImage || "/placeholder.png"}
                alt={order.product.name}
                onError={(e) => (e.target.src = "/placeholder.png")}
                className="w-20 h-20 object-cover rounded border"
              />
              <div className="ml-4 flex-1">
                <p className="text-lg font-semibold">{order.product.name}</p>
                <p className="text-sm text-gray-600 capitalize">Status: {order.status}</p>
                <p className="text-sm text-gray-700 mt-1">₹{order.unitPrice}</p>
                <p className="text-sm text-gray-700 mt-1">Quantity: {order.quantity}</p>
              </div>
              <div className="text-sm text-gray-500">
                Order ID: {order.id.slice(0, 6)}...
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Allorder;
