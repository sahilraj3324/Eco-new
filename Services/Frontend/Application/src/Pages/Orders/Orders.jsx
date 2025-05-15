import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import productImg from '../../assets/men shirts.png';
import cartImg from '../../assets/cart.png';
import logoImg from '../../assets/shop vector icon.png';
import NewProductsSection from '../Homepage/NewProducts';

const MyOrders = () => {
  const [activeTab, setActiveTab] = useState('Active');
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = ['Active', 'Past', 'Cancelled'];
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserId = localStorage.getItem('Id');

    if (!storedUserId) {
      setError('Seller ID not found.');
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await axios.get(`/api/order/buyer/${storedUserId}`);
        setOrders(res.data);
        setFilteredOrders(res.data);
      } catch (err) {
        console.error(err.response?.data || err.message || err);
        setError('Failed to fetch orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    const filtered = orders.filter((order) => {
      const matchesStatus =
        activeTab === 'Active'
          ? order.status === 'active'
          : activeTab === 'Past'
          ? order.status === 'completed'
          : order.status === 'cancelled';

      const matchesSearch = order.productName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) || order.sku?.includes(searchQuery);

      return matchesStatus && matchesSearch;
    });

    setFilteredOrders(filtered);
  }, [orders, activeTab, searchQuery]);

  const handleTabClick = (tab) => setActiveTab(tab);

  const handleLogoClick = () => navigate('/');
  const handleCartClick = () => navigate('/cart');
  const handleSearch = (e) => setSearchQuery(e.target.value);

  const dummyProducts = Array(4).fill({
    name: 'Stylish Glamorous Men Shirts',
    seller: 'Vishwakar',
    price: '₹949/- Per Pack',
    tag: 'Recently Added',
    image: productImg,
  });

  return (
    <div className="font-sans p-3 w-full min-h-screen box-border overflow-x-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-5 w-full">
        <img
          src={logoImg}
          alt="Logo"
          className="h-9 cursor-pointer"
          onClick={handleLogoClick}
        />
        <img
          src={cartImg}
          alt="Cart"
          className="h-7 cursor-pointer"
          onClick={handleCartClick}
        />
      </div>

      {/* Title */}
      <div className="text-center text-xl font-bold text-gray-700 mb-2">My Orders</div>
      <div className="text-center text-sm text-gray-400 mb-4">
        Found {filteredOrders.length} Items
      </div>

      {/* Tabs */}
      <div className="flex justify-around border-b border-gray-300 mb-3 w-full">
        {tabs.map((tab) => (
          <div
            key={tab}
            className={`py-3 cursor-pointer font-bold flex-1 text-center ${
              activeTab === tab
                ? 'text-sky-500 border-b-2 border-sky-500'
                : 'text-gray-500'
            }`}
            onClick={() => handleTabClick(tab)}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search By Product Name / SKU ID"
        className="block mx-auto mb-4 w-[90%] max-w-[400px] py-3 px-4 rounded-lg border border-gray-200 bg-gray-100 text-sm"
        onChange={handleSearch}
        value={searchQuery}
      />

      {/* Orders Display */}
      {loading ? (
        <div className="text-center text-gray-500 py-8">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">{error}</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center text-gray-500 bg-gray-50 py-8 px-5 rounded-xl mb-6 text-sm">
          No Items Found
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 mb-6">
          {filteredOrders.map((order, idx) => (
            <div
              key={order._id || idx}
              className="bg-white rounded-xl p-4 shadow text-sm"
            >
              <div className="font-semibold text-gray-800 mb-1">
                {order.productName || 'Unnamed Product'}
              </div>
              <div>Status: <span className="capitalize">{order.status}</span></div>
              <div>SKU: {order.sku || 'N/A'}</div>
              <div>Quantity: {order.quantity || 1}</div>
              <div className="text-xs text-gray-500 mt-1">
                Ordered on: {new Date(order.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Products */}
      <NewProductsSection />
     

      {/* Trending Products */}
      <div className="text-base font-bold my-5 text-gray-700">Trending Products</div>
      <div className="grid grid-cols-2 gap-3 w-full mb-8">
        {dummyProducts.map((product, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl p-2 shadow-sm text-xs cursor-pointer"
          >
            <div className="relative">
              <img
                src={product.image}
                alt="Product"
                className="w-full h-[120px] rounded-lg mb-1 object-cover"
              />
              <div className="bg-yellow-300 text-gray-800 text-[10px] font-bold py-0.5 px-1.5 rounded absolute top-2 left-2">
                {product.tag}
              </div>
            </div>
            <div><strong>{product.name}</strong></div>
            <div>Sold by: {product.seller}</div>
            <div>{product.price}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-gray-400 border-t border-gray-200 pt-3 w-full">
        © {new Date().getFullYear()} YourCompany. All rights reserved.
      </div>
    </div>
  );
};

export default MyOrders;
