import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api'; // Assuming your api utility is in the parent directory

// Placeholder for a carousel component or a simple image display
const ImageCarousel = ({ images, productName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <img src="https://placehold.co/600x400/EEFCFF/00B1CC?text=No+Image" alt="No product images" className="object-contain h-full w-full rounded-lg" />
      </div>
    );
  }

  const goToPrevious = () => {
    const isFirstImage = currentIndex === 0;
    const newIndex = isFirstImage ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastImage = currentIndex === images.length - 1;
    const newIndex = isLastImage ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="overflow-hidden rounded-lg shadow-lg">
        <img 
          src={images[currentIndex]} 
          alt={`${productName} - Image ${currentIndex + 1}`} 
          className="w-full h-96 object-cover" // Fixed height for carousel images
        />
      </div>
      {images.length > 1 && (
        <>
          <button 
            onClick={goToPrevious}
            className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 focus:outline-none"
          >
            &#10094; {/* Left arrow */}
          </button>
          <button 
            onClick={goToNext}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 focus:outline-none"
          >
            &#10095; {/* Right arrow */}
          </button>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full ${currentIndex === index ? 'bg-cyan-500' : 'bg-gray-300'} hover:bg-cyan-400 focus:outline-none`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default function ViewProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Function to handle product deletion
  const handleDeleteProduct = async () => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.product.delete(id); // Use the id from useParams
        // Navigate back to products list or show a success message
        navigate('/products'); 
      } catch (err) {
        setError(err.message || 'Failed to delete product');
        // Optionally, display this error more prominently on the page
      }
    }
  };

  // Function to handle status update
  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      setError(null);
      
      // Create updated product data
      const updatedProduct = {
        ...product,
        status: newStatus
      };
      
      await api.product.update(id, updatedProduct);
      
      // Update local state
      setProduct(prev => ({ ...prev, status: newStatus }));
      setStatusMessage(`✅ Product status updated to ${newStatus}`);
      
      // Clear message after 3 seconds
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      setError(`Failed to update status: ${err.message || 'Unknown error'}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.product.getById(id); // Assuming an API method like getById
        setProduct(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch product details');
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="h-16 w-16 animate-spin rounded-full border-b-4 border-t-4 border-cyan-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
        <Link to="/products" className="mt-4 inline-block bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded">
          Back to Products
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-xl text-gray-600">Product not found.</p>
        <Link to="/products" className="mt-4 inline-block bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-4 rounded">
          Back to Products
        </Link>
      </div>
    );
  }
  
  // Normalize imageUrls to ensure it's always an array
  const imageUrls = (() => {
    let urls = [];
    
    // Try to get imageUrls from different possible sources
    if (Array.isArray(product.imageUrls)) {
      urls = product.imageUrls;
    } else if (typeof product.imageUrls === 'string') {
      try {
        // Try to parse as JSON string
        const parsed = JSON.parse(product.imageUrls);
        if (Array.isArray(parsed)) {
          urls = parsed;
        }
      } catch (e) {
        // If parsing fails, treat as single URL
        urls = [product.imageUrls];
      }
    } else if (typeof product.imageUrlsJson === 'string') {
      try {
        const parsed = JSON.parse(product.imageUrlsJson);
        if (Array.isArray(parsed)) {
          urls = parsed;
        }
      } catch (e) {
      }
    }
    
    // Add main image if available and not already in urls
    if (product.mainImage && !urls.includes(product.mainImage)) {
      urls.unshift(product.mainImage); // Add to beginning
    }
    
    return urls.filter(url => url && url.trim() !== ''); // Remove empty URLs
  })();

  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        {/* Back Button */}
        <div className="p-4 border-b">
            <Link 
                to="/products" 
                className="inline-flex items-center text-cyan-600 hover:text-cyan-800 transition-colors duration-150"
            >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"></path>
                </svg>
                Back to Products
            </Link>
        </div>

        {/* Image Carousel */}
        <div className="p-4 md:p-6">
          <ImageCarousel images={imageUrls} productName={product.name || 'Product'} />
        </div>

        {/* Product Details */}
        <div className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2 md:mb-0">{product.name || 'N/A'}</h1>
            
            {/* Status Toggle */}
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => handleStatusUpdate('In Review')}
                  disabled={updatingStatus}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                    product.status === 'In Review' 
                      ? 'bg-yellow-500 text-white shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                  } ${updatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {updatingStatus && product.status !== 'In Review' ? (
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                  ) : (
                    'In Review'
                  )}
                </button>
                <button
                  onClick={() => handleStatusUpdate('Active')}
                  disabled={updatingStatus}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-all duration-200 ${
                    product.status === 'Active' 
                      ? 'bg-green-500 text-white shadow-sm' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                  } ${updatingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {updatingStatus && product.status !== 'Active' ? (
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                  ) : (
                    'Active'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Status and Error Messages */}
          {statusMessage && (
            <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-800 border border-green-300">
              {statusMessage}
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-800 border border-red-300">
              {error}
            </div>
          )}

          <p className="text-gray-600 mt-4 text-md leading-relaxed">{product.description || 'No description available.'}</p>

          <div className="mt-6 border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Product Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm text-gray-600">
              <div><strong className="font-medium text-gray-800">Price:</strong> ₹{parseFloat(product.price || 0).toFixed(2)}</div>
              <div><strong className="font-medium text-gray-800">Stock:</strong> {product.stock || 0} units</div>
              <div><strong className="font-medium text-gray-800">Category:</strong> {product.category || 'N/A'}</div>
              <div><strong className="font-medium text-gray-800">Subcategory:</strong> {product.subcategory || 'N/A'}</div>
              <div><strong className="font-medium text-gray-800">Brand:</strong> {product.brand || 'N/A'}</div>
              <div><strong className="font-medium text-gray-800">Material:</strong> {product.material || 'N/A'}</div>
              {/* <div><strong className="font-medium text-gray-800">Seller ID:</strong> {product.sellerId || 'N/A'}</div> */}
              <div><strong className="font-medium text-gray-800">GST:</strong> {product.gst ? `${product.gst}` : 'N/A'}</div>
              <div><strong className="font-medium text-gray-800">HSN:</strong> {product.hsn1 || 'N/A'}</div>
              <div><strong className="font-medium text-gray-800">MOQ:</strong> {product.moq || 'N/A'}</div>
              <div><strong className="font-medium text-gray-800">Pieces/Pack:</strong> {product.piecesPerPack || 'N/A'}</div>
              <div><strong className="font-medium text-gray-800">Ships In:</strong> {product.shipsIn || 'N/A'}</div>
              <div><strong className="font-medium text-gray-800">Created At:</strong> {new Date(product.createdAt).toLocaleDateString()}</div>
              
              {/* Variants */}
              {product.variants?.length > 0 && (
                <div className="md:col-span-2">
                  <strong className="font-medium text-gray-800">Variants:</strong>
                  <div className="mt-2 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Color</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {product.variants.map((variant, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 whitespace-nowrap">{variant.size || 'N/A'}</td>
                            <td className="px-4 py-2 whitespace-nowrap">{variant.color || 'N/A'}</td>
                            <td className="px-4 py-2 whitespace-nowrap">₹{variant.price?.toFixed(2) || 'N/A'}</td>
                            <td className="px-4 py-2 whitespace-nowrap">{variant.stock || 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-4 md:p-6 border-t flex justify-end space-x-3">
            <Link 
                to={`/products/${product.id}/edit`} // Link to the edit page
                className="px-6 py-2 rounded-md bg-cyan-500 text-white hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition-colors duration-150"
            >
                Edit Product
            </Link>
            <button
                onClick={handleDeleteProduct}
                className="px-6 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-150"
            >
                Delete Product
            </button>
        </div>
      </div>
    </div>
  );
} 
