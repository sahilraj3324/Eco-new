import React, { useState } from 'react';
import {  Menu, X } from 'lucide-react';
import logo from "../../../assets/logo.png";
import TopProduct from './TopProducts';
import NewProducts from './Newproduct';
import TrendingProducts from './TrendingProducts';
import sellerImg from './image.png';
import { Link } from 'react-router-dom';



const HomePage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Simulated auth status (replace with context or localStorage logic)
  const isLoggedIn = false;

  return (
    <div className="font-sans bg-gray-50 min-h-screen">
      {/* Header */}
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-purple-200 to-purple-300 h-60 rounded-2xl m-4 flex items-center justify-center text-3xl font-semibold text-purple-800">
        Discover What Moves the Market 🚀
      </section>

      {/* Product Sections */}
      <TopProduct />
      <NewProducts />
      <TrendingProducts />

      {/* Become A Seller Section */}
      <section className="my-10 px-4 flex justify-center">
        <img
          src={sellerImg}
          alt="Become a Seller"
          className="rounded-3xl w-full max-w-4xl object-cover shadow-xl"
        />
      </section>

    </div>
  );
};

export default HomePage;
