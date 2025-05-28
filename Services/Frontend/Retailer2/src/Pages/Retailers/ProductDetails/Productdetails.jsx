import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import fallbackImage from './shirtimage.png';
import NewProducts from '../Home/Newproduct';
import { Star, StarHalf, Upload, Image as ImageIcon, X, Loader2 } from 'lucide-react';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState(fallbackImage);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [selectedSize, setSelectedSize] = useState('');
  const navigate = useNavigate();
  const [reviewImages, setReviewImages] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/Product/${id}`);
        const data = await res.json();
        setProduct(data);

        // Ensure imageUrls is always an array
        let imageUrls = data.imageUrls;
        if (typeof imageUrls === 'string') {
          try {
            imageUrls = JSON.parse(imageUrls);
          } catch {
            imageUrls = [];
          }
        }
        if (!Array.isArray(imageUrls)) imageUrls = [];
        imageUrls = imageUrls.filter(url => typeof url === 'string' && url.trim() !== '');
        data.imageUrls = imageUrls;

        // Set main image robustly
        if (data.imageUrls.length > 0) {
          setMainImage(data.imageUrls[0]);
        } else if (data.mainImage) {
          setMainImage(data.mainImage);
        } else {
          setMainImage(fallbackImage);
        }

        // Initialize selected variants for each color
        const initialVariants = {};
        const uniqueColors = [...new Set(data.variants?.map(v => v.color || v.Color) || [])];
        const uniqueSizes = [...new Set(data.variants?.map(v => v.size || v.Size) || [])];
        
        // Set initial size
        const firstSize = uniqueSizes[0];
        if (firstSize) {
          setSelectedSize(firstSize);
          
          // Initialize variants for each color with the first available size
          uniqueColors.forEach(color => {
            const variantForColorAndSize = data.variants?.find(v => 
              (v.color || v.Color) === color && (v.size || v.Size) === firstSize
            );
            if (variantForColorAndSize) {
              // Normalize the variant object to use lowercase field names
              const normalizedVariant = {
                id: variantForColorAndSize.id || variantForColorAndSize.Id,
                size: variantForColorAndSize.size || variantForColorAndSize.Size,
                color: variantForColorAndSize.color || variantForColorAndSize.Color,
                weight: variantForColorAndSize.weight || variantForColorAndSize.Weight,
                stock: variantForColorAndSize.stock || variantForColorAndSize.Stock,
                price: variantForColorAndSize.price || variantForColorAndSize.Price
              };
              
              initialVariants[color] = {
                ...normalizedVariant,
                quantity: 1
              };
            }
          });
        }
        
        setSelectedVariants(initialVariants);

        console.log('Initialized variants:', initialVariants); // Debug log
        console.log('Available colors:', uniqueColors); // Debug log
        console.log('Available sizes:', uniqueSizes); // Debug log
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };

    fetchProduct();
  }, [id]);

  const handleQuantityChange = (color, change) => {
    setSelectedVariants(prev => ({
      ...prev,
      [color]: {
        ...prev[color],
        quantity: Math.max(1, (prev[color]?.quantity || 1) + change),
      }
    }));
  };

  const handleSizeChange = (size) => {
    setSelectedSize(size);

    // Only keep colors that are available for the new size
    const availableColors = product.variants
      .filter(v => (v.size || v.Size) === size)
      .map(v => v.color || v.Color);

    const updatedVariants = {};
    availableColors.forEach(color => {
      const variantForColorAndSize = product.variants?.find(
        v => (v.color || v.Color) === color && (v.size || v.Size) === size
      );
      if (variantForColorAndSize) {
        // Normalize the variant object to use lowercase field names
        const normalizedVariant = {
          id: variantForColorAndSize.id || variantForColorAndSize.Id,
          size: variantForColorAndSize.size || variantForColorAndSize.Size,
          color: variantForColorAndSize.color || variantForColorAndSize.Color,
          weight: variantForColorAndSize.weight || variantForColorAndSize.Weight,
          stock: variantForColorAndSize.stock || variantForColorAndSize.Stock,
          price: variantForColorAndSize.price || variantForColorAndSize.Price
        };
        updatedVariants[color] = {
          ...normalizedVariant,
          quantity: selectedVariants[color]?.quantity || 1
        };
      }
    });
    setSelectedVariants(updatedVariants);
  };

  const handleAddToCart = async () => {
    if (!product || !selectedSize) {
      alert('Please select a size');
      return;
    }

    const userId = localStorage.getItem('Id') || 'guest-user';
    const cartItems = [];

    console.log('Selected variants:', selectedVariants);
    console.log('Selected size:', selectedSize);

    // Create cart items for each selected color with quantity > 0
    Object.entries(selectedVariants).forEach(([color, variant]) => {
      console.log(`Processing color: ${color}, variant:`, variant);
      
      if (variant && variant.quantity > 0) {
        // Find the exact variant for this color-size combination
        const exactVariant = product.variants?.find(v => 
          (v.color || v.Color) === color && (v.size || v.Size) === selectedSize
        );
        
        console.log(`Exact variant found for ${color}-${selectedSize}:`, exactVariant);
        
        if (exactVariant) {
          // Normalize the exact variant to ensure consistent field names
          const normalizedExactVariant = {
            id: exactVariant.id || exactVariant.Id,
            size: exactVariant.size || exactVariant.Size,
            color: exactVariant.color || exactVariant.Color,
            weight: exactVariant.weight || exactVariant.Weight,
            stock: exactVariant.stock || exactVariant.Stock,
            price: exactVariant.price || exactVariant.Price
          };
          
          const cartItem = {
            id: crypto.randomUUID(),
            userId: userId,
            productId: product.id,
            product: product,
            variantId: normalizedExactVariant.id,
            quantity: variant.quantity,
            addedAt: new Date().toISOString()
          };
          cartItems.push(cartItem);
          console.log(`Cart item created for ${color}-${selectedSize}:`, cartItem);
        } else {
          console.warn(`No variant found for color: ${color}, size: ${selectedSize}`);
          alert(`Warning: No variant available for ${color} in size ${selectedSize}. This item will be skipped.`);
        }
      } else {
        console.log(`Skipping ${color} - no quantity or invalid variant`);
      }
    });

    console.log('Final cart items to be added:', cartItems);

    if (cartItems.length === 0) {
      alert('Please select at least one valid item with quantity greater than 0');
      return;
    }

    try {
      // Add each cart item separately
      let successCount = 0;
      for (const cartItem of cartItems) {
        console.log('Sending cart item to API:', cartItem);
        const res = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cartItem),
        });

        if (!res.ok) {
          const errorData = await res.json();
          console.error('Failed to add to cart:', errorData);
          console.error('Cart item that failed:', cartItem);
          
          // Get variant details for better error message
          const failedVariant = product.variants?.find(v => v.id === cartItem.variantId);
          const variantInfo = failedVariant ? `${failedVariant.color} - ${failedVariant.size}` : 'variant';
          
          alert(`Failed to add ${variantInfo} to cart: ${errorData.title || errorData.message || 'Unknown error'}`);
          return;
        } else {
          successCount++;
          console.log(`Successfully added cart item ${successCount}/${cartItems.length}`);
        }
      }

      alert(`Successfully added ${successCount} separate cart item(s) to your cart!`);
      navigate('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Error adding to cart: ' + error.message);
    }
  };

  // Wishlist function
  const handleAddToWishlist = async () => {
    if (!product) return;
    setWishlistLoading(true);
    const userId = localStorage.getItem('Id') || 'guest-user';
    const wishlistItem = {
      Id: crypto.randomUUID(),
      UserId: userId,
      ProductId: product.id,
      Product: product,
      AddedAt: new Date().toISOString()
    };
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wishlistItem),
      });
      if (!res.ok) {
        const errorData = await res.json();
        alert('Failed to add to wishlist: ' + (errorData.message || 'Unknown error'));
        setWishlistLoading(false);
        return;
      }
      alert('Added to wishlist!');
      navigate('/wishlist');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      alert('Error adding to wishlist!');
    } finally {
      setWishlistLoading(false);
    }
  };

  // Get colors available for the selected size
  const getColorsForSelectedSize = () => {
    if (!product?.variants) return [];
    return [
      ...new Set(
        product.variants
          .filter(v => (v.size || v.Size) === selectedSize)
          .map(v => v.color || v.Color)
      ),
    ];
  };

  // Get unique sizes
  const getUniqueSizes = () => {
    if (!product?.variants) return [];
    return [...new Set(product.variants.map(v => v.size))];
  };

  // Get color hex code (you might want to map color names to hex codes)
  const getColorHex = (colorName) => {
    const colorMap = {
      'Orange': '#FF8C00',
      'Black': '#000000',
      'Green': '#00FF00',
      'Gray': '#808080',
      'Grey': '#808080',
      'Blue': '#0080FF',
      'Yellow': '#FFD700',
      'Cyan': '#00FFFF',
      'Red': '#FF0000',
      'White': '#FFFFFF',
      'Pink': '#FFC0CB',
      'Purple': '#800080',
      'Brown': '#8B4513',
      'Navy': '#000080',
      'Maroon': '#800000',
      'Lime': '#32CD32',
      'Olive': '#808000',
      'Teal': '#008080',
      'Silver': '#C0C0C0',
      'Gold': '#FFD700',
      'Indigo': '#4B0082',
      'Violet': '#8A2BE2',
      'Turquoise': '#40E0D0',
      'Coral': '#FF7F50',
      'Salmon': '#FA8072',
      'Khaki': '#F0E68C',
      'Beige': '#F5F5DC',
      'Cream': '#FFFDD0'
    };
    
    const normalizedColor = colorName?.charAt(0).toUpperCase() + colorName?.slice(1).toLowerCase();
    return colorMap[normalizedColor] || colorMap[colorName] || '#6B7280'; // Default to gray-500 if color not found
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
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Quantities</h3>
            <div className="grid grid-cols-2 gap-4">
              {getColorsForSelectedSize().map((color) => {
                const currentVariant = selectedVariants[color];
                const isValidVariant = currentVariant && currentVariant.color === color && currentVariant.size === selectedSize;
                
                return (
                  <div key={color} className={`flex items-center justify-between p-3 rounded-lg border ${
                    isValidVariant ? 'bg-gray-50' : 'bg-gray-200 opacity-60'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span 
                        className="w-6 h-6 rounded-full border border-gray-300" 
                        style={{ backgroundColor: getColorHex(color) }}
                      />
                      <span className="text-sm font-medium text-gray-700">{color}</span>
                      {!isValidVariant && (
                        <span className="text-xs text-red-500">(Not available in {selectedSize})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleQuantityChange(color, -1)} 
                        disabled={!isValidVariant}
                        className="w-8 h-8 bg-white border border-gray-300 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-600 font-semibold"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-medium text-gray-800">
                        {isValidVariant ? (currentVariant.quantity || 1) : 0}
                      </span>
                      <button 
                        onClick={() => handleQuantityChange(color, 1)} 
                        disabled={!isValidVariant}
                        className="w-8 h-8 bg-white border border-gray-300 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-600 font-semibold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Size Selector */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Size</h3>
            <div className="grid grid-cols-3 gap-3">
              {getUniqueSizes().map(size => (
                <button
                  key={size}
                  onClick={() => handleSizeChange(size)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    selectedSize === size 
                      ? 'bg-blue-500 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Selected Items Summary */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-gray-900 mb-2">Cart Items to be Added:</h4>
              <div className="space-y-1 text-sm">
                {Object.entries(selectedVariants).map(([color, variant]) => {
                  const isValidVariant = variant && variant.color === color && variant.size === selectedSize;
                  const exactVariant = product.variants?.find(v => 
                    (v.color || v.Color) === color && (v.size || v.Size) === selectedSize
                  );
                  
                  return (
                    isValidVariant && variant.quantity > 0 && exactVariant && (
                      <div key={color} className="flex justify-between items-center bg-white px-3 py-2 rounded border">
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-4 h-4 rounded-full border border-gray-300" 
                            style={{ backgroundColor: getColorHex(color) }}
                          />
                          <span className="font-medium">{color} - {selectedSize}</span>
                          <span className="text-xs text-gray-500">(Variant ID: {(exactVariant.id || exactVariant.Id).slice(0, 8)}...)</span>
                        </div>
                        <div className="text-right">
                          <div>Qty: {variant.quantity}</div>
                          <div className="text-xs text-gray-600">₹{(exactVariant.price || exactVariant.Price) || product.price} each</div>
                        </div>
                      </div>
                    )
                  );
                })}
                {Object.entries(selectedVariants).filter(([color, variant]) => {
                  const isValidVariant = variant && variant.color === color && variant.size === selectedSize;
                  return isValidVariant && variant.quantity > 0;
                }).length === 0 && (
                  <div className="text-gray-500 italic text-center py-2">No items selected</div>
                )}
              </div>
              {Object.entries(selectedVariants).filter(([color, variant]) => {
                const isValidVariant = variant && variant.color === color && variant.size === selectedSize;
                return isValidVariant && variant.quantity > 0;
              }).length > 0 && (
                <div className="border-t border-blue-200 mt-3 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">
                      Total Cart Items: {Object.entries(selectedVariants).filter(([color, variant]) => {
                        const isValidVariant = variant && variant.color === color && variant.size === selectedSize;
                        return isValidVariant && variant.quantity > 0;
                      }).length}
                    </span>
                    <span className="font-semibold text-lg">
                      ₹{Object.entries(selectedVariants).reduce((total, [color, variant]) => {
                        const isValidVariant = variant && variant.color === color && variant.size === selectedSize;
                        if (isValidVariant && variant.quantity > 0) {
                          const exactVariant = product.variants?.find(v => 
                            (v.color || v.Color) === color && (v.size || v.Size) === selectedSize
                          );
                          return total + (variant.quantity * ((exactVariant?.price || exactVariant?.Price) || product.price));
                        }
                        return total;
                      }, 0)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Each color variant will be added as a separate cart item
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-full text-sm font-semibold transition-colors"
              >
                Add To Cart
              </button>
              <button
                onClick={handleAddToWishlist}
                className="flex-1 bg-gray-200 hover:bg-orange-500 hover:text-white text-gray-800 py-3 rounded-full text-sm font-semibold transition-colors flex items-center justify-center"
                disabled={wishlistLoading}
              >
                {wishlistLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : null}
                {wishlistLoading ? 'Adding...' : 'Add To Wishlist'}
              </button>
            </div>
          </div>

          {/* Product Meta */}
          <div className="text-sm text-gray-700 space-y-2 mt-4">
            <h4 className="text-md font-bold text-gray-900">Product Details</h4>
            <p><strong>Name:</strong> {product.name}</p>
            <p><strong>Material:</strong> {product.material}</p>
            <p><strong>Brand:</strong> {product.brand}</p>
            <p><strong>Category:</strong> {product.category}</p>
            <p><strong>Subcategory:</strong> {product.subcategory}</p>
            <p><strong>GST:</strong> {product.gst}%</p>
            <p><strong>HSN Code:</strong> {product.hsn1}</p>
            <p><strong>Added On:</strong> {new Date(product.createdAt).toLocaleDateString()}</p>
            <p><strong>Pattern:</strong> {product.pattern}</p>
            <p><strong>Fit/Shape:</strong> {product.fitShape}</p>
            <p><strong>Neck Type:</strong> {product.neckType}</p>
            <p><strong>Sleeve Length:</strong> {product.sleeveLength}</p>
            <p><strong>Occasion:</strong> {product.occasion}</p>
            <p><strong>MOQ:</strong> {product.moq} Packs (Each pack contains {product.piecesPerPack} items)</p>
            <p className="pt-2">{product.description}</p>
            <p className="pt-2">
              <strong>Average Delivery Time:</strong> {product.shipsIn} days<br />
              <strong>Status:</strong> {product.status}<br />
              <strong>Stock:</strong> {product.stock} units available
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