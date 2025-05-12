import { useEffect, useState } from 'react';
import Vendorhome from '../Home/VendorHome';
import ProductPost from '../ProductPost/ProductPost';
import Profile from '../Profile/Profile';
import BecomeSellerStatic from './BecomeSellerStatic';

import OrdersPage from './OrdersPage';
import PaymentsPage from './PaymentsPage';
import SellerHome from './SellerHome';

import BulkUpload from '../ProductPost/BulkUpload';
import AddProduct from '../ProductPost/AddProduct';
import ProductList from './BecomeSellerStatic';
import VendorProducts from '../Inventory/VendorProducts';
import VendorOrders from '../Order/VendorOrders';
import {
  Home,
  PlusCircle,
  Boxes,
  ShoppingBag,
  CreditCard,
  User,
} from 'lucide-react'; 


const VendorDashboard = () => {
  const [activeSection, setActiveSection] = useState('Home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [name, setName] = useState(false);

  useEffect(()=>{
    const storename = localStorage.getItem('storename');
    setName(storename)
  })

  const sections = [
    { name: 'Home', icon: <Home size={18} />, component: <SellerHome /> },
    { name: 'Add Your Products', icon: <PlusCircle size={18} />, component: <AddProduct /> },
    { name: 'Inventory', icon: <Boxes size={18} />, component: <VendorProducts /> },
    { name: 'Orders ', icon: <ShoppingBag size={18} />, component: <VendorOrders /> },
    { name: 'Payment Page', icon: <CreditCard size={18} />, component: <PaymentsPage /> },
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
        }`}
      >
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
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
            <button className="bg-gray-400 text-white px-3 py-1 rounded">Logout</button>
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
    </div>
  );
};

export default VendorDashboard;
