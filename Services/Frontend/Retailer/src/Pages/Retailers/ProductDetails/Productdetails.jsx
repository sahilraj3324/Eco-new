import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import fallbackImage from './shirtimage.png';
import NewProducts from '../Home/Newproduct';
import logo from "../../../assets/logo.png";
import {  Menu, X } from 'lucide-react';
        // <-- Import your footer

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState(fallbackImage);
  const [quantities, setQuantities] = useState({});
  const [selectedSize, setSelectedSize] = useState('');
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const footerSections = [
    {
      title: "Explore",
      links: ["Top Products", "Trending Products", "New Products", "Find Vendors", "Post Requirements", "View All"]
    },
    {
      title: "Seller",
      links: ["Become A Seller", "Add Products", "Manage Products", "My Profile", "Orders", "Payments", "Dashboard"]
    },
    {
      title: "Quick Links",
      links: ["Help & Support", "About Ecocys", "FAQs", "Privacy Policy", "Refund Policy", "Terms Of Use"]
    },
    {
      title: "User",
      links: ["My Cart", "My Wishlist", "My Account", "Help & Support"]
    },
    {
      title: "Social",
      links: ["Instagram", "Facebook", "YouTube", "Twitter"]
    }
  ];
  
    // Simulated auth status (replace with context or localStorage logic)
    const isLoggedIn = true;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/Product/${id}`);
        const data = await res.json();
        setProduct(data);

        if (data.imageUrls?.length > 0) {
          setMainImage(data.imageUrls[0]);
        }

        const initialQuantities = {};
        data.colorOptions?.forEach(color => {
          initialQuantities[color.name] = 1;
        });
        setQuantities(initialQuantities);

        if (data.sizes?.length > 0) {
          setSelectedSize(data.sizes[0]);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    fetchProduct();
  }, [id]);

  const handleQuantityChange = (colorName, change) => {
    setQuantities(prev => ({
      ...prev,
      [colorName]: Math.max(1, (prev[colorName] || 1) + change),
    }));
  };

  const handleAddToCart = async () => {
    if (!product) return;

    const userId = localStorage.getItem('Id') || 'guest-user';

    const cartItem = {
      Id: crypto.randomUUID(),
      UserId: userId,
      ProductId: product.id,
      Product: product,
      Quantity: 1,
      AddedAt: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cartItem),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Failed to add to cart:', errorData);
        return;
      }

      console.log('✅ Added to cart successfully!');
      navigate('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  if (!product) return <div className="text-center mt-10">Loading...</div>;

  

  return (
    <>
      <header className="flex flex-col md:flex-row items-center justify-between p-4 bg-white shadow-md rounded-2xl gap-4 mx-4 mt-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src={logo} alt="EcoCys Logo" className="h-10 w-auto" />
        </div>

        {/* Search Bar */}
        <Link to="/all">
        <input
          type="text"
          placeholder="Search Products, Sellers & More..."
          className="border rounded-full px-4 py-2 w-full max-w-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        </Link>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Navigation */}
        <nav
          className={`w-full md:w-auto flex-col md:flex-row md:flex flex-wrap items-center justify-center md:justify-end gap-4 text-sm text-gray-700 transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? 'flex' : 'hidden md:flex'
          }`}
        >
          {['Men', 'Women', 'Boy', 'Girl', 'View All', 'Become A Seller'].map(link => (
            <Link
              key={link}
              href="#"
              className="text-decoration-none"
            >
              <li className='text-purple-600 font-medium transition-all duration-200 '> {link}</li>
              
            </Link>
          ))}

          {isLoggedIn ? (
            <button
              onClick={() => {
                console.log("Logout clicked");
                // Add logout logic here (e.g., remove token, redirect)
              }}
              className="text-red-600 font-medium hover:text-red-800 transition"
            >
              Logout
            </button>
          ) : (
            <a
              href="#"
              className="hover:text-purple-600 font-medium transition-all duration-200"
            >
              Login / Sign Up
            </a>
          )}
        </nav>
      </header>

      <div className="flex flex-col lg:flex-row gap-6 p-6 lg:p-10 bg-gray-50">
        {/* Thumbnails */}
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

        {/* Main Image */}
        <div className="flex-1 flex justify-center items-start">
          <img src={mainImage} alt="Main Product" className="w-full max-w-md rounded-xl shadow-lg object-contain" />
        </div>

        {/* Product Details */}
        <div className="lg:w-1/2 space-y-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">{product.name}</h1>
            <p className="text-lg font-medium text-gray-700">INR {product.price}/-</p>
          </div>

          {/* Quantity Selector */}
          <div>
            <h3 className="text-md font-semibold text-gray-800 mb-2">Select Quantities</h3>
            <div className="grid grid-cols-3 gap-3">
              {product.colorOptions?.map(({ name, color }) => (
                <div key={name} className="flex items-center justify-between p-2 border rounded-md">
                  <div className="flex items-center gap-2">
                    <span className={`w-4 h-4 rounded-full`} style={{ backgroundColor: color }} />
                    <span className="text-sm font-medium">{name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleQuantityChange(name, -1)} className="w-6 h-6 bg-gray-200 rounded-full">−</button>
                    <span>{quantities[name]}</span>
                    <button onClick={() => handleQuantityChange(name, 1)} className="w-6 h-6 bg-gray-200 rounded-full">+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Size Selector */}
          <div>
            <h3 className="text-md font-semibold text-gray-800 mb-2">Select Size</h3>
            <div className="flex flex-wrap gap-2">
              {product.sizes?.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 rounded-full text-sm ${selectedSize === size ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white py-3 rounded text-sm font-semibold"
            >
              Add To Cart
            </button>
            <button
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded text-sm font-semibold"
            >
              Add To Wishlist
            </button>
          </div>

          {/* Product Meta */}
          <div className="text-sm text-gray-700 space-y-1 mt-4">
            <h4 className="text-md font-bold">Product Details</h4>
            <p><strong>Name:</strong> {product.name}</p>
            <p><strong>Fabric:</strong> {product.fabric}</p>
            <p><strong>Category:</strong> {product.category}</p>
            <p><strong>GST:</strong> {product.gst}</p>
            <p><strong>Added On:</strong> {new Date(product.createdAt).toLocaleDateString()}</p>
            <p><strong>Pattern:</strong> {product.pattern}</p>
            <p><strong>MOQ:</strong> {product.moq} Packs (Each pack contains {product.packSize} items)</p>
            <p className="pt-2">{product.description}</p>
            <p className="pt-2">
              <strong>State:</strong> {product.state}, {product.city}<br />
              <strong>Average Delivery Time:</strong> {product.shipsIn} days<br />
              <strong>Sold By:</strong> {product.seller}, {product.city}
            </p>
          </div>
        </div>
      </div>

      <NewProducts />
      <footer className="py-10 mt-10 bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 text-sm text-gray-600">
          {footerSections.map((section, index) => (
            <div key={index}>
              <h4 className="mb-3 font-bold text-gray-800">{section.title}</h4>
              {section.links.map(link => (
                <a key={link} href="#" className="block hover:text-purple-500 transition">
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">
          © 2025 EcoCys. All Rights Reserved.
        </p>
      </footer>
    </>
  );
};

export default ProductDetails;
