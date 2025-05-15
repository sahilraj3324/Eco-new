import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import fallbackImage from './shirtimage.png';
import NewProducts from '../Home/Newproduct';
import { Star, StarHalf, Upload, Image as ImageIcon, X } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState(fallbackImage);
  const [quantities, setQuantities] = useState({});
  const [selectedSize, setSelectedSize] = useState('');
  const navigate = useNavigate();
  const [reviewImages, setReviewImages] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

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

      navigate('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  // Wishlist function
  const handleAddToWishlist = () => {
    if (!product) return;
    // For demo: store wishlist in localStorage as an array
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    // Avoid duplicates
    if (!wishlist.find(item => item.id === product.id)) {
      wishlist.push({
        id: product.id,
        title: product.name,
        price: `₹${product.price}`,
        originalPrice: product.originalPrice ? `₹${product.originalPrice}` : '',
        discount: product.discount || '',
        image: product.imageUrls?.[0] || '',
        rating: product.rating || 0,
      });
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
    alert('Added to wishlist!');
    navigate('/wishlist');
  };

  // Single dummy review data
  const dummyReview = {
    id: 1,
    user: 'Rahul Sharma',
    rating: 4.5,
    date: '2023-10-15',
    comment: 'The fabric quality is excellent and the stitching is perfect. Fits very well!',
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    ]
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => URL.createObjectURL(file));
    setReviewImages([...reviewImages, ...newImages]);
  };

  const removeImage = (index) => {
    const newImages = [...reviewImages];
    newImages.splice(index, 1);
    setReviewImages(newImages);
  };

  const submitReview = () => {
    // In a real app, you would send this to your backend
    console.log({
      rating,
      comment: reviewText,
      images: reviewImages
    });
    alert('Review submitted successfully!');
    setReviewText('');
    setReviewImages([]);
    setRating(0);
  };

  const renderStars = (ratingValue) => {
    return Array(5).fill(0).map((_, i) => {
      const rating = hoverRating || ratingValue;
      return (
        <Star
          key={i}
          className={`w-6 h-6 cursor-pointer transition-colors ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          onMouseEnter={() => setHoverRating(i + 1)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => setRating(i + 1)}
        />
      );
    });
  };

  if (!product) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Product Details Section */}
      <div className="flex flex-col lg:flex-row gap-6 p-6 lg:p-10 bg-white rounded-xl shadow-sm">
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
            <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
            <p className="text-xl font-semibold text-orange-600">₹{product.price}</p>
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
                    <button 
                      onClick={() => handleQuantityChange(name, -1)} 
                      className="w-6 h-6 bg-gray-200 rounded-full hover:bg-gray-300"
                    >
                      −
                    </button>
                    <span className="w-6 text-center">{quantities[name]}</span>
                    <button 
                      onClick={() => handleQuantityChange(name, 1)} 
                      className="w-6 h-6 bg-gray-200 rounded-full hover:bg-gray-300"
                    >
                      +
                    </button>
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
                  className={`px-4 py-2 rounded-full text-sm ${selectedSize === size ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
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
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-full text-sm font-semibold transition-colors"
            >
              Add To Cart
            </button>
            <button
              onClick={handleAddToWishlist}
              className="flex-1 bg-gray-200 hover:bg-orange-500 hover:text-white text-gray-800 py-3 rounded-full text-sm font-semibold transition-colors"
            >
              Add To Wishlist
            </button>
          </div>

          {/* Product Meta */}
          <div className="text-sm text-gray-700 space-y-2 mt-4">
            <h4 className="text-md font-bold text-gray-900">Product Details</h4>
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
              <strong>Sold By:</strong> Manufacturer
            </p>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12 bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Customer Reviews</h2>
        
        {/* Existing Reviews */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="flex mr-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < Math.floor(dummyReview.rating) ? 'fill-yellow-400 text-yellow-400' : 
                    i === Math.floor(dummyReview.rating) && dummyReview.rating % 1 >= 0.5 ? 'fill-yellow-400 text-yellow-400' : 
                    'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-gray-600">{dummyReview.rating.toFixed(1)}</span>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-gray-900">{dummyReview.user}</h3>
              <span className="text-sm text-gray-500">{new Date(dummyReview.date).toLocaleDateString()}</span>
            </div>
            <p className="mt-1 text-gray-600">{dummyReview.comment}</p>
          </div>
          
          {/* Review Images */}
          {dummyReview.images.length > 0 && (
            <div className="flex gap-3 mt-3">
              {dummyReview.images.map((img, idx) => (
                <div key={idx} className="w-20 h-20 rounded-md overflow-hidden border border-gray-200">
                  <img src={img} alt={`Review ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Write Review Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h3>
          
          {/* Rating Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
            <div className="flex">
              {renderStars(rating)}
            </div>
          </div>
          
          {/* Review Text */}
          <div className="mb-4">
            <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-2">
              Your Review
            </label>
            <textarea
              id="review"
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="Share your experience with this product..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            ></textarea>
          </div>
          
          {/* Image Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Add Photos (Optional)</label>
            <div className="flex flex-wrap gap-3">
              {/* Preview Uploaded Images */}
              {reviewImages.map((img, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-md overflow-hidden border border-gray-200">
                  <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm hover:bg-gray-100"
                  >
                    <X className="w-3 h-3 text-gray-600" />
                  </button>
                </div>
              ))}
              
              {/* Upload Button */}
              {reviewImages.length < 5 && (
                <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-orange-500 transition-colors">
                  <Upload className="w-5 h-5 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">Upload</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">You can upload up to 5 images</p>
          </div>
          
          {/* Submit Button */}
          <button
            onClick={submitReview}
            disabled={!rating || !reviewText}
            className={`px-6 py-2 rounded-md font-medium ${rating && reviewText ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
          >
            Submit Review
          </button>
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">You May Also Like</h2>
        <NewProducts />
      </div>
    </div>
  );
};

export default ProductDetails;