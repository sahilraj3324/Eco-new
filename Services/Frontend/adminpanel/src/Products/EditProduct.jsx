import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'

export default function EditProduct() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  
  // Product state with all fields from the schema
  const [product, setProduct] = useState({
    id: '',
    name: '',
    description: '',
    price: 0,
    stock: 0,
    sellerId: '',
    status: '',
    category: '',
    brand: '',
    material: '',
    imageUrls: [],
    variants: [],
    subcategory: '',
    gst: '',
    hsn1: '',
    moq: '',
    piecesPerPack: '',
    fitShape: '',
    neckType: '',
    occasion: '',
    pattern: '',
    sleeveLength: '',
    shipsIn: '',
    mainImage: ''
  })

  // Temporary state for handling new variants and images
  const [newVariant, setNewVariant] = useState({ size: '', color: '', weight: '' })
  const [newImageUrl, setNewImageUrl] = useState('')

  // Fetch product data when component loads
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const data = await api.product.getById(id)
        
        // Make sure all expected fields are present and fix any missing/null values
        const processedProduct = {
          ...product, // Default values
          ...data,    // API data
          id: id,     // Ensure ID is set correctly
          // Ensure arrays are properly initialized
          imageUrls: Array.isArray(data.imageUrls) ? data.imageUrls : [],
          variants: Array.isArray(data.variants) ? data.variants : []
        }
        
        setProduct(processedProduct)
      } catch (err) {
        setError(`Failed to load product: ${err.message || 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProduct()
    } else {
      setLoading(false)
      setError('No product ID provided')
    }
  }, [id])

  // Handle input changes for simple fields
  const handleInputChange = (e) => {
    const { name, value, type } = e.target
    
    // Convert numeric string values to numbers
    if (type === 'number') {
      setProduct({ ...product, [name]: parseFloat(value) || 0 })
    } else {
      setProduct({ ...product, [name]: value })
    }
  }

  // Handle adding a new image URL
  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setProduct({
        ...product,
        imageUrls: [...product.imageUrls, newImageUrl.trim()]
      })
      setNewImageUrl('')
    }
  }

  // Handle removing an image URL
  const handleRemoveImage = (index) => {
    const updatedImages = [...product.imageUrls]
    updatedImages.splice(index, 1)
    setProduct({ ...product, imageUrls: updatedImages })
  }

  // Handle changing variant properties
  const handleVariantChange = (e) => {
    const { name, value } = e.target
    setNewVariant({ ...newVariant, [name]: value })
  }

  // Handle adding a new variant
  const handleAddVariant = () => {
    if (newVariant.size || newVariant.color || newVariant.weight) {
      setProduct({
        ...product,
        variants: [...product.variants, { ...newVariant }]
      })
      setNewVariant({ size: '', color: '', weight: '' })
    }
  }

  // Handle removing a variant
  const handleRemoveVariant = (index) => {
    const updatedVariants = [...product.variants]
    updatedVariants.splice(index, 1)
    setProduct({ ...product, variants: updatedVariants })
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      // Create a properly formatted product object for the backend
      // The key is to match C# model property names exactly (PascalCase for some fields)
      const productData = {
        Id: id, // Must use uppercase 'Id' to match C# model
        Name: product.name,
        Description: product.description,
        Price: parseFloat(product.price) || 0,
        Stock: parseInt(product.stock) || 0,
        SellerId: product.sellerId,
        Status: product.status,
        Category: product.category,
        Brand: product.brand,
        Material: product.material,
        // DO NOT include ImageUrls directly as it's handled by ImageUrlsJson in backend
        ImageUrlsJson: JSON.stringify(product.imageUrls || []),
        // Let backend generate VariantsJson from Variants
        Variants: product.variants || [],
        Subcategory: product.subcategory,
        Gst: product.gst,
        Hsn1: product.hsn1,
        MOQ: product.moq, // Note the uppercase MOQ to match C# model
        PiecesPerPack: product.piecesPerPack,
        FitShape: product.fitShape,
        NeckType: product.neckType,
        Occasion: product.occasion,
        Pattern: product.pattern,
        SleeveLength: product.sleeveLength,
        ShipsIn: product.shipsIn,
        MainImage: product.mainImage
      };
      
      console.log('Sending product data:', productData);
      
      // Send update request to API
      const response = await api.product.update(id, productData);
      
      setSuccessMessage('Product updated successfully!');
      
      // Navigate back to products list after a short delay
      setTimeout(() => {
        navigate('/products');
      }, 2000);
    } catch (err) {
      setError(`Failed to update product: ${err.message || 'Unknown error'}`);
      console.error('Error details:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Edit Product</h1>
        <button
          onClick={() => navigate('/products')}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          Back to Products
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Success</h3>
              <div className="mt-2 text-sm text-green-700">{successMessage}</div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="rounded-md bg-white p-6 shadow">
          <div className="mb-6 border-b border-gray-200 pb-4">
            <h2 className="text-lg font-medium text-gray-800">Basic Information</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Product Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={product.name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
              />
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={product.status}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
              >
                <option value="">Select Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Draft">Draft</option>
                <option value="Discontinued">Discontinued</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={product.description}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
              ></textarea>
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                required
                min="0"
                step="0.01"
                value={product.price}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
              />
            </div>

            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                Stock *
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                required
                min="0"
                value={product.stock}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={product.category}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
              />
            </div>

            <div>
              <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700">
                Subcategory
              </label>
              <input
                type="text"
                id="subcategory"
                name="subcategory"
                value={product.subcategory}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
              />
            </div>

            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
                Brand
              </label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={product.brand}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
              />
            </div>

            <div>
              <label htmlFor="material" className="block text-sm font-medium text-gray-700">
                Material
              </label>
              <input
                type="text"
                id="material"
                name="material"
                value={product.material}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
              />
            </div>

            <div>
              <label htmlFor="sellerId" className="block text-sm font-medium text-gray-700">
                Seller ID
              </label>
              <input
                type="text"
                id="sellerId"
                name="sellerId"
                value={product.sellerId}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="rounded-md bg-white p-6 shadow">
          <div className="mb-6 border-b border-gray-200 pb-4">
            <h2 className="text-lg font-medium text-gray-800">Product Details</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="gst" className="block text-sm font-medium text-gray-700">
                GST
              </label>
              <input
                type="text"
                id="gst"
                name="gst"
                value={product.gst}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
              />
            </div>

            <div>
              <label htmlFor="hsn1" className="block text-sm font-medium text-gray-700">
                HSN Code
              </label>
              <input
                type="text"
                id="hsn1"
                name="hsn1"
                value={product.hsn1}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
              />
            </div>

            <div>
              <label htmlFor="moq" className="block text-sm font-medium text-gray-700">
                MOQ (Minimum Order Quantity)
              </label>
              <input
                type="text"
                id="moq"
                name="moq"
                value={product.moq}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
              />
            </div>

            <div>
              <label htmlFor="piecesPerPack" className="block text-sm font-medium text-gray-700">
                Pieces Per Pack
              </label>
              <input
                type="text"
                id="piecesPerPack"
                name="piecesPerPack"
                value={product.piecesPerPack}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
              />
            </div>

            <div>
              <label htmlFor="shipsIn" className="block text-sm font-medium text-gray-700">
                Ships In
              </label>
              <input
                type="text"
                id="shipsIn"
                name="shipsIn"
                value={product.shipsIn}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Clothing Specific Attributes */}
        <div className="rounded-md bg-white p-6 shadow">
          <div className="mb-6 border-b border-gray-200 pb-4">
            <h2 className="text-lg font-medium text-gray-800">Clothing Attributes</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="fitShape" className="block text-sm font-medium text-gray-700">
                Fit/Shape
              </label>
              <input
                type="text"
                id="fitShape"
                name="fitShape"
                value={product.fitShape}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
              />
            </div>

            <div>
              <label htmlFor="neckType" className="block text-sm font-medium text-gray-700">
                Neck Type
              </label>
              <input
                type="text"
                id="neckType"
                name="neckType"
                value={product.neckType}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
              />
            </div>

            <div>
              <label htmlFor="occasion" className="block text-sm font-medium text-gray-700">
                Occasion
              </label>
              <input
                type="text"
                id="occasion"
                name="occasion"
                value={product.occasion}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
              />
            </div>

            <div>
              <label htmlFor="pattern" className="block text-sm font-medium text-gray-700">
                Pattern
              </label>
              <input
                type="text"
                id="pattern"
                name="pattern"
                value={product.pattern}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
              />
            </div>

            <div>
              <label htmlFor="sleeveLength" className="block text-sm font-medium text-gray-700">
                Sleeve Length
              </label>
              <input
                type="text"
                id="sleeveLength"
                name="sleeveLength"
                value={product.sleeveLength}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="rounded-md bg-white p-6 shadow">
          <div className="mb-6 border-b border-gray-200 pb-4">
            <h2 className="text-lg font-medium text-gray-800">Images</h2>
          </div>
          
          <div className="mb-6">
            <label htmlFor="mainImage" className="block text-sm font-medium text-gray-700">
              Main Image URL
            </label>
            <input
              type="text"
              id="mainImage"
              name="mainImage"
              value={product.mainImage}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
            />
            {product.mainImage && (
              <div className="mt-2">
                <img src={product.mainImage} alt="Main product" className="h-32 w-32 object-cover rounded-md" />
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Additional Images</label>
            <div className="mt-1 flex">
              <input
                type="text"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Enter image URL"
                className="block w-full rounded-l-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="inline-flex items-center rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
              >
                Add
              </button>
            </div>
            
            {product.imageUrls.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {product.imageUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url}
                      alt={`Product ${index + 1}`}
                      className="h-32 w-full object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Variants */}
        <div className="rounded-md bg-white p-6 shadow">
          <div className="mb-6 border-b border-gray-200 pb-4">
            <h2 className="text-lg font-medium text-gray-800">Variants</h2>
          </div>
          
          <div className="mb-4 grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="variantSize" className="block text-sm font-medium text-gray-700">
                Size
              </label>
              <input
                type="text"
                id="variantSize"
                name="size"
                value={newVariant.size}
                onChange={handleVariantChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
              />
            </div>
            
            <div>
              <label htmlFor="variantColor" className="block text-sm font-medium text-gray-700">
                Color
              </label>
              <input
                type="text"
                id="variantColor"
                name="color"
                value={newVariant.color}
                onChange={handleVariantChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
              />
            </div>
            
            <div>
              <label htmlFor="variantWeight" className="block text-sm font-medium text-gray-700">
                Weight
              </label>
              <input
                type="text"
                id="variantWeight"
                name="weight"
                value={newVariant.weight}
                onChange={handleVariantChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
              />
            </div>
          </div>
          
          <div className="mb-6">
            <button
              type="button"
              onClick={handleAddVariant}
              className="inline-flex items-center rounded-md border border-transparent bg-cyan-100 px-4 py-2 text-sm font-medium text-cyan-700 hover:bg-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            >
              Add Variant
            </button>
          </div>
          
          {product.variants.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Size</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Color</th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Weight</th>
                    <th scope="col" className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {product.variants.map((variant, index) => (
                    <tr key={index}>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{variant.size || '-'}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{variant.color || '-'}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">{variant.weight || '-'}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium">
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(index)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center rounded-md border border-transparent bg-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
} 