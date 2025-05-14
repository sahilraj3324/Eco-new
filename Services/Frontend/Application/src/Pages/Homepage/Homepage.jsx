import React from 'react';
import { FaStore, FaShoppingCart } from 'react-icons/fa';

// ✅ Correct image imports
import logoImg from '../../assets/shop vector icon.png'; // Replace with your actual image path
import CartImg from '../../assets/cart.png';
import menImg from '../../assets/men.png';
import womenImg from '../../assets/women.png';
import boyImg from '../../assets/boy.png';
import girlImg from '../../assets/girl.png';
import shirtImg from '../../assets/men shirts.png' // uploaded image
import NewProducts from './NewProducts';

const sections = [
  {
    label: "Browse in Men Section",
    count: 857,
    img: menImg,
    borderColor: "border-amber-400",
    textColor: "text-amber-500"
  },
  {
    label: "Browse in Women Section",
    count: 292,
    img: womenImg,
    borderColor: "border-emerald-400",
    textColor: "text-emerald-500"
  },
  {
    label: "Browse in Boy Section",
    count: 3125,
    img: boyImg,
    borderColor: "border-teal-300",
    textColor: "text-teal-500"
  },
  {
    label: "Browse in Girl Section",
    count: 2598,
    img: girlImg,
    borderColor: "border-red-300",
    textColor: "text-red-500"
  }
];

const HomePage = () => {
  const handleLogoClick = () => {
    console.log("Logo clicked - navigate to home");
    // Add navigation logic here
  };

  const handleCartClick = () => {
    console.log("Cart clicked - navigate to cart");
    // Add navigation logic here
  };

  return (
    <div className="p-3 font-sans bg-slate-50 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-3 pb-2">
        <div className="cursor-pointer" onClick={handleLogoClick}>
          <img src={logoImg} alt="EcoCys Logo Left" className="h-9" />
        </div>

        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={handleCartClick}
        > 
          <img src={CartImg} alt="EcoCys Logo Right" className="h-9" />
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        {sections.map((section, index) => (
          <div 
            key={index} 
            className={`bg-white rounded-2xl border-2 ${section.borderColor} p-2 text-center shadow-sm min-h-[180px]`}
          >
            <img src={section.img} alt={section.label} className="w-full h-20 object-contain" />
            <p className={`text-sm font-bold mb-1 ${section.textColor}`}>{section.count} Products</p>
            <p className={`text-xs font-semibold ${section.textColor}`}>{section.label}</p>
          </div>
        ))}
      </div>

      {/* Bottom Placeholder */}
      <div className="h-30 bg-slate-100 rounded-2xl mt-4"></div>

      {/* New Products Section */}
      <NewProducts />

      {/* Grey Banner Section */}
      <div className="mt-6">
        <div className="bg-gray-300 h-30 rounded-lg mb-4"></div>
      </div>

      {/* Trending Products Section */}
      <div className="mt-6">
        <h2 className="text-xl font-bold text-slate-700 mb-3">Trending Products</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white rounded-2xl p-3 min-w-[70vw] shadow-md relative">
              <div className="absolute top-2 left-2 bg-gray-100 px-3 py-1 rounded-full text-xs font-semibold">
                Recently Added
              </div>
              <img src={shirtImg} alt="Shirt" className="w-full h-30 rounded-xl object-contain" />
              <p className="text-sm font-semibold mt-2">Stylish Glamorous Men Shirts</p>
              <p className="text-xs text-gray-500">Sold By Wholesaler</p>
              <p className="font-bold text-base text-black mt-1">500/- Per Pack</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <div className="bg-gray-300 h-30 rounded-lg mb-4"></div>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-bold text-slate-700 mb-3">Top Products</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-white rounded-2xl p-3 min-w-[70vw] shadow-md relative">
              <div className="absolute top-2 left-2 bg-gray-100 px-3 py-1 rounded-full text-xs font-semibold">
                Recently Added
              </div>
              <img src={shirtImg} alt="Shirt" className="w-full h-30 rounded-xl object-contain" />
              <p className="text-sm font-semibold mt-2">Stylish Glamorous Men Shirts</p>
              <p className="text-xs text-gray-500">Sold By Wholesaler</p>
              <p className="font-bold text-base text-black mt-1">500/- Per Pack</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <div className="bg-gray-300 h-30 rounded-lg mb-4"></div>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 mt-6 text-sm text-gray-500">
        Copyright 2025 By EcoCys. All Rights Reserved.
      </footer>
    </div>
  );
};

export default HomePage;