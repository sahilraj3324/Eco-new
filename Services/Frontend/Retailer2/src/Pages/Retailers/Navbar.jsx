import React, { useEffect, useState } from 'react';
import {
  Menu,
  X,
  Search,
  User,
  Package,
  Heart,
  Ticket,
  Gift,
  Bell,
  LogOut,
  BadgePercent,
  Bolt,
  ShoppingCart,
  Store
} from 'lucide-react';
import logo from "../../assets/logo.png";
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthContext();

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      setLoading(false);
    } catch (error) {
      console.error('Auth check failed:', error);
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      navigate(`/all?q=${searchQuery}`);
    }
  };

  const handleLogin = () => {
    navigate('/retailerlogin');
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <header className="flex flex-col md:flex-row items-center justify-between p-4 bg-white shadow-md rounded-2xl gap-4">
        <div className="flex items-center gap-2">
          <img src={logo} alt="EcoCys Logo" className="h-10 w-auto" />
        </div>
        <div className="text-gray-500">Loading...</div>
      </header>
    );
  }

  return (
    <header className="flex flex-col md:flex-row items-center justify-between p-4 bg-white shadow-md rounded-2xl gap-4 ">
      {/* Logo */}
      <Link to="/">
      <div className="flex items-center gap-2">
        <img src={logo} alt="EcoCys Logo" className="h-10 w-auto" />
      </div>
      </Link>

      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
          placeholder="Search Products, Sellers & More..."
          className="border rounded-full pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Mobile Toggle */}
      <button
        className="md:hidden text-gray-700"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Navigation */}
      <nav
        className={`w-full md:w-auto flex-col md:flex-row md:flex flex-wrap items-center justify-center md:justify-end gap-4 text-sm text-gray-700 transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? 'flex' : 'hidden md:flex'
        }`}
      >
        {[
          { name: 'Men', icon: User },
          { name: 'Women', icon: User },
          { name: 'Cart', icon: ShoppingCart , link: "/cart"},
          { name: 'Become a Seller', icon: Store }
        ].map(({ name, icon: Icon , link }) => (
          <Link key={name} to={link} className="flex items-center gap-1 hover:text-purple-600 font-medium">
            <Icon size={16} />
            {name}
          </Link>
        ))}

        {isAuthenticated ? (
          <div className="relative group">
            <div className="flex items-center gap-2 cursor-pointer">
              <User size={18} />
              <span className="font-semibold">{user?.storename || ""}</span>
            </div>

            {/* Dropdown on hover */}
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border hidden group-hover:block z-50">
              <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100">
                <User size={16} /> My Profile
              </Link>
              <Link to="/retailerOrder" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100">
                <Package size={16} /> Orders
              </Link>
              <Link to="/wishlist" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100">
                <Heart size={16} /> Wishlist
              </Link>
             
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="hover:text-purple-600 font-medium transition-all duration-200"
          >
            Login
          </button>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
