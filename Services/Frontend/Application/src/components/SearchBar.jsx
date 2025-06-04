import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, X, TrendingUp, Clock, Filter } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  // Load search history from localStorage
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    setSearchHistory(history);
  }, []);

  // Mock suggestions - in real app, this would come from API
  const trendingSearches = [
    'Men Shirts',
    'Women Dresses',
    'Electronics',
    'Home Decor',
    'Beauty Products',
    'Sports Wear',
    'Mobile Phones',
    'Laptops'
  ];

  const handleSearch = (searchQuery = query) => {
    if (!searchQuery.trim()) return;
    
    // Add to search history
    const newHistory = [searchQuery, ...searchHistory.filter(item => item !== searchQuery)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    
    // Navigate to search results page
    navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setIsSearchFocused(false);
    setQuery('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const removeHistoryItem = (item) => {
    const newHistory = searchHistory.filter(historyItem => historyItem !== item);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const showBack = location.pathname !== '/';

  // Filter suggestions based on query
  const filteredSuggestions = query.trim() 
    ? trendingSearches.filter(item => 
        item.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="sticky top-0 z-20 bg-white flex items-center px-4 py-3 shadow-sm border-b border-gray-100">
        {showBack && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mr-3 p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors duration-200"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        
        <div className="flex-1 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              className={`w-full pl-12 pr-12 py-3 rounded-full border-2 focus:outline-none transition-all duration-200 text-sm bg-gray-50 ${
                isSearchFocused 
                  ? 'border-blue-500 bg-white shadow-lg' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              placeholder="Search for products, brands, sellers & more..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
                if (e.key === 'Escape') {
                  setIsSearchFocused(false);
                  setQuery('');
                }
              }}
              style={{ marginLeft: showBack ? 0 : '2.5rem' }}
            />
            
            {/* Clear button */}
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-12 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={16} className="text-gray-400" />
              </button>
            )}
            
            {/* Search button */}
            <button 
              type="submit" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-all duration-200 hover:scale-105"
            >
              <Search size={16} />
            </button>
          </div>

          {/* Search Dropdown */}
          {isSearchFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-96 overflow-y-auto">
              {/* Query-based suggestions */}
              {filteredSuggestions.length > 0 && (
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Search size={16} className="text-gray-500" />
                    <span className="text-sm font-semibold text-gray-700">Search Suggestions</span>
                  </div>
                  <div className="space-y-2">
                    {filteredSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-3"
                      >
                        <Search size={14} className="text-gray-400" />
                        <span>{suggestion}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search History */}
              {searchHistory.length > 0 && !query.trim() && (
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-500" />
                      <span className="text-sm font-semibold text-gray-700">Recent Searches</span>
                    </div>
                    <button
                      onClick={clearHistory}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="space-y-1">
                    {searchHistory.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex items-center justify-between group">
                        <button
                          onClick={() => handleSuggestionClick(item)}
                          className="flex-1 text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-3"
                        >
                          <Clock size={14} className="text-gray-400" />
                          <span>{item}</span>
                        </button>
                        <button
                          onClick={() => removeHistoryItem(item)}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded-full transition-all"
                        >
                          <X size={12} className="text-gray-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Searches */}
              {!query.trim() && (
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={16} className="text-orange-500" />
                    <span className="text-sm font-semibold text-gray-700">Trending Searches</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {trendingSearches.slice(0, 6).map((trend, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(trend)}
                        className="text-left px-3 py-2 text-sm text-gray-600 hover:bg-orange-50 rounded-lg transition-colors flex items-center gap-2 border border-gray-100 hover:border-orange-200"
                      >
                        <TrendingUp size={12} className="text-orange-400" />
                        <span className="truncate">{trend}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Filters */}
              <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <Filter size={16} className="text-blue-500" />
                  <span className="text-sm font-semibold text-gray-700">Quick Filters</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Price: Low to High', 'Rating: 4+ Stars', 'Free Delivery', 'New Arrivals'].map((filter, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(filter)}
                      className="px-3 py-1 text-xs bg-white border border-gray-200 rounded-full hover:bg-blue-50 hover:border-blue-200 transition-colors"
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Search overlay */}
      {isSearchFocused && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-40"
          onClick={() => setIsSearchFocused(false)}
        />
      )}
    </div>
  );
};

export default SearchBar; 