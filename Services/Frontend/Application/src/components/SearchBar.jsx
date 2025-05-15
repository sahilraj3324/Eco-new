import React, { useState } from 'react';
import { FaSearch, FaArrowLeft } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    // Dummy search handler
    alert(`Searching for: ${query}`);
  };

  const showBack = location.pathname !== '/';

  return (
    <form onSubmit={handleSearch} className="sticky top-0 z-20 bg-white flex items-center px-4 py-2 shadow-sm">
      {showBack && (
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mr-2 p-2 rounded-full hover:bg-gray-200 text-gray-600"
          aria-label="Go back"
        >
          <FaArrowLeft />
        </button>
      )}
      <input
        type="text"
        className="flex-1 px-4 py-2 rounded-l-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm bg-gray-50"
        placeholder="Search for products, brands, etc."
        value={query}
        onChange={e => setQuery(e.target.value)}
        style={{ marginLeft: showBack ? 0 : '2.5rem' }}
      />
      <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-r-full flex items-center justify-center">
        <FaSearch />
      </button>
    </form>
  );
};

export default SearchBar; 