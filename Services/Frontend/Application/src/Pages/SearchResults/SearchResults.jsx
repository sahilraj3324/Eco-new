import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, Grid, List, Star, Heart, ArrowLeft, Package, AlertCircle, Loader2, ShoppingCart } from 'lucide-react';
import shirtImg from '../../assets/men shirts.png';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q') || '';

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQuery, setCurrentQuery] = useState(query);
  
  // Filter states
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedRating, setSelectedRating] = useState(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, currentQuery, priceRange, sortBy, selectedCategories, selectedRating]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/Product/get-all');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      } else {
        throw new Error('Failed to fetch products');
      }
    } catch (err) {
      console.error('Search API Error:', err);
      setError('Failed to load products. Please try again.');
      // Fallback with mock data for development
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = products;

    // Search filter
    if (currentQuery.trim()) {
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(currentQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(currentQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(currentQuery.toLowerCase()) ||
        product.sellerName?.toLowerCase().includes(currentQuery.toLowerCase())
      );
    }

    // Price filter
    filtered = filtered.filter(product => {
      const price = parseFloat(product.price) || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product =>
        selectedCategories.includes(product.category)
      );
    }

    // Rating filter
    if (selectedRating > 0) {
      filtered = filtered.filter(product => {
        const rating = parseFloat(product.rating) || 0;
        return rating >= selectedRating;
      });
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
      case 'name':
        filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      default: // relevance
        // Keep original order for relevance
        break;
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearch = (newQuery) => {
    setCurrentQuery(newQuery);
    navigate(`/search?q=${encodeURIComponent(newQuery)}`);
  };

  const handleAddToWishlist = async (productId) => {
    const userId = localStorage.getItem('Id');
    if (!userId) {
      alert('Please login to add items to wishlist');
      return;
    }

    try {
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          productId: productId
        })
      });

      if (response.ok) {
        alert('Added to wishlist!');
      } else {
        throw new Error('Failed to add to wishlist');
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      alert('Failed to add to wishlist. Please try again.');
    }
  };

  // Get unique categories from products
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const renderStars = (rating) => {
    const stars = [];
    const numRating = parseFloat(rating) || 0;
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${i <= numRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-12 text-center max-w-md w-full">
          <div className="relative mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-xl">
              <Search className="h-10 w-10 text-white" />
            </div>
            <Loader2 className="absolute -bottom-1 -right-1 h-8 w-8 animate-spin text-blue-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Searching...</h3>
          <p className="text-gray-600">Finding the best products for you</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={currentQuery}
                  onChange={(e) => setCurrentQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch(currentQuery)}
                  placeholder="Search for products, brands, sellers & more..."
                  className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {currentQuery ? `Search results for "${currentQuery}"` : 'All Products'}
              </h1>
              <p className="text-gray-600 mt-1">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {viewMode === 'grid' ? <List className="h-5 w-5" /> : <Grid className="h-5 w-5" />}
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? 'block' : 'hidden'} lg:block w-80 flex-shrink-0`}>
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </h3>
              
              {/* Sort */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest First</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price Range</label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="10000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                </div>
              </div>

              {/* Categories */}
              {categories.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Categories</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {categories.map(category => (
                      <label key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(category)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCategories([...selectedCategories, category]);
                            } else {
                              setSelectedCategories(selectedCategories.filter(c => c !== category));
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Rating */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum Rating</label>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map(rating => (
                    <label key={rating} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="rating"
                        checked={selectedRating === rating}
                        onChange={() => setSelectedRating(rating)}
                        className="mr-2"
                      />
                      <div className="flex items-center gap-1">
                        {renderStars(rating)}
                        <span className="text-sm text-gray-700 ml-1">& above</span>
                      </div>
                    </label>
                  ))}
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      checked={selectedRating === 0}
                      onChange={() => setSelectedRating(0)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">All Ratings</span>
                  </label>
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setPriceRange([0, 10000]);
                  setSelectedCategories([]);
                  setSelectedRating(0);
                  setSortBy('relevance');
                }}
                className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {error && (
              <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-8 mb-6">
                <div className="flex items-center gap-4">
                  <AlertCircle className="h-12 w-12 text-red-500" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Error Loading Products</h3>
                    <p className="text-gray-600">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {!error && filteredProducts.length === 0 && (
              <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-12 text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-12 w-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">No products found</h3>
                <p className="text-gray-600 mb-6">
                  {currentQuery 
                    ? `No products match your search for "${currentQuery}"`
                    : 'No products available at the moment'
                  }
                </p>
                <button
                  onClick={() => {
                    setCurrentQuery('');
                    navigate('/search');
                  }}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
                >
                  Browse All Products
                </button>
              </div>
            )}

            {filteredProducts.length > 0 && (
              <>
                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {paginatedProducts.map((product) => (
                    <div
                      key={product.id}
                      className={`bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 group ${
                        viewMode === 'list' ? 'flex' : ''
                      }`}
                    >
                      <div className={`${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''} relative`}>
                        <img
                          src={product.mainImage || product.imageUrls?.[0] || shirtImg}
                          alt={product.name}
                          className={`${
                            viewMode === 'list' ? 'h-48' : 'h-64'
                          } w-full object-cover group-hover:scale-105 transition-transform duration-300`}
                          onError={(e) => (e.target.src = shirtImg)}
                        />
                        <button
                          onClick={() => handleAddToWishlist(product.id)}
                          className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all duration-200"
                        >
                          <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
                        </button>
                      </div>
                      
                      <div className="p-6 flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </h3>
                        
                        <div className="flex items-center mb-2">
                          <div className="flex items-center">
                            {renderStars(product.rating)}
                          </div>
                          <span className="text-sm text-gray-500 ml-2">
                            ({product.reviewCount || 0} reviews)
                          </span>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {product.description}
                        </p>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
                            {product.originalPrice && (
                              <span className="text-sm text-gray-500 line-through ml-2">
                                ₹{product.originalPrice}
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-green-600 font-medium">
                            Free Delivery
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Link
                            to={`/product/${product.id}`}
                            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 px-4 rounded-xl text-center text-sm font-semibold transition-all duration-200"
                          >
                            View Details
                          </Link>
                          <button
                            onClick={() => {
                              // Add to cart logic
                              alert('Add to cart functionality to be implemented');
                            }}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                          >
                            <ShoppingCart className="h-4 w-4 text-gray-600" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-8 space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Previous
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          currentPage === i + 1
                            ? 'bg-blue-500 text-white'
                            : 'bg-white border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults; 