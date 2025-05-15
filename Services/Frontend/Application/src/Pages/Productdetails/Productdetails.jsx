import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import NewProductsSection from '../Homepage/NewProducts';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState('');
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/Product/${id}`);
        const data = await res.json();
        setProduct(data);
        setMainImage(data.imageUrls?.[0] || data.mainImage);
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };
    fetchProduct();
  }, [id]);

  const handleQuantityChange = (variantKey, delta) => {
    setQuantities(prev => ({
      ...prev,
      [variantKey]: Math.max((prev[variantKey] || 0) + delta, 0)
    }));
  };

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert("Please select both size and color.");
      return;
    }
    // Add to cart logic here
    console.log("Added to cart:", {
      id: product.id,
      size: selectedSize,
      color: selectedColor
    });
  };

  if (!product) return <p className="p-4">Loading...</p>;

  const sizes = [...new Set(product.variants?.map(v => v.size))];
  const colors = [...new Set(product.variants?.map(v => v.color))];

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 lg:p-10">
      {/* Thumbnail Images */}
      

      {/* Main Image */}
      <div className="flex-1 flex justify-center items-start">
        <img src={mainImage} alt="Main Product" className="w-full max-w-md rounded-xl shadow-lg object-contain" />
      </div>
      <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible w-full lg:w-auto">
        {product.imageUrls?.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt={`thumb-${idx}`}
            onClick={() => setMainImage(img)}
            className={`w-20 h-20 object-cover rounded-md cursor-pointer border-2 ${mainImage === img ? 'border-orange-500' : 'border-transparent'}`}
          />
        ))}
      </div>

      {/* Product Info */}
      <div className="lg:w-1/2 space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">{product.name}</h1>
          <p className="text-lg font-medium text-gray-700">INR {product.price}/-</p>
        </div>

        {/* Size Selector */}
        <div>
          <h3 className="text-md font-semibold text-gray-800 mb-2">Select Size</h3>
          <div className="flex flex-wrap gap-2">
            {sizes.map(size => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 rounded-full text-sm ${
                  selectedSize === size ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Color Selector */}
        <div>
          <h3 className="text-md font-semibold text-gray-800 mb-2 mt-4">Select Color</h3>
          <div className="flex flex-wrap gap-2">
            {colors.map(color => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-8 h-8 rounded-full border-2 ${
                  selectedColor === color ? 'border-orange-500' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded-full text-sm font-semibold"
          >
            Add To Cart
          </button>
          <button className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-full text-sm font-semibold">
            Add To Wishlist
          </button>
        </div>

        {/* Product Meta */}
        <div className="text-sm text-gray-700 space-y-1 mt-4">
          <h4 className="text-md font-bold">Product Details</h4>
          <p><strong>Name:</strong> {product.name}</p>
          <p><strong>Material:</strong> {product.material}</p>
          <p><strong>Category:</strong> {product.category}</p>
          <p><strong>GST:</strong> {product.gst}</p>
          <p><strong>HSN:</strong> {product.hsn1}</p>
          <p><strong>Pattern:</strong> {product.pattern}</p>
          <p><strong>MOQ:</strong> {product.moq} Packs (Each pack contains {product.piecesPerPack} items)</p>
          <p><strong>Occasion:</strong> {product.occasion}</p>
          <p><strong>Fit Shape:</strong> {product.fitShape}</p>
          <p><strong>Neck Type:</strong> {product.neckType}</p>
          <p><strong>Sleeve Length:</strong> {product.sleeveLength}</p>
          <p><strong>Brand:</strong> {product.brand}</p>
          <p><strong>Status:</strong> {product.status}</p>
          <p><strong>Added On:</strong> {new Date(product.createdAt).toLocaleDateString()}</p>
          <p className="pt-2">{product.description}</p>
          <p className="pt-2">
            <strong>Average Delivery Time:</strong> {product.shipsIn} days<br />
            <strong>Sold By:</strong> Manufacturer
          </p>
        </div>
      </div>
      <div className="w-full mt-10">
        <NewProductsSection />
      </div>
    </div>
  );
};

export default ProductDetail;
