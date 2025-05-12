import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ActiveOrder = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState({});

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

  return (
    <div className="p-6 max-w-5xl mx-auto">

      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4 gap-2">
        <input
          type="text"
          placeholder="Search by product name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-gray-100 p-2 rounded-full w-full md:w-1/2"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-100 p-2 rounded-full w-full md:w-1/4"
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Processed">Processed</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
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
          {filteredOrders
          .filter((order) => order.status === "Pending")
          .map((order) => (
            <li
              key={order.id}
              className="p-4 bg-white rounded-lg shadow flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0"
            >
              <div
                className="flex items-center cursor-pointer"
                onClick={() => handleProductClick(order.product.id)}
              >
                <img
                  src={order.product.mainImage || "/placeholder.png"}
                  alt={order.product.name}
                  onError={(e) => (e.target.src = "/placeholder.png")}
                  className="w-20 h-20 object-cover rounded border"
                />
                <div className="ml-4">
                  <p className="text-lg font-semibold">{order.product.name}</p>
                  <p className="text-sm text-gray-600 capitalize">Current: {order.status}</p>
                  <p className="text-sm text-gray-700 mt-1">₹{order.unitPrice}</p>
                  <p className="text-sm text-gray-700 mt-1">Qty: {order.quantity}</p>
                  <p className="text-sm text-gray-500 mt-1">Order ID: {order.id.slice(0, 6)}...</p>
                </div>
              </div>

              <div className="flex flex-col space-y-2 items-start">
                <select
                  value={selectedStatuses[order.id] || order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className="bg-gray-100 p-2 rounded"
                >
                  <option value="Pending">Pending</option>
                  <option value="Processed">Processed</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                <button
                  onClick={() => handleSetStatus(order.id)}
                  className="bg-cyan-500 text-white px-4 py-1 rounded-full hover:bg-cyan-600"
                >
                  Set Status
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ActiveOrder;
