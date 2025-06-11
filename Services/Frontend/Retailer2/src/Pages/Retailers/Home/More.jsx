import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import fallbackImage from './shirtimage.png';

const More = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState([]);

  const ITEMS_PER_PAGE = 8;

  const fetchInitialProducts = async () => {
    try {
      const res = await fetch('/api/Product/get-all');
      const data = await res.json();
      const sortedProducts = data
        .filter((product) => product.status === "Active" )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setAllProducts(sortedProducts);
      setProducts(sortedProducts.slice(0, ITEMS_PER_PAGE));
      setHasMore(sortedProducts.length > ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreProducts = () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    
    setTimeout(() => {
      const startIndex = page * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const newProducts = allProducts.slice(startIndex, endIndex);
      
      if (newProducts.length > 0) {
        setProducts(prev => [...prev, ...newProducts]);
        setPage(prev => prev + 1);
        setHasMore(endIndex < allProducts.length);
      } else {
        setHasMore(false);
      }
      
      setLoadingMore(false);
    }, 500);
  };

  useEffect(() => {
    fetchInitialProducts();
  }, []);

  return (
    <section className="max-w-9xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">New Products</h2>
        <p className="text-gray-600">Discover our latest additions</p>
        <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-green-500 mx-auto mt-4"></div>
      </div>

      {loading ? (
        <div className="flex flex-col justify-center items-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading amazing products...</p>
        </div>
      ) : (
        <>
          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            {products
            .filter((product) => product.status === "Active" )
            .map((product, index) => (
              <Link
                key={product.id || index}
                to={`/product/${product.id}`}
                className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 hover:border-blue-200"
              >
                <div className="relative overflow-hidden">
                  <span className="absolute top-3 left-3 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-medium px-3 py-1 rounded-full shadow-lg z-10">
                    New
                  </span>
                  <img
                    src={product.mainImage || fallbackImage}
                    alt={product.name}
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                    {product.name}
                  </h3>
                  <p className="text-gray-500 text-sm mb-3 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Sold By Manufacturer
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-xl text-gray-900">
                      ₹{product.price}
                      <span className="text-sm font-normal text-gray-500 ml-1">per pack</span>
                    </p>
                    <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-200">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Load More Section */}
          {hasMore && (
            <div className="text-center py-8">
              <button
                onClick={loadMoreProducts}
                disabled={loadingMore}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-full hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                {loadingMore ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                    Loading More...
                  </>
                ) : (
                  <>
                    Load More Products
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </>
                )}
              </button>
              <p className="text-gray-500 text-sm mt-3">
                Showing {products.length} of {allProducts.length} products
              </p>
            </div>
          )}

          {/* End Message */}
          {!hasMore && products.length > 0 && (
            <div className="text-center py-12 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">You've seen it all!</h3>
                <p className="text-gray-600">You've viewed all {allProducts.length} available products.</p>
              </div>
            </div>
          )}

          {/* No Products */}
          {products.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-2.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 009.586 13H7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">No Products Found</h3>
                <p className="text-gray-600">Check back later for new products.</p>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default More;
