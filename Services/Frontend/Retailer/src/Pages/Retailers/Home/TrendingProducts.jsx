import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import shirt from './shirtimage.png';

const TrendingProducts = () => {
  const scrollRef = useRef();

  const scroll = (direction) => {
    const { current } = scrollRef;
    if (direction === 'left') {
      current.scrollBy({ left: -250, behavior: 'smooth' });
    } else {
      current.scrollBy({ left: 250, behavior: 'smooth' });
    }
  };

  const products = Array(12).fill({
    name: 'Premium Cotton Casual Shirt',
    seller: 'Trusted Supplier',
    price: '450/- Per Pack',
    image: shirt,
  });

  return (
    <section className="px-4 py-8 relative">
      <h2 className="text-2xl font-semibold mb-6 text-center">Trending Products</h2>

      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-2 hover:bg-gray-100"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Scrollable Product List */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 px-8 scroll-smooth no-scrollbar"
        >
          {products.map((product, index) => (
            <div
              key={index}
              className="min-w-[192px] w-48 flex-shrink-0 text-center relative"
            >
              <span className="absolute top-2 left-2 bg-white text-black text-xs px-2 py-1 rounded-md shadow">
                Trending
              </span>
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-40 object-contain rounded-xl"
              />
              <div className="mt-2 text-sm">
                <p className="leading-tight">{product.name}</p>
                <p className="text-gray-500 text-xs">Sold By {product.seller}</p>
                <p className="mt-1">{product.price}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow rounded-full p-2 hover:bg-gray-100"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
};

export default TrendingProducts;
