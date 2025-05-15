import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')
  const [viewMode, setViewMode] = useState('table') // 'table' or 'card'
  
  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setViewMode(window.innerWidth < 768 ? 'card' : 'table')
    }
    
    // Check on initial load
    checkScreenSize()
    
    // Add event listener for resize
    window.addEventListener('resize', checkScreenSize)
    
    // Clean up
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await api.product.getAll()
        // Check if the response is an array or has a value property containing an array
        if (Array.isArray(data)) {
          setProducts(data)
        } else if (data && Array.isArray(data.value)) {
          setProducts(data.value)
        } else {
          // If response is not in expected format, set as empty array
          console.error('Unexpected API response format:', data)
          setProducts([])
          setError('Received invalid data from the server')
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch products')
        setProducts([]) // Ensure products is always an array
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleSort = (field) => {
    if (field === sortBy) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDirection('asc')
    }
  }

  // Filter products based on search term
  const filteredProducts = Array.isArray(products) 
    ? products.filter(product => 
        product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product?.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product?.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product?.sellerId?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : []

  // Sort products based on sortBy and sortDirection
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let comparison = 0
    
    if (sortBy === 'name') {
      comparison = (a.name || '').localeCompare(b.name || '')
    } else if (sortBy === 'price') {
      comparison = (a.price || 0) - (b.price || 0)
    } else if (sortBy === 'stock') {
      comparison = (a.stock || 0) - (b.stock || 0)
    } else if (sortBy === 'category') {
      comparison = (a.category || '').localeCompare(b.category || '')
    } else if (sortBy === 'brand') {
      comparison = (a.brand || '').localeCompare(b.brand || '')
    }
    
    return sortDirection === 'asc' ? comparison : -comparison
  })

  const getSortIcon = (field) => {
    if (sortBy !== field) return null
    
    return sortDirection === 'asc' ? (
      <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
      </svg>
    ) : (
      <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    )
  }

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.product.delete(id)
        // Remove the product from the state
        setProducts(products.filter(product => product.id !== id))
      } catch (err) {
        setError(err.message || 'Failed to delete product')
      }
    }
  }

  // Card view for mobile
  const renderProductCards = () => {
    if (sortedProducts.length === 0) {
      return (
        <div className="mt-4 rounded-md bg-white p-4 text-center text-gray-500">
          No products found
        </div>
      )
    }

    return (
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedProducts.map((product) => (
          <div key={product.id} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
            <div className="p-4">
              <div className="flex items-center">
                <div className="h-12 w-12 flex-shrink-0">
                  <img
                    src={product.mainImage || (product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : 'https://placehold.co/100x100/EEFCFF/00B1CC?text=Product')}
                    alt={product.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                  <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                    product.status === 'Active' || product.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.status || 'N/A'}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-700">
                <p className="mb-1 line-clamp-2" title={product.description}>{product.description || 'No description'}</p>
                
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-medium">Category:</span> {product.category || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Brand:</span> {product.brand || 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Price:</span> ${parseFloat(product.price || 0).toFixed(2)}
                  </div>
                  <div>
                    <span className="font-medium">Stock:</span> {product.stock || 0}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end space-x-3 border-t border-gray-200 pt-3">
                <Link 
                  to={`/products/${product.id}`}
                  className="rounded px-3 py-1 text-sm text-cyan-600 hover:bg-cyan-50 hover:text-cyan-900"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDeleteProduct(product.id)}
                  className="rounded px-3 py-1 text-sm text-red-600 hover:bg-red-50 hover:text-red-900"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Table view for desktop
  const renderProductTable = () => {
    return (
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  <button
                    className="flex items-center font-medium"
                    onClick={() => handleSort('name')}
                  >
                    Product
                    {getSortIcon('name')}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  <button
                    className="flex items-center font-medium"
                    onClick={() => handleSort('category')}
                  >
                    Category
                    {getSortIcon('category')}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  <button
                    className="flex items-center font-medium"
                    onClick={() => handleSort('brand')}
                  >
                    Brand
                    {getSortIcon('brand')}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  <button
                    className="flex items-center font-medium"
                    onClick={() => handleSort('price')}
                  >
                    Price
                    {getSortIcon('price')}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  <button
                    className="flex items-center font-medium"
                    onClick={() => handleSort('stock')}
                  >
                    Stock
                    {getSortIcon('stock')}
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {sortedProducts.length > 0 ? (
                sortedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img
                            src={product.mainImage || (product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : 'https://placehold.co/100x100/EEFCFF/00B1CC?text=Product')}
                            alt={product.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500 truncate w-48" title={product.description}>{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-900">{product.category || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{product.subcategory || ''}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-900">{product.brand || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{product.material || ''}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-900">${parseFloat(product.price || 0).toFixed(2)}</div>
                      <div className="text-xs text-gray-500">GST: {product.gst || 'N/A'}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-900">{product.stock || 0}</div>
                      <div className="text-xs text-gray-500">MOQ: {product.moq || 'N/A'}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                        product.status === 'Active' || product.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.status || 'N/A'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm space-x-2">
                      <Link 
                        to={`/products/${product.id}`}
                        className="text-cyan-600 hover:text-cyan-900"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                    No products found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Products</h1>
        <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full rounded-md border border-gray-300 px-4 py-2 pl-10 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
          <Link 
            to="/products/add"
            className="flex justify-center rounded-md bg-cyan-500 px-4 py-2 text-white hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
          >
            Add Product
          </Link>
        </div>
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

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-500"></div>
        </div>
      ) : viewMode === 'table' ? (
        renderProductTable()
      ) : (
        renderProductCards()
      )}
    </div>
  )
} 