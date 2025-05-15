import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'

// Mock data - would be replaced with API calls
const mockProducts = {
  101: { id: 101, name: 'Bamboo Toothbrush', description: 'Eco-friendly bamboo toothbrush with soft bristles', price: 4.99, stock: 120, vendor: 'Eco Friendly Products Inc.', vendorId: 1, imageUrl: 'https://placehold.co/300x300/EEFCFF/00B1CC?text=Product', category: 'Personal Care', featured: true },
  102: { id: 102, name: 'Reusable Water Bottle', description: 'Stainless steel water bottle, BPA free', price: 19.99, stock: 85, vendor: 'Eco Friendly Products Inc.', vendorId: 1, imageUrl: 'https://placehold.co/300x300/EEFCFF/00B1CC?text=Product', category: 'Kitchen', featured: false },
  201: { id: 201, name: 'Recycled Paper Notebook', description: '100% recycled paper notebook with 80 pages', price: 7.99, stock: 150, vendor: 'Green Living Solutions', vendorId: 2, imageUrl: 'https://placehold.co/300x300/EEFCFF/00B1CC?text=Product', category: 'Stationery', featured: false },
  301: { id: 301, name: 'Solar Powered Charger', description: 'Portable solar charger for mobile devices', price: 49.99, stock: 30, vendor: 'Sustainable Goods Co.', vendorId: 3, imageUrl: 'https://placehold.co/300x300/EEFCFF/00B1CC?text=Product', category: 'Electronics', featured: true },
  401: { id: 401, name: 'Recycled Plastic Planter', description: 'Indoor planter made from recycled plastic', price: 18.99, stock: 45, vendor: 'Earth First Supplies', vendorId: 4, imageUrl: 'https://placehold.co/300x300/EEFCFF/00B1CC?text=Product', category: 'Home & Garden', featured: false },
  501: { id: 501, name: 'Organic Cotton Sheets', description: 'Queen size organic cotton bed sheets', price: 89.99, stock: 25, vendor: 'Organic Materials Ltd.', vendorId: 5, imageUrl: 'https://placehold.co/300x300/EEFCFF/00B1CC?text=Product', category: 'Bedding', featured: true },
  601: { id: 601, name: 'Recycled Glass Vase', description: 'Handmade vase from recycled glass', price: 34.99, stock: 20, vendor: 'Eco Innovations', vendorId: 6, imageUrl: 'https://placehold.co/300x300/EEFCFF/00B1CC?text=Product', category: 'Home Decor', featured: false },
}

const categories = [
  'Personal Care',
  'Kitchen',
  'Stationery',
  'Electronics',
  'Home & Garden',
  'Bedding',
  'Home Decor',
  'Clothing',
  'Accessories',
  'Food & Drink'
]

export default function ProductEdit() {
  const { productId } = useParams()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    featured: false,
    imageUrl: ''
  })

  // Simulate API call to fetch product
  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      const numericProductId = parseInt(productId)
      const fetchedProduct = mockProducts[numericProductId]
      
      if (fetchedProduct) {
        setProduct(fetchedProduct)
        setError(null)
      } else {
        setError('Product not found')
      }
      
      setLoading(false)
    }, 500)
  }, [productId])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setProduct({
      ...product,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleNumberChange = (e) => {
    const { name, value } = e.target
    setProduct({
      ...product,
      [name]: parseFloat(value)
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSaving(true)
    
    // Simulate API call to update product
    setTimeout(() => {
      // In a real app, this would be an API call
      console.log('Product updated:', product)
      setSaving(false)
      navigate('/products')
    }, 800)
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <Link to="/products" className="text-sm text-cyan-600 hover:text-cyan-800">
          ← Back to Products
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-gray-800">Edit Product</h1>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={product.name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                rows={3}
                value={product.description}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
              />
            </div>

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Price ($)
              </label>
              <input
                type="number"
                name="price"
                id="price"
                required
                min="0"
                step="0.01"
                value={product.price}
                onChange={handleNumberChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
              />
            </div>

            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
                Stock
              </label>
              <input
                type="number"
                name="stock"
                id="stock"
                required
                min="0"
                value={product.stock}
                onChange={handleNumberChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                name="category"
                id="category"
                value={product.category}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="vendor" className="block text-sm font-medium text-gray-700">
                Vendor
              </label>
              <input
                type="text"
                id="vendor"
                value={product.vendor}
                disabled
                className="mt-1 block w-full rounded-md border border-gray-200 bg-gray-100 px-3 py-2 shadow-sm"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">
                Image URL
              </label>
              <input
                type="text"
                name="imageUrl"
                id="imageUrl"
                value={product.imageUrl}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-cyan-500 focus:outline-none focus:ring-cyan-500"
              />
              {product.imageUrl && (
                <div className="mt-2">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-32 w-32 rounded-md object-cover"
                  />
                </div>
              )}
            </div>

            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="featured"
                  id="featured"
                  checked={product.featured}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                />
                <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                  Featured Product
                </label>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end space-x-3">
            <Link
              to="/products"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-cyan-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 