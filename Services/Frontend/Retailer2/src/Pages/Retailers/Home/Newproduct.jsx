import React, { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import fallbackImage from './shirtimage.png';

const NewProducts = () => {
  const scrollRef = useRef();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const scroll = (direction) => {
    const { current } = scrollRef;
    if (direction === 'left') {
      current.scrollBy({ left: -250, behavior: 'smooth' });
    } else {
      current.scrollBy({ left: 250, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/Product/get-all');
        const data = await res.json();
        const sortedProducts = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setProducts(sortedProducts);
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section className="px-4 py-8 relative">
      <h2 className="text-2xl font-semibold mb-6 text-center">New Products</h2>

      <div className="relative">
        <button onClick={() => scroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-2 hover:bg-gray-100">
          <ChevronLeft size={20} />
        </button>

        <div ref={scrollRef} className="flex overflow-x-auto gap-4 px-8 scroll-smooth no-scrollbar">
          {loading ? (
            <p className="text-center w-full">Loading...</p>
          ) : (
            products
            .filter((product) => product.status === "Active")
            .map((product, index) => (
              <Link
                key={product.id || index}
                to={`/product/${product.id}`}
                className="min-w-[220px] w-56 flex-shrink-0 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 hover:border-blue-200"
              >
                <div className="relative overflow-hidden">
                  <span className="absolute top-3 left-3 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-medium px-3 py-1 rounded-full shadow-lg z-10">
                    New
                  </span>
                  <img
                    src={product.mainImage || fallbackImage}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                    {product.name}
                  </h3>
                  <p className="text-gray-500 text-xs mb-3 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Sold By Manufacturer
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-lg text-gray-900">
                      ₹{product.price}
                      <span className="text-xs font-normal text-gray-500 ml-1">per pack</span>
                    </p>
                    <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors duration-200">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        <button onClick={() => scroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-2 hover:bg-gray-100">
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
};

export default NewProducts;
