import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import fallbackImage from './shirtimage.png';

const NewProducts2 = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <h2 className="text-2xl font-semibold mb-6 text-center">New Products 2</h2>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="h-[280px] bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products
            .filter((product) => product.status === "In Review" || product.status === "pending")
            .map((product, index) => (
              <Link
                key={product.id || index}
                to={`/product/${product.id}`}
                className="min-w-[192px] w-48 text-center text-decoration-none text-black relative hover:shadow-lg transition-shadow duration-300 rounded-xl"
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
            ))}
        </div>
      )}
    </section>
  );
};

export default NewProducts2;