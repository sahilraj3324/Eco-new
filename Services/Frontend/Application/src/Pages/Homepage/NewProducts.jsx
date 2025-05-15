import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import shirtImg from '../../assets/men shirts.png'; // Update the path if needed

const NewProductsSection = () => {
  const scrollRef = useRef();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const scroll = (direction) => {
    const { current } = scrollRef;
    if (current) {
      current.scrollBy({
        left: direction === 'left' ? -250 : 250,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/Product/get-all');
        const data = await res.json();
        const sortedProducts = data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
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
    <div className="mt-6">
      <h2 className="text-xl font-bold text-slate-700 mb-3">New Products</h2>

      <div className="relative">
        <button
          onClick={() => scroll('left')}
          aria-label="Scroll left"
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow px-2 py-1 rounded-full"
        >
          ◀
        </button>
        <button
          onClick={() => scroll('right')}
          aria-label="Scroll right"
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow px-2 py-1 rounded-full"
        >
          ▶
        </button>

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 scroll-smooth"
        >
          {loading ? (
            <p className="px-4 py-2">Loading...</p>
          ) : products.length === 0 ? (
            <p className="px-4 py-2">No products found.</p>
          ) : (
            products.map((product) => (
              <div
                key={product.id}
                onClick={() => navigate(`/product/${product.id}`)}
                className="bg-white rounded-2xl p-3 min-w-[70vw] shadow-md relative cursor-pointer hover:shadow-lg transition"
              >
                <div className="absolute top-2 left-2 bg-gray-100 px-3 py-1 rounded-full text-xs font-semibold">
                  Recently Added
                </div>
                <img
                  src={product.mainImage }
                  alt={product.name}
                  className="w-full h-30 rounded-xl object-contain"
                />
                <p className="text-sm font-semibold mt-2">{product.name}</p>
                <p className="text-xs text-gray-500">
                  {product.seller || 'Sold by Wholesaler'}
                </p>
                <p className="font-bold text-base text-black mt-1">
                  {product.price || 'N/A'} /- Per Pack
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NewProductsSection;
