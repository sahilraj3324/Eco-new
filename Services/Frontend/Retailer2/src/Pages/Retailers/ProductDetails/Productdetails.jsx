import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import fallbackImage from './shirtimage.png';
import NewProducts from '../Home/Newproduct';
import { Star, StarHalf, Upload, Image as ImageIcon, X, Loader2, Heart, Share, ChevronLeft, ChevronRight } from 'lucide-react';

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
                quantity: 0  // Start with 0 quantity instead of MOQ
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
    setSelectedVariants(prev => {
      const currentVariant = prev[color];
      if (!currentVariant) return prev;

      // Find the exact variant to get its stock and MOQ
      const exactVariant = product.variants?.find(v => 
        (v.color || v.Color) === color && (v.size || v.Size) === selectedSize
      );
      
      const actualStock = parseInt(exactVariant?.stock || exactVariant?.Stock) || 0;
      const currentQuantity = parseInt(currentVariant.quantity) || 0;
      const moq = parseInt(product.moq) || 1;
      
      // If no stock available, prevent any changes
      if (actualStock === 0) {
        return prev;
      }
      
      let newQuantity;
      
      if (change > 0) {
        // Increasing quantity
        if (currentQuantity === 0) {
          // If quantity is 0, jump directly to MOQ (but check if stock allows it)
          newQuantity = Math.min(moq, actualStock);
        } else {
          // Normal increment
          newQuantity = currentQuantity + change;
        }
      } else {
        // Decreasing quantity
        if (currentQuantity === moq) {
          // If at MOQ, jump to 0
          newQuantity = 0;
        } else if (currentQuantity > moq) {
          // Normal decrement but not below MOQ
          newQuantity = Math.max(moq, currentQuantity + change);
        } else {
          // Should not happen, but keep current quantity
          newQuantity = currentQuantity;
        }
      }
      
      // Ensure we don't exceed actual stock
      newQuantity = Math.min(actualStock, newQuantity);

      return {
        ...prev,
        [color]: {
          ...currentVariant,
          quantity: newQuantity,
        }
      };
    });
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
          quantity: selectedVariants[color]?.quantity || 0  // Start with 0 instead of MOQ
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

    // Check if any items are selected and validate stock
    let hasValidItems = false;
    let outOfStockItems = [];

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
          const actualStock = parseInt(exactVariant.stock || exactVariant.Stock) || 0;
          
          // Check if item is out of stock
          if (actualStock === 0) {
            outOfStockItems.push(`${color} (${selectedSize})`);
            return;
          }
          
          // Check if requested quantity exceeds available stock
          if (variant.quantity > actualStock) {
            alert(`Sorry! Only ${actualStock} units available for ${color} in size ${selectedSize}. Please reduce the quantity.`);
            return;
          }
          
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
          hasValidItems = true;
          console.log(`Cart item created for ${color}-${selectedSize}:`, cartItem);
        } else {
          console.warn(`No variant found for color: ${color}, size: ${selectedSize}`);
          alert(`Warning: No variant available for ${color} in size ${selectedSize}. This item will be skipped.`);
        }
      } else {
        console.log(`Skipping ${color} - no quantity or invalid variant`);
      }
    });

    // Show out of stock items if any
    if (outOfStockItems.length > 0) {
      alert(`❌ The following items are out of stock and cannot be added to cart:\n${outOfStockItems.join(', ')}\n\nPlease remove these items or select different variants.`);
      return;
    }

    console.log('Final cart items to be added:', cartItems);

    if (cartItems.length === 0) {
      if (!hasValidItems) {
        alert('Please select at least one item with quantity greater than 0 that is in stock.');
      }
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

      alert(`✅ Successfully added ${successCount} item(s) to your cart!`);
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
        const responseText = await res.text();
        
        // Check if it's the "already in wishlist" message
        if (responseText.includes('already in wishlist')) {
          alert(`${product.name} is already in your wishlist! 💝`);
          setWishlistLoading(false);
          return;
        }
        
        // Try to parse as JSON for other errors
        try {
          const errorData = JSON.parse(responseText);
          alert('Failed to add to wishlist: ' + (errorData.message || 'Unknown error'));
        } catch (jsonError) {
          // If not JSON, show the plain text error
          alert('Failed to add to wishlist: ' + responseText);
        }
        
        setWishlistLoading(false);
        return;
      }
      // Success
      console.log('Successfully added to wishlist'); // Debug log
      alert(`✨ ${product.name} added to your wishlist! Redirecting to wishlist page...`);
      
      // Navigate to wishlist page after successful addition
      setTimeout(() => {
        navigate('/wishlist');
      }, 1500);
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
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent"></div>
        <p className="text-black font-medium">Loading product details...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <span className="cursor-pointer hover:text-cyan-600 transition-colors">Home</span>
          <ChevronRight className="w-4 h-4" />
          <span className="cursor-pointer hover:text-cyan-600 transition-colors">Products</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-black font-medium">{product.name}</span>
        </nav>

        {/* Product Details Section */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-12">
          <div className="flex flex-col lg:flex-row">
            
            {/* Image Gallery Section */}
            <div className="lg:w-1/2 p-8">
              <div className="sticky top-8">
                {/* Main Image */}
                <div className="relative mb-6 group">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg">
                    <img 
                      src={mainImage} 
                      alt="Main Product" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                  </div>

                  {/* Image Navigation Overlay */}
                  <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors">
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <button className="bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg hover:bg-white transition-colors">
                      <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>
                </div>

                {/* Thumbnails */}
                <div className="flex space-x-3 overflow-x-auto pb-2">
                  {product.imageUrls?.map((img, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setMainImage(img)}
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden cursor-pointer transition-all duration-200 ${
                        mainImage === img 
                          ? 'ring-3 ring-cyan-500 ring-offset-2 shadow-lg scale-105' 
                          : 'hover:ring-2 hover:ring-cyan-300 hover:ring-offset-1 hover:scale-105'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`thumbnail-${idx}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>

                {/* Image Description */}
                <div className="mt-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 border border-gray-200">
                  <h4 className="font-semibold text-black mb-2 flex items-center">
                    Description
                  </h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    High-quality product images showcasing different angles and details. 
                    Click on thumbnails to view larger images. These photos accurately represent 
                    the {product.material} material, {product.pattern} pattern, and overall design of this {product.category}.
                  </p>
                  <div className="mt-3 flex items-center text-xs text-gray-500">
                    <span>📸 {product.imageUrls?.length || 1} image{(product.imageUrls?.length || 1) !== 1 ? 's' : ''} available</span>
                    <span className="mx-2">•</span> 
                  </div>
                </div>
              </div>
            </div>

            {/* Product Information Section */}
            <div className="lg:w-1/2 p-8 lg:pl-0">
              <div className="space-y-8">
                
                {/* Product Header */}
                <div className="border-b border-gray-100 pb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl lg:text-4xl font-bold text-black leading-tight mb-2">
                        {product.name}
                      </h1>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          {Array(5).fill(0).map((_, i) => (
                            <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                          ))}
                          <span className="text-gray-600 ml-2">(4.8) • 124 reviews</span>
                        </div>
                      </div>
                      
                      {/* Overall Stock Status */}
                      <div className="mt-3">
                        {(() => {
                          const totalStock = product.variants?.reduce((sum, variant) => {
                            return sum + (parseInt(variant.stock || variant.Stock) || 0);
                          }, 0) || 0;
                          
                          if (totalStock === 0) {
                            return (
                              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800 border border-red-200">
                                ❌ Out of Stock
                              </div>
                            );
                          } else if (totalStock <= 10) {
                            return (
                              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-orange-100 text-orange-800 border border-orange-200">
                                ⚠️ Low Stock ({totalStock} units left)
                              </div>
                            );
                          } else {
                            return (
                              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-200">
                                ✅ In Stock ({totalStock} units available)
                              </div>
                            );
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-baseline space-x-4">
                    <span className="text-4xl font-bold text-cyan-600">₹{product.price}</span>
                  </div>
                </div>

                {/* Size Selector */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-black">Select Size</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {getUniqueSizes().map(size => (
                      <button
                        key={size}
                        onClick={() => handleSizeChange(size)}
                        className={`relative px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
                          selectedSize === size 
                            ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg ring-2 ring-cyan-300' 
                            : 'bg-gray-50 text-black hover:bg-gray-100 border border-gray-200 hover:border-cyan-200'
                        }`}
                      >
                        {size}
                        {selectedSize === size && (
                          <div className="absolute inset-0 rounded-xl bg-white/20"></div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color & Quantity Selector */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-black">Select Colors & Quantities</h3>
                  <div className="space-y-3">
                    {getColorsForSelectedSize().map((color) => {
                      const currentVariant = selectedVariants[color];
                      const isValidVariant = currentVariant && currentVariant.color === color && currentVariant.size === selectedSize;
                      
                      const exactVariant = product.variants?.find(v => 
                        (v.color || v.Color) === color && (v.size || v.Size) === selectedSize
                      );
                      const actualStock = parseInt(exactVariant?.stock || exactVariant?.Stock) || 0;
                      const currentQuantity = parseInt(currentVariant?.quantity) || 0;
                      const isOutOfStock = actualStock === 0;
                      
                      return (
                        <div key={color} className={`relative overflow-hidden rounded-2xl border transition-all duration-200 ${
                          isOutOfStock 
                            ? 'bg-gray-100 border-gray-300 opacity-75' 
                            : isValidVariant 
                              ? 'bg-white border-gray-200 hover:border-cyan-200 shadow-sm hover:shadow-md' 
                              : 'bg-gray-50 border-gray-200 opacity-60'
                        }`}>
                          <div className="p-5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="relative">
                                  <div 
                                    className={`w-8 h-8 rounded-full border-2 border-white shadow-lg ring-2 ${
                                      isOutOfStock ? 'ring-gray-300 opacity-50' : 'ring-gray-100'
                                    }`}
                                    style={{ backgroundColor: isOutOfStock ? '#d1d5db' : getColorHex(color) }}
                                  />
                                  {isOutOfStock && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="w-6 h-0.5 bg-red-500 rotate-45"></div>
                                    </div>
                                  )}
                                  {currentQuantity > 0 && !isOutOfStock && (
                                    <div className="absolute -top-1 -right-1 bg-cyan-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                                      {currentQuantity}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <span className={`font-semibold text-lg ${isOutOfStock ? 'text-gray-500' : 'text-black'}`}>
                                    {color}
                                  </span>
                                  {isOutOfStock ? (
                                    <div className="flex items-center space-x-2">
                                      <p className="text-sm text-red-500 font-semibold">❌ Out of Stock</p>
                                    </div>
                                  ) : isValidVariant ? (
                                    <div className="flex items-center space-x-2">
                                      <p className={`text-sm ${actualStock <= 5 ? 'text-orange-600 font-semibold' : 'text-gray-600'}`}>
                                        {actualStock <= 5 ? '⚠️ ' : ''}
                                        {actualStock} unit{actualStock !== 1 ? 's' : ''} available
                                      </p>
                                      {actualStock <= 5 && actualStock > 0 && (
                                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                                          Low Stock
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-red-500">Not available in {selectedSize}</p>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-3">
                                <button 
                                  onClick={() => handleQuantityChange(color, -1)} 
                                  disabled={isOutOfStock || !isValidVariant || currentQuantity === 0}
                                  className="w-10 h-10 bg-gray-100 border border-gray-200 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-black font-bold transition-all duration-200 hover:scale-110"
                                >
                                  −
                                </button>
                                <div className="w-12 text-center">
                                  <span className={`text-xl font-bold ${isOutOfStock ? 'text-gray-400' : 'text-black'}`}>
                                    {isValidVariant && !isOutOfStock ? currentQuantity : 0}
                                  </span>
                                </div>
                                <button 
                                  onClick={() => handleQuantityChange(color, 1)} 
                                  disabled={isOutOfStock || !isValidVariant || currentQuantity >= actualStock}
                                  className="w-10 h-10 bg-cyan-500 border border-cyan-500 rounded-full hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-white font-bold transition-all duration-200 hover:scale-110"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Selection indicator */}
                          {currentQuantity > 0 && !isOutOfStock && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-cyan-600"></div>
                          )}
                          
                          {/* Out of stock overlay */}
                          {isOutOfStock && (
                            <div className="absolute inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center">
                              <span className="text-red-600 font-bold text-sm bg-white px-3 py-1 rounded-full shadow-lg">
                                OUT OF STOCK
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Cart Summary */}
                <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl border border-cyan-200 overflow-hidden">
                  <div className="p-6">
                    <h4 className="font-bold text-black text-lg mb-4 flex items-center">
                      🛒 Cart Summary
                    </h4>
                    <div className="space-y-3">
                      {Object.entries(selectedVariants).map(([color, variant]) => {
                        const isValidVariant = variant && variant.color === color && variant.size === selectedSize;
                        const exactVariant = product.variants?.find(v => 
                          (v.color || v.Color) === color && (v.size || v.Size) === selectedSize
                        );
                        const actualStock = parseInt(exactVariant?.stock || exactVariant?.Stock) || 0;
                        const isOutOfStock = actualStock === 0;
                        
                        return (
                          isValidVariant && variant.quantity > 0 && exactVariant && !isOutOfStock && (
                            <div key={color} className="bg-white rounded-xl p-4 shadow-sm border border-cyan-100">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                  <div 
                                    className="w-6 h-6 rounded-full border-2 border-white shadow-md" 
                                    style={{ backgroundColor: getColorHex(color) }}
                                  />
                                  <div>
                                    <p className="font-semibold text-black">{color} - {selectedSize}</p>
                                    <p className="text-xs text-gray-500">ID: {(exactVariant.id || exactVariant.Id).slice(0, 8)}...</p>
                                    <p className="text-xs text-green-600">✅ {actualStock} in stock</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-black">Qty: {variant.quantity}</p>
                                  <p className="text-sm text-cyan-600 font-semibold">₹{(exactVariant.price || exactVariant.Price) || product.price} each</p>
                                  <p className="text-xs text-gray-500">
                                    Total: ₹{variant.quantity * ((exactVariant.price || exactVariant.Price) || product.price)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        );
                      })}
                      
                      {/* Show out of stock items that were selected */}
                      {Object.entries(selectedVariants).map(([color, variant]) => {
                        const isValidVariant = variant && variant.color === color && variant.size === selectedSize;
                        const exactVariant = product.variants?.find(v => 
                          (v.color || v.Color) === color && (v.size || v.Size) === selectedSize
                        );
                        const actualStock = parseInt(exactVariant?.stock || exactVariant?.Stock) || 0;
                        const isOutOfStock = actualStock === 0;
                        
                        return (
                          isValidVariant && variant.quantity > 0 && isOutOfStock && (
                            <div key={color} className="bg-red-50 rounded-xl p-4 shadow-sm border border-red-200">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                  <div 
                                    className="w-6 h-6 rounded-full border-2 border-white shadow-md opacity-50" 
                                    style={{ backgroundColor: '#d1d5db' }}
                                  />
                                  <div>
                                    <p className="font-semibold text-gray-600">{color} - {selectedSize}</p>
                                    <p className="text-xs text-red-500 font-semibold">❌ Out of Stock</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-gray-500">Qty: {variant.quantity}</p>
                                  <p className="text-sm text-red-500">Cannot add to cart</p>
                                </div>
                              </div>
                            </div>
                          )
                        );
                      })}
                      
                      {Object.entries(selectedVariants).filter(([color, variant]) => {
                        const isValidVariant = variant && variant.color === color && variant.size === selectedSize;
                        return isValidVariant && variant.quantity > 0;
                      }).length === 0 && (
                        <div className="text-center py-8">
                          <div className="text-gray-400 text-6xl mb-4">🛒</div>
                          <p className="text-gray-500 italic">No items selected</p>
                          <p className="text-sm text-gray-400 mt-1">Select colors and quantities to add to cart</p>
                        </div>
                      )}
                    </div>
                    
                    {Object.entries(selectedVariants).filter(([color, variant]) => {
                      const isValidVariant = variant && variant.color === color && variant.size === selectedSize;
                      const exactVariant = product.variants?.find(v => 
                        (v.color || v.Color) === color && (v.size || v.Size) === selectedSize
                      );
                      const actualStock = parseInt(exactVariant?.stock || exactVariant?.Stock) || 0;
                      return isValidVariant && variant.quantity > 0 && actualStock > 0;
                    }).length > 0 && (
                      <div className="border-t border-cyan-200 mt-6 pt-6">
                        <div className="bg-white rounded-xl p-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-black">
                              Valid Items: {Object.entries(selectedVariants).filter(([color, variant]) => {
                                const isValidVariant = variant && variant.color === color && variant.size === selectedSize;
                                const exactVariant = product.variants?.find(v => 
                                  (v.color || v.Color) === color && (v.size || v.Size) === selectedSize
                                );
                                const actualStock = parseInt(exactVariant?.stock || exactVariant?.Stock) || 0;
                                return isValidVariant && variant.quantity > 0 && actualStock > 0;
                              }).length}
                            </span>
                            <span className="text-2xl font-bold text-cyan-600">
                              ₹{Object.entries(selectedVariants).reduce((total, [color, variant]) => {
                                const isValidVariant = variant && variant.color === color && variant.size === selectedSize;
                                if (isValidVariant && variant.quantity > 0) {
                                  const exactVariant = product.variants?.find(v => 
                                    (v.color || v.Color) === color && (v.size || v.Size) === selectedSize
                                  );
                                  const actualStock = parseInt(exactVariant?.stock || exactVariant?.Stock) || 0;
                                  if (actualStock > 0) {
                                    return total + (variant.quantity * ((exactVariant?.price || exactVariant?.Price) || product.price));
                                  }
                                }
                                return total;
                              }, 0)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600">
                            💡 Each color variant will be added as a separate cart item
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <button
                      onClick={handleAddToCart}
                      disabled={Object.entries(selectedVariants).filter(([color, variant]) => {
                        const isValidVariant = variant && variant.color === color && variant.size === selectedSize;
                        const exactVariant = product.variants?.find(v => 
                          (v.color || v.Color) === color && (v.size || v.Size) === selectedSize
                        );
                        const actualStock = parseInt(exactVariant?.stock || exactVariant?.Stock) || 0;
                        return isValidVariant && variant.quantity > 0 && actualStock > 0;
                      }).length === 0}
                      className={`flex-1 py-4 rounded-2xl text-lg font-bold transition-all duration-200 transform shadow-lg flex items-center justify-center space-x-2 ${
                        Object.entries(selectedVariants).filter(([color, variant]) => {
                          const isValidVariant = variant && variant.color === color && variant.size === selectedSize;
                          const exactVariant = product.variants?.find(v => 
                            (v.color || v.Color) === color && (v.size || v.Size) === selectedSize
                          );
                          const actualStock = parseInt(exactVariant?.stock || exactVariant?.Stock) || 0;
                          return isValidVariant && variant.quantity > 0 && actualStock > 0;
                        }).length > 0 
                          ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white hover:scale-105 hover:shadow-xl cursor-pointer' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <span>🛒</span>
                      <span>{
                        Object.entries(selectedVariants).filter(([color, variant]) => {
                          const isValidVariant = variant && variant.color === color && variant.size === selectedSize;
                          const exactVariant = product.variants?.find(v => 
                            (v.color || v.Color) === color && (v.size || v.Size) === selectedSize
                          );
                          const actualStock = parseInt(exactVariant?.stock || exactVariant?.Stock) || 0;
                          return isValidVariant && variant.quantity > 0 && actualStock > 0;
                        }).length > 0 ? 'Add To Cart' : 'Select Items to Add'
                      }</span>
                    </button>
                    <button
                      onClick={handleAddToWishlist}
                      className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-cyan-500 hover:to-cyan-600 hover:text-white text-black py-4 rounded-2xl text-lg font-bold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                      disabled={wishlistLoading}
                    >
                      {wishlistLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Adding...</span>
                        </>
                      ) : (
                        <>
                          <Heart className="h-5 w-5" />
                          <span>Add To Wishlist</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* View Wishlist Button */}
                  <div className="flex justify-center">
                    <button
                      onClick={() => navigate('/wishlist')}
                      className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white py-3 px-8 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
                    >
                      <Heart className="h-4 w-4 fill-current" />
                      <span>View My Wishlist</span>
                    </button>
                  </div>
                </div>

                {/* Product Meta */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                  <h4 className="text-xl font-bold text-black mb-6 flex items-center">
                    📋 Product Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-semibold text-black">Material:</span>
                        <span className="text-gray-700">{product.material}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-semibold text-black">Brand:</span>
                        <span className="text-gray-700">{product.brand}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-semibold text-black">Category:</span>
                        <span className="text-gray-700">{product.category}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-semibold text-black">Subcategory:</span>
                        <span className="text-gray-700">{product.subcategory}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-semibold text-black">Pattern:</span>
                        <span className="text-gray-700">{product.pattern}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-semibold text-black">Fit/Shape:</span>
                        <span className="text-gray-700">{product.fitShape}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-semibold text-black">Neck Type:</span>
                        <span className="text-gray-700">{product.neckType}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-semibold text-black">Sleeve Length:</span>
                        <span className="text-gray-700">{product.sleeveLength}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-semibold text-black">Occasion:</span>
                        <span className="text-gray-700">{product.occasion}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-semibold text-black">GST:</span>
                        <span className="text-gray-700">{product.gst}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="font-semibold text-black">HSN Code:</span>
                        <span className="text-gray-700">{product.hsn1}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="font-semibold text-black">Added On:</span>
                        <span className="text-gray-700">{new Date(product.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-white rounded-xl border border-gray-200">
                    <h5 className="font-semibold text-black mb-2">📦 Order Information</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="text-center p-3 bg-cyan-50 rounded-lg">
                        <div className="text-cyan-600 font-bold text-lg">{product.moq}</div>
                        <div className="text-gray-600">Min Order Qty (Packs)</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-blue-600 font-bold text-lg">{product.piecesPerPack}</div>
                        <div className="text-gray-600">Pieces Per Pack</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-green-600 font-bold text-lg">{product.shipsIn} days</div>
                        <div className="text-gray-600">Delivery Time</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-between items-center p-4 bg-white rounded-xl border border-gray-200">
                    <div>
                      <span className="font-semibold text-black">Status: </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        product.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.status}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-black">Total Stock: </span>
                      {(() => {
                        const totalStock = product.variants?.reduce((sum, variant) => {
                          return sum + (parseInt(variant.stock || variant.Stock) || 0);
                        }, 0) || 0;
                        
                        return (
                          <span className={`font-bold ${
                            totalStock === 0 ? 'text-red-600' : 
                            totalStock <= 10 ? 'text-orange-600' : 
                            'text-green-600'
                          }`}>
                            {totalStock === 0 ? 'Out of Stock' : `${totalStock} units`}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  
                  {/* Variant Stock Details */}
                  {product.variants && product.variants.length > 0 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <h5 className="font-semibold text-black mb-3">📦 Stock by Variant</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                        {product.variants.map((variant, index) => {
                          const stock = parseInt(variant.stock || variant.Stock) || 0;
                          return (
                            <div key={index} className="flex justify-between items-center py-1 px-2 bg-white rounded text-xs">
                              <span className="text-gray-700">
                                {variant.color || variant.Color} - {variant.size || variant.Size}
                              </span>
                              <span className={`font-semibold ${
                                stock === 0 ? 'text-red-600' : 
                                stock <= 5 ? 'text-orange-600' : 
                                'text-green-600'
                              }`}>
                                {stock === 0 ? 'Out' : stock}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-12">
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-black">Customer Reviews</h2>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-3xl font-bold text-cyan-600">4.8</div>
                  <div className="text-sm text-gray-600">Overall Rating</div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="flex space-x-1">
                    {Array(5).fill(0).map((_, i) => (
                      <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">124 reviews</div>
                </div>
              </div>
            </div>
            
            {/* Existing Reviews */}
            <div className="mb-8">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {dummyReview.user.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-black text-lg">{dummyReview.user}</h3>
                      <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full">
                        {new Date(dummyReview.date).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <div className="flex space-x-1 mr-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${i < Math.floor(dummyReview.rating) ? 'fill-yellow-400 text-yellow-400' : 
                              i === Math.floor(dummyReview.rating) && dummyReview.rating % 1 >= 0.5 ? 'fill-yellow-400 text-yellow-400' : 
                              'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-gray-600 font-semibold">{dummyReview.rating.toFixed(1)}</span>
                    </div>
                    
                    <p className="text-gray-700 leading-relaxed mb-4">{dummyReview.comment}</p>
                    
                    {/* Review Images */}
                    {dummyReview.images.length > 0 && (
                      <div className="flex space-x-3">
                        {dummyReview.images.map((img, idx) => (
                          <div key={idx} className="w-24 h-24 rounded-xl overflow-hidden border-2 border-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 cursor-pointer">
                            <img src={img} alt={`Review ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Write Review Section */}
            <div className="border-t border-gray-200 pt-8">
              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-2xl p-6 border border-cyan-200">
                <h3 className="text-2xl font-bold text-black mb-6 flex items-center">
                  ✍️ Write Your Review
                </h3>
                
                {/* Rating Input */}
                <div className="mb-6">
                  <label className="block text-lg font-semibold text-black mb-3">Your Rating</label>
                  <div className="flex space-x-2">
                    {renderStars(rating)}
                    {rating > 0 && (
                      <span className="ml-3 text-lg font-semibold text-cyan-600">
                        {rating} star{rating !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Review Text */}
                <div className="mb-6">
                  <label htmlFor="review" className="block text-lg font-semibold text-black mb-3">
                    Your Review
                  </label>
                  <textarea
                    id="review"
                    rows="5"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 resize-none text-black"
                    placeholder="Share your experience with this product... What did you like? How was the quality?"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                  ></textarea>
                </div>
                
                {/* Image Upload */}
                <div className="mb-8">
                  <label className="block text-lg font-semibold text-black mb-3">Add Photos (Optional)</label>
                  <div className="flex flex-wrap gap-4">
                    {/* Preview Uploaded Images */}
                    {reviewImages.map((img, idx) => (
                      <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-white shadow-lg">
                        <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeImage(idx)}
                          className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 shadow-lg hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ))}
                    
                    {/* Upload Button */}
                    {reviewImages.length < 5 && (
                      <label className="flex flex-col items-center justify-center w-24 h-24 border-3 border-dashed border-cyan-300 rounded-xl cursor-pointer hover:border-cyan-500 hover:bg-cyan-50 transition-all duration-200 bg-white">
                        <Upload className="w-6 h-6 text-cyan-400 mb-1" />
                        <span className="text-xs text-cyan-600 font-semibold">Upload</span>
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
                  <p className="mt-2 text-sm text-gray-600">📸 You can upload up to 5 images (JPG, PNG)</p>
                </div>
                
                {/* Submit Button */}
                <button
                  onClick={submitReview}
                  disabled={!rating || !reviewText}
                  className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 transform ${
                    rating && reviewText 
                      ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl hover:scale-105' 
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {rating && reviewText ? '🚀 Submit Review' : '⚠️ Please rate and write a review'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-black mb-2">You May Also Like</h2>
            <p className="text-gray-600">Discover more amazing products from our collection</p>
          </div>
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden p-8">
            <NewProducts />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;