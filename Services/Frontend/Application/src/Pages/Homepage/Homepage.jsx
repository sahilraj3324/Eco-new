import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FaStore, FaShoppingCart } from 'react-icons/fa';

// ✅ Correct image imports
import logoImg from '../../assets/shop vector icon.png'; // Replace with your actual image path
import CartImg from '../../assets/cart.png';
import menImg from '../../assets/men.png';
import womenImg from '../../assets/women.png';
import boyImg from '../../assets/boy.png';
import girlImg from '../../assets/girl.png';
import shirtImg from '../../assets/men shirts.png' // uploaded image
import sellerImg from '../../assets/men.png'; // Using men.png as seller image placeholder
import NewProducts from './NewProducts';
import Top from './Top';
import Trending from './Trending';
import More from './More';

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
  const navigate = useNavigate();
  const [banners, setBanners] = useState({
    image1: [],
    image2: [],
    descriptions: []
  });
  const [loading, setLoading] = useState(true);
  const banner1Ref = useRef();
  const banner2Ref = useRef();

  const handleLogoClick = () => {
    console.log("Logo clicked - navigate to home");
    navigate('/');
  };

  const handleCartClick = () => {
    console.log("Cart clicked - navigate to cart");
    navigate('/cart');
  };

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await fetch('/api/ImageStore');
        const data = await response.json();
        
        // Transform the data to extract image1 and image2 as separate arrays
        const banner1Images = data.map(item => item.image1).filter(Boolean);
        const banner2Images = data.map(item => item.image2).filter(Boolean);
        
        setBanners({
          image1: banner1Images,
          image2: banner2Images,
          descriptions: data.map(item => item.description).filter(Boolean)
        });
      } catch (error) {
        console.error('Failed to fetch banners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  const scrollBanner = (ref, direction) => {
    const { current } = ref;
    if (current) {
      if (direction === 'left') {
        current.scrollBy({ left: -300, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: 300, behavior: 'smooth' });
      }
    }
  };

  const BannerSection = ({ images, scrollRef, title }) => (
    <section className="max-w-7xl mx-auto px-4 py-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
        <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto"></div>
      </div>
      
      <div className="relative">
        <button 
          onClick={() => scrollBanner(scrollRef, 'left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 hover:shadow-xl transition-all duration-300 border border-gray-100 group"
        >
          <ChevronLeft size={24} className="text-gray-600 group-hover:text-blue-600 transition-colors duration-200" />
        </button>

        <button 
          onClick={() => scrollBanner(scrollRef, 'right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 hover:shadow-xl transition-all duration-300 border border-gray-100 group"
        >
          <ChevronRight size={24} className="text-gray-600 group-hover:text-blue-600 transition-colors duration-200" />
        </button>

        <div className="overflow-hidden rounded-2xl">
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto gap-6 px-8 py-4 scroll-smooth no-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {loading ? (
              <div className="flex justify-center items-center w-full py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-t-blue-600"></div>
                <span className="ml-3 text-gray-600 text-lg">Loading banners...</span>
              </div>
            ) : images.length === 0 ? (
              <div className="flex justify-center items-center w-full py-16">
                <p className="text-gray-500 text-lg">No banners available</p>
              </div>
            ) : (
              images.map((banner, index) => (
                <div
                  key={banner.id || index}
                  className="min-w-[400px] w-96 flex-shrink-0 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 hover:border-blue-200 cursor-pointer"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={banner || '/placeholder.png'}
                      alt={`Banner ${index + 1}`}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = '/placeholder.png';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <div className="font-sans bg-gray-50 min-h-screen">
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

      {/* Enhanced Hero Banner */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 h-72 rounded-3xl flex items-center justify-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover What Moves the Market 🚀
            </h1>
            <p className="text-xl md:text-2xl font-light opacity-90">
              Your gateway to premium wholesale products
            </p>
          </div>
          <div className="absolute top-0 left-0 w-full h-full">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/5 rounded-full"></div>
            <div className="absolute top-1/2 right-20 w-16 h-16 bg-white/10 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Product Categories Grid */}
      <div className="max-w-7xl mx-auto px-4">
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
      </div>

      {/* First Banner Section - Above Top Products */}
      <BannerSection 
        images={banners.image1} 
        scrollRef={banner1Ref}
        title="Featured Promotions"
      />

      {/* Product Sections */}
      <Top />
      <NewProducts />
      <Trending />

      {/* Second Banner Section - Below Trending */}
      <BannerSection 
        images={banners.image2} 
        scrollRef={banner2Ref}
        title="Special Offers"
      />

      <More />

      {/* Enhanced Become A Seller Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl">
          <img
            src={sellerImg}
            alt="Become a Seller"
            className="w-full h-80 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30 flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-4xl font-bold mb-4">Ready to Grow Your Business?</h2>
              <p className="text-xl mb-6">Join thousands of successful sellers on our platform</p>
              <button className="bg-white text-gray-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors duration-300 shadow-lg">
                Become a Seller
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-4 mt-6 text-sm text-gray-500">
        Copyright 2025 By EcoCys. All Rights Reserved.
      </footer>
    </div>
  );
};

export default HomePage;