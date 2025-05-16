import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaClipboardList, FaUser, FaCog } from 'react-icons/fa';

const navItems = [
  { to: '/', label: 'Home', icon: <FaHome /> },
  { to: '/orders', label: 'Orders', icon: <FaClipboardList /> },
  { to: '/profile', label: 'Profile', icon: <FaUser /> },
  { to: '/settings', label: 'Settings', icon: <FaCog /> },
];

const BottomNavBar = () => (
  <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t shadow flex justify-around items-center h-16 md:hidden">
    {navItems.map((item) => (
      <NavLink
        key={item.to}
        to={item.to}
        className={({ isActive }) =>
          `flex flex-col items-center justify-center text-xs px-2 py-1 transition-colors duration-150 ${
            isActive ? 'text-blue-600' : 'text-gray-500'
          }`
        }
      >
        <span className="text-lg mb-1">{item.icon}</span>
        {item.label}
      </NavLink>
    ))}
  </nav>
);

export default BottomNavBar; 