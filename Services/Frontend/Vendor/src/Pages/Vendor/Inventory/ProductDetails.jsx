import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../api";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [editingVariant, setEditingVariant] = useState(null);
  const [tempValues, setTempValues] = useState({});
  const [updateLoading, setUpdateLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`/api/Product/${id}`);
        setProduct(response.data);
        if (response.data.imageUrls && response.data.imageUrls.length > 0) {
          setSelectedImage(response.data.imageUrls[0]);
        } else if (response.data.mainImage) {
          setSelectedImage(response.data.mainImage);
        }
        if (response.data.variants && response.data.variants.length > 0) {
          setSelectedVariant(response.data.variants[0]);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to fetch product details");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
      case "in review":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "paused":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = (e) => {
    e.target.src = "/placeholder.png";
    setImageLoading(false);
  };

  const handleEditVariant = (variant, field) => {
    setEditingVariant({ id: variant.id, field });
    setTempValues({
      ...tempValues,
      [`${variant.id}_${field}`]: variant[field]
    });
  };

  const handleCancelEdit = () => {
    setEditingVariant(null);
    setTempValues({});
  };

  const handleAddStock = async (variant) => {
    const addValue = tempValues[`${variant.id}_addstock`];
    
    if (!addValue || parseInt(addValue) <= 0) {
      handleCancelEdit();
      return;
    }

    setUpdateLoading(true);
    try {
      const additionalStock = parseInt(addValue);
      const newStockValue = parseInt(variant.stock) + additionalStock;
      const newStock2Value = parseInt(variant.stock2 || 0) + additionalStock;
      
      // Update the variant in the product - add to both stock and stock2
      const updatedVariants = product.variants.map(v => 
        v.id === variant.id 
          ? { 
              ...v, 
              stock: newStockValue.toString(),
              stock2: newStock2Value.toString()
            }
          : v
      );

      // Calculate new total stock for the product
      const newTotalStock = updatedVariants.reduce((sum, v) => {
        return sum + parseInt(v.stock || 0);
      }, 0);

      // Update the entire product using the general update endpoint
      const updatedProduct = {
        ...product,
        stock: newTotalStock,
        variants: updatedVariants
      };

      await axios.put(`/api/Product/update/${id}`, updatedProduct, {
        headers: { "Content-Type": "application/json" }
      });

      // Update the local state
      setProduct(prevProduct => ({
        ...prevProduct,
        stock: newTotalStock,
        variants: updatedVariants
      }));

      // If this was the selected variant, update it too
      if (selectedVariant?.id === variant.id) {
        setSelectedVariant(prev => ({
          ...prev,
          stock: newStockValue.toString(),
          stock2: newStock2Value.toString()
        }));
      }

      setEditingVariant(null);
      setTempValues({});
      
    } catch (err) {
      console.error(`Error adding stock:`, err);
      alert(`Failed to add stock. Please try again.`);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleTempValueChange = (variantId, field, value) => {
    setTempValues({
      ...tempValues,
      [`${variantId}_${field}`]: value
    });
  };

  const handleDeleteProduct = async () => {
    setDeleteLoading(true);
    try {
      await axios.delete(`/api/Product/delete/${id}`);
      navigate(-1);
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Failed to delete product. Please try again.");
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleEditProduct = () => {
    navigate(`/edit-product/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Product</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <div className="text-gray-400 text-5xl mb-4">📦</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 bg-white p-4 rounded-lg shadow-sm">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors mb-4 sm:mb-0"
          >
            <span className="text-lg">←</span>
            <span className="font-medium">Back to Products</span>
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(product.status)}`}>
              {product.status || "Unknown"}
            </span>
            {product.trending === "true" && (
              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                🔥 Trending
              </span>
            )}
            {product.top === "true" && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                ⭐ Top Product
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square w-full bg-gray-100 rounded-lg overflow-hidden shadow-md">
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
              <img
                src={selectedImage || "/placeholder.png"}
                alt={product.name}
                className="w-full h-full object-cover"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            </div>
            {product.imageUrls && product.imageUrls.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {product.imageUrls.map((image, index) => (
                  <div key={index} className="flex-shrink-0">
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className={`w-20 h-20 object-cover rounded-lg cursor-pointer border-2 transition-all ${
                        selectedImage === image ? "border-blue-600 shadow-md" : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedImage(image)}
                      onError={(e) => (e.target.src = "/placeholder.png")}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
              <p className="text-gray-600 text-base md:text-lg leading-relaxed">{product.description}</p>
            </div>

            {/* Price and Stock */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Pricing & Inventory</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Price</p>
                  <p className="text-2xl font-bold text-green-600">₹{product.price}</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Stock</p>
                  <p className="text-xl font-semibold text-blue-600">{product.stock} units</p>
                </div>
              </div>
            </div>

            {/* Basic Details */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Product Information</h3>
              <div className="">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Category:</span>
                  <span className="text-gray-800">{product.category}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Subcategory:</span>
                  <span className="text-gray-800">{product.subcategory || "N/A"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Brand:</span>
                  <span className="text-gray-800">{product.brand}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Material:</span>
                  <span className="text-gray-800">{product.material}</span>
                </div>
              </div>
            </div>

            {/* Product Specifications */}
            {(product.gst || product.hsn1 || product.moq || product.piecesPerPack || product.shipsIn || product.minOrderQuantity) && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Business Specifications</h3>
                <div className="">
                  {product.gst && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500 font-medium">GST:</span>
                      <span className="text-gray-800">{product.gst}</span>
                    </div>
                  )}
                  {product.hsn1 && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500 font-medium">HSN Code:</span>
                      <span className="text-gray-800 font-mono text-sm">{product.hsn1}</span>
                    </div>
                  )}
                  {product.moq && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500 font-medium">MOQ:</span>
                      <span className="text-gray-800">{product.moq}</span>
                    </div>
                  )}
                  {product.minOrderQuantity && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500 font-medium">Min Order Quantity:</span>
                      <span className="text-gray-800">{product.minOrderQuantity}</span>
                    </div>
                  )}
                  {product.piecesPerPack && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500 font-medium">Pieces/Pack:</span>
                      <span className="text-gray-800">{product.piecesPerPack}</span>
                    </div>
                  )}
                  {product.shipsIn && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500 font-medium">Ships In:</span>
                      <span className="text-gray-800">{product.shipsIn}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Fashion Details (if applicable) */}
            {(product.fitShape || product.neckType || product.occasion || product.pattern || product.sleeveLength) && (
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Fashion Details</h3>
                <div className="">
                  {product.fitShape && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500 font-medium">Fit/Shape:</span>
                      <span className="text-gray-800">{product.fitShape}</span>
                    </div>
                  )}
                  {product.neckType && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500 font-medium">Neck Type:</span>
                      <span className="text-gray-800">{product.neckType}</span>
                    </div>
                  )}
                  {product.occasion && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500 font-medium">Occasion:</span>
                      <span className="text-gray-800">{product.occasion}</span>
                    </div>
                  )}
                  {product.pattern && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500 font-medium">Pattern:</span>
                      <span className="text-gray-800">{product.pattern}</span>
                    </div>
                  )}
                  {product.sleeveLength && (
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-500 font-medium">Sleeve Length:</span>
                      <span className="text-gray-800">{product.sleeveLength}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Variants */}
        {product.variants && product.variants.length > 0 && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold mb-6 text-gray-800">Product Variants</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {product.variants.map((variant, index) => (
                <div
                  key={variant.id || index}
                  className={`p-4 border rounded-lg transition-all ${
                    selectedVariant?.id === variant.id 
                      ? "border-blue-600 bg-blue-50 shadow-md" 
                      : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                  }`}
                  onClick={() => setSelectedVariant(variant)}
                >
                  <div className="space-y-3">
                    {variant.size && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">Size:</span>
                        <span className="font-medium bg-gray-100 px-2 py-1 rounded text-sm">{variant.size}</span>
                      </div>
                    )}
                    {variant.color && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">Color:</span>
                        <span className="font-medium bg-gray-100 px-2 py-1 rounded text-sm">{variant.color}</span>
                      </div>
                    )}
                    {variant.weight && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">Weight:</span>
                        <span className="font-medium bg-gray-100 px-2 py-1 rounded text-sm">{variant.weight}</span>
                      </div>
                    )}
                    
                    {/* Dimensions */}
                    {(variant.height || variant.width || variant.length) && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">Dimensions:</span>
                        <span className="font-medium bg-gray-100 px-2 py-1 rounded text-sm">
                          {variant.height || 0} × {variant.width || 0} × {variant.length || 0} cm
                        </span>
                      </div>
                    )}
                    
                    {variant.height && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">Height:</span>
                        <span className="font-medium bg-purple-100 px-2 py-1 rounded text-sm text-purple-800">
                          {variant.height} cm
                        </span>
                      </div>
                    )}
                    
                    {variant.width && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">Width:</span>
                        <span className="font-medium bg-purple-100 px-2 py-1 rounded text-sm text-purple-800">
                          {variant.width} cm
                        </span>
                      </div>
                    )}
                    
                    {variant.length && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">Length:</span>
                        <span className="font-medium bg-purple-100 px-2 py-1 rounded text-sm text-purple-800">
                          {variant.length} cm
                        </span>
                      </div>
                    )}
                    
                    {variant.stock2 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-sm">Stock2:</span>
                        <span className="font-medium bg-gray-100 px-2 py-1 rounded text-sm">{variant.stock2}</span>
                      </div>
                    )}
                    
                    {/* Current Stock Display */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Current Stock:</span>
                      <span className="font-medium bg-blue-100 px-2 py-1 rounded text-sm text-blue-800">
                        {variant.stock}
                      </span>
                    </div>
                    
                    {/* Add Stock */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Add Stock:</span>
                      <div className="flex items-center space-x-2">
                        {editingVariant?.id === variant.id && editingVariant?.field === 'addstock' ? (
                          <div className="flex items-center space-x-1">
                            <input
                              type="number"
                              min="1"
                              value={tempValues[`${variant.id}_addstock`] || ''}
                              onChange={(e) => handleTempValueChange(variant.id, 'addstock', e.target.value)}
                              className="w-16 px-1 py-1 text-sm border rounded text-center"
                              placeholder="0"
                              autoFocus
                            />
                            <button
                              onClick={() => handleAddStock(variant)}
                              disabled={updateLoading}
                              className="text-green-600 hover:text-green-800 text-xs font-semibold px-2 py-1 bg-green-50 rounded"
                            >
                              Add
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-red-600 hover:text-red-800 text-xs font-semibold px-2 py-1 bg-red-50 rounded"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditVariant(variant, 'addstock');
                            }}
                            className="text-blue-600 hover:text-blue-800 text-xs font-semibold px-3 py-1 bg-blue-50 rounded border border-blue-200"
                            title="Add stock"
                          >
                            + Add Stock
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Price Display */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Price:</span>
                      <span className="font-bold text-green-600">₹{variant.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional Information */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">System Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 mb-1">Product ID</p>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded break-all">{product.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Seller ID</p>
                <p className="font-mono text-sm bg-gray-100 p-2 rounded break-all">{product.sellerId}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 mb-1">Created At</p>
                <p className="text-sm bg-gray-100 p-2 rounded">{formatDate(product.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                <p className="text-sm bg-gray-100 p-2 rounded">{formatDate(product.updatedAt) || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Actions</h3>
          <div className="flex flex-wrap gap-3">
            {/* <button
              onClick={handleEditProduct}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <span>✏️</span>
              <span>Edit Product</span>
            </button> */}
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-6 py-3 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center space-x-2"
            >
              <span>🗑️</span>
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <div className="text-center">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Delete Product</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete "<strong>{product.name}</strong>"? 
                This action cannot be undone and will permanently remove the product from your inventory.
              </p>
              <div className="flex space-x-3 justify-center">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleteLoading}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProduct}
                  disabled={deleteLoading}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
                >
                  {deleteLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <span>🗑️</span>
                      <span>Delete Product</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails; 