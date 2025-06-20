import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronLeft, ChevronRight, ArrowRight, Star, Zap, Shield, Truck, Search, MapPin, Filter, Gift, TrendingUp, Package, Users, Heart, ShoppingBag } from 'lucide-react';
import logo from "../../../assets/logo.png";
import Top from './Top';
import NewProducts from './Newproduct';
import sellerImg from './image.png';
import { Link, useNavigate } from 'react-router-dom';
import Trending from './Trending';
import More from './More';



const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Delhi NCR');
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [banners, setBanners] = useState({
    image1: [],
    image2: [],
    descriptions: []
  });
  const [loading, setLoading] = useState(true);
  const banner1Ref = useRef();
  const banner2Ref = useRef();
  
  // Simulated auth status (replace with context or localStorage logic)
  const isLoggedIn = false;

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

  // Categories data - Clothing focused
  const categories = [
    { icon: '👕', name: 'T-Shirts', count: '2.3k+', color: 'from-blue-500 to-cyan-500' },
    { icon: '👔', name: 'Shirts', count: '1.8k+', color: 'from-indigo-500 to-purple-500' },
    { icon: '🩳', name: 'Shorts', count: '950+', color: 'from-green-500 to-emerald-500' },
    { icon: '👖', name: 'Jeans & Pants', count: '1.5k+', color: 'from-orange-500 to-red-500' },
    { icon: '🥻', name: 'Kurtas', count: '1.2k+', color: 'from-pink-500 to-rose-500' },
    { icon: '👗', name: 'Dresses', count: '800+', color: 'from-purple-500 to-violet-500' },
    { icon: '🧥', name: 'Jackets', count: '650+', color: 'from-yellow-500 to-orange-500' },
    { icon: '👘', name: 'Ethnic Wear', count: '420+', color: 'from-red-500 to-pink-500' }
  ];

  const quickActions = [
    { icon: TrendingUp, label: 'Trending', color: 'bg-gradient-to-r from-pink-500 to-rose-500', link: '/allproduct' },
    { icon: Gift, label: 'Deals', color: 'bg-gradient-to-r from-purple-500 to-violet-500', link: '/allproduct' },
    { icon: Heart, label: 'Wishlist', color: 'bg-gradient-to-r from-red-500 to-pink-500', link: '/wishlist' },
    { icon: Package, label: 'Orders', color: 'bg-gradient-to-r from-blue-500 to-cyan-500', link: '/allorder' }
  ];

  // Search API function
  const searchProducts = async (query) => {
    try {
      const response = await fetch(`/api/Product/search?query=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (response.ok) {
        const searchResults = await response.json();
        console.log('Search results:', searchResults);
        return searchResults;
      } else {
        console.error('Search failed:', response.statusText);
        return null;
      }
    } catch (error) {
      console.error('Search API error:', error);
      return null;
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      try {
        // Call search API first
        const searchResults = await searchProducts(searchQuery.trim());
        
        // Navigate to all products page with search query
        navigate(`/allproduct?search=${encodeURIComponent(searchQuery.trim())}`);
      } catch (error) {
        console.error('Search error:', error);
        // Still navigate even if API fails
        navigate(`/allproduct?search=${encodeURIComponent(searchQuery.trim())}`);
      } finally {
        setIsSearching(false);
      }
    } else {
      // Navigate to all products page without search
      navigate('/allproduct');
    }
  };

  return (
    <div className="font-sans bg-white min-h-screen">
      {/* Modern Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
        <div className="max-w-7xl mx-auto px-4 py-12 relative">
          
          {/* Location & Search Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <MapPin className="text-blue-600 mr-2" size={20} />
              <span className="text-gray-700 font-medium">{selectedLocation}</span>
              <button className="text-blue-600 ml-2 text-sm hover:text-blue-700">Change</button>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Discover Amazing 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"> Wholesale Deals</span>
            </h1>
            
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Find the best products from verified suppliers at unbeatable prices
            </p>

            {/* Enhanced Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative bg-white rounded-2xl shadow-xl p-2 flex items-center border border-gray-100">
                <Search className="text-gray-400 ml-4" size={24} />
                <input
                  type="text"
                  placeholder="Search for products, brands, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 px-4 py-3 text-gray-700 placeholder-gray-400 bg-transparent border-none outline-none text-lg"
                />
                <button 
                  onClick={handleSearch}
                  disabled={isSearching}
                  className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center hover:from-blue-700 hover:to-purple-700 ${
                    isSearching ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isSearching ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2" size={20} />
                      Search
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex justify-center gap-4 mb-8">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => navigate(action.link)}
                  className={`${action.color} text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center space-x-2`}
                >
                  <action.icon size={20} />
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
          <p className="text-gray-600 text-lg">Explore our wide range of wholesale products</p>
        </div>

                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
           {categories.map((category, index) => (
             <div
               key={index}
               className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group border border-gray-100 hover:border-blue-200 transform hover:scale-105"
             >
               <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${category.color} flex items-center justify-center text-2xl mb-4 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                 {category.icon}
               </div>
               <h3 className="font-bold text-gray-900 text-center mb-1">{category.name}</h3>
               <p className="text-sm text-gray-500 text-center">{category.count} products</p>
             </div>
           ))}
         </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-blue-100">Active Retailers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-blue-100">Verified Suppliers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">1M+</div>
              <div className="text-blue-100">Products Listed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">₹500Cr+</div>
              <div className="text-blue-100">Transaction Value</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-gray-600 text-lg">Hand-picked products from our top suppliers</p>
          </div>
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <Top />
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">New Arrivals</h2>
            <p className="text-gray-600 text-lg">Latest products just added to our catalog</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl shadow-lg p-8">
            <NewProducts />
          </div>
        </div>
      </section>

      {/* Trending Now */}
      <section className="bg-gradient-to-br from-purple-50 to-pink-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trending Now</h2>
            <p className="text-gray-600 text-lg">Most popular products this week</p>
          </div>
          <div className="bg-white rounded-3xl shadow-lg p-8">
            <Trending />
          </div>
        </div>
      </section>

      {/* More Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <More />
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose EcoCys?</h2>
            <p className="text-gray-600 text-lg">Your trusted partner in wholesale business</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Shield className="text-white" size={32} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Verified Suppliers</h3>
              <p className="text-gray-600 text-sm">All suppliers are thoroughly verified and trusted</p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Truck className="text-white" size={32} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-gray-600 text-sm">Quick and reliable shipping across India</p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-r from-purple-500 to-violet-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Star className="text-white" size={32} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Quality Assured</h3>
              <p className="text-gray-600 text-sm">Premium quality products guaranteed</p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="text-white" size={32} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">24/7 Support</h3>
              <p className="text-gray-600 text-sm">Round the clock customer support</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Your Wholesale Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of successful retailers and suppliers on India's fastest growing B2B platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/retailersignup')}
              className="bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center"
            >
              Start Buying <ShoppingBag className="ml-2" size={20} />
            </button>
            <button 
              onClick={() => navigate('/becomeseller')}
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 flex items-center justify-center"
            >
              Start Selling <ArrowRight className="ml-2" size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Modern CSS Animations */}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
        
        .animate-pulse-slow {
          animation: pulse 3s ease-in-out infinite;
        }
        
        /* Gradient text animation */
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        .gradient-text {
          background: linear-gradient(-45deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6);
          background-size: 400% 400%;
          animation: gradient 3s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </div>
  );
};

export default HomePage;
