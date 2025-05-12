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
            .filter((product) => product.status === "In Review" || "pending")
            .map((product, index) => (
              <Link
                key={product.id || index}
                to={`/product/${product.id}`}
                className="min-w-[192px] w-48 flex-shrink-0 text-center text-decoration-none text-black relative hover:shadow-lg transition-shadow duration-300 rounded-xl"
              >
                <span className="absolute top-2 left-2 bg-white text-black text-xs px-2 py-1 rounded-md shadow">
                  Recently Added
                </span>
                <img
                  src={product.mainImage || fallbackImage}
                  alt={product.name}
                  className="w-full h-40 object-contain rounded-xl"
                />
                <div className="mt-2 text-sm">
                  <p className="leading-tight font-medium">{product.name}</p>
                  <p className="text-gray-500 text-xs">Sold By Manufacturer</p>
                  <p className="mt-1 font-semibold">{product.price}/- Per Pack</p>
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
