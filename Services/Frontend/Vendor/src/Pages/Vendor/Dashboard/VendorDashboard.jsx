import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Vendorhome from '../Home/VendorHome';
import ProductPost from '../ProductPost/ProductPost';
import Profile from '../Profile/Profile';
import logo from '../../../assets/logo.png';


import PaymentsPage from './PaymentsPage';
import SellerHome from './SellerHome';

import BulkUpload from '../ProductPost/BulkUpload';
import AddProduct from '../ProductPost/AddProduct';

import VendorProducts from '../Inventory/VendorProducts';
import VendorOrders from '../Order/VendorOrders';
import AskAdmin from '../Ask/AskAdmin';
import axios from 'axios';
import {
  Home,
  PlusCircle,
  Boxes,
  ShoppingBag,
  CreditCard,
  User,
  HelpCircle,
} from 'lucide-react'; 


const VendorDashboard = () => {
  const [activeSection, setActiveSection] = useState('Home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [name, setName] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();


  const id = localStorage.getItem('Id');
  async function fetchUserData() {
    const responce = await axios.get(`/api/Seller/get/${id}`)
    const data = responce.data;
    setName(data.storename);
  }
  fetchUserData();

  useEffect(() => {
    // Check authentication and status
       const status = localStorage.getItem('Status');
    if (status !== 'Approved') {
      navigate('/vendorlogin');
      return;
    }
    const id = localStorage.getItem('Id');
  async function fetchUserData() {
    const responce = await axios.get(`/api/Seller/get/${id}`)
    const data = responce.data;
    console.log(data);
    setName(data.storename);
  }
  fetchUserData();
 console.log(1234);
    const storename = localStorage.getItem('storename');
    setName(storename);
  }, [navigate]);

 

  const handleLogout = () => {
    // Clear all localStorage data
    localStorage.removeItem('Id');
    localStorage.removeItem('storename');
    localStorage.removeItem('username');
    localStorage.removeItem('Status');
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('phone');
    
    // Clear any other vendor-related data
    localStorage.clear();
    
    // Redirect to login page
    navigate('/');
  };

  const confirmLogout = () => {
    setShowLogoutModal(true);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const sections = [
    { name: 'Home', icon: <Home size={18} />, component: <SellerHome /> },
    { name: 'Add Your Products', icon: <PlusCircle size={18} />, component: <AddProduct /> },
    { name: 'Inventory', icon: <Boxes size={18} />, component: <VendorProducts /> },
    { name: 'Orders ', icon: <ShoppingBag size={18} />, component: <VendorOrders /> },
    { name: 'Payment Page', icon: <CreditCard size={18} />, component: <PaymentsPage /> },
    { name: 'Ask Admin', icon: <HelpCircle size={18} />, component: <AskAdmin /> },
    { name: 'Your Profile', icon: <User size={18} />, component: <Profile /> },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Mobile Toggle Button */}
      <button
        className="md:hidden fixed top-4 right-4 z-30 bg-black text-white p-2 rounded"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        ☰
      </button>

      {/* Sidebar */}
      <div
        className={`fixed md:static top-0 left-0 ${
          isSidebarOpen ? 'w-full h-full' : 'w-0 h-full'
        } md:w-64 md:h-auto bg-black text-white p-4 z-20 transition-all duration-300 ease-in-out overflow-y-auto ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } flex flex-col justify-between`}
      >
        <div>
          <h2 className="text-xl font-bold mb-4">Dashboard</h2>
          <ul className="space-y-2">
            {sections.map((section, idx) => (
              <li key={section.name}>
                <button
                  onClick={() => {
                    setActiveSection(section.name);
                    setIsSidebarOpen(false);
                  }}
                  className={`flex items-center gap-2 w-full text-left p-2 rounded ${
                    activeSection === section.name
                      ? 'bg-gray-800'
                      : 'hover:bg-gray-700'
                  }`}
                >
                  {section.icon}
                  {section.name}
                </button>
                {idx !== sections.length - 1 && (
                  <hr className="border-gray-700 my-2" />
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-8 flex justify-center">
          <img src={logo} alt="Logo" className="h-12" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-auto max-h-screen">
        {/* Navbar Section */}
        <div className="flex justify-between items-center p-4 bg-white shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-blue-500">🔔</span>
            <span className="font-semibold">Notices</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="bg-gray-200 px-3 py-1 rounded">Need Help?</button>
            <div className="flex items-center gap-1">
              🏪
              <span className="font-medium">{name}</span>
            </div>
            <button className="bg-cyan-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-full transition-colors flex items-center space-x-2" onClick={confirmLogout}>
             
              <span>Logout</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">{activeSection}</h1>
          {sections.find((s) => s.name === activeSection)?.component}
        </div>

        <footer className="bg-gray-200 text-center p-4 mt-auto">
          © 2025 Your Company. All rights reserved.
        </footer>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="text-center">
              <div className="text-red-500 text-5xl mb-4">🚪</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Confirm Logout</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to logout? You'll need to login again to access your dashboard.
              </p>
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={cancelLogout}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;
