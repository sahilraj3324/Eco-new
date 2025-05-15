import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api'

export default function VendorProducts() {
  const [products, setProducts] = useState([])
  const [vendor, setVendor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortDirection, setSortDirection] = useState('asc')
  const { vendorId } = useParams()
  const navigate = useNavigate()

  // Fetch vendor and their products
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch vendor details
        try {
          const vendorData = await api.seller.getById(vendorId)
          setVendor(vendorData)
        } catch (err) {
          console.error(`Error fetching vendor ${vendorId}:`, err)
          setError(`Failed to fetch vendor details: ${err.message}`)
          // Continue anyway to try to fetch products
        }
        
        // Fetch products for this vendor
        try {
          const productsData = await api.product.getBySeller(vendorId)
          
          // Handle different API response formats
          if (Array.isArray(productsData)) {
            setProducts(productsData)
          } else if (productsData && Array.isArray(productsData.value)) {
            setProducts(productsData.value)
          } else {
            console.error('Unexpected API response format:', productsData)
            setProducts([])
            setError((prevError) => prevError || 'Received invalid product data from the server')
          }
        } catch (err) {
          console.error(`Error fetching products for vendor ${vendorId}:`, err)
          setProducts([])
          
          // Set specific error message for 404 Not Found
          if (err.response && err.response.status === 404) {
            setError('Products API endpoint not found. The API might be unavailable or configured incorrectly.')
          } else {
            setError((prevError) => prevError || `Failed to fetch products: ${err.message}`)
          }
        }
      } finally {
        setLoading(false)
      }
    }

    if (vendorId) {
      fetchData()
    }
  }, [vendorId])

  const handleSort = (field) => {
    if (field === sortBy) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDirection('asc')
    }
  }

  // Filter products based on search term
  const filteredProducts = products.filter(product => 
    product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product?.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product?.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(product?.price || '').includes(searchTerm)
  )

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

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 justify-between md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/vendors" className="text-cyan-600 hover:text-cyan-800">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
            </Link>
            <h1 className="text-2xl font-semibold text-gray-800">
              {vendor?.storename ? `${vendor.storename}'s Products` : 'Vendor Products'}
            </h1>
          </div>
          {vendor && (
            <p className="mt-1 text-sm text-gray-600">
              {vendor.email} • {vendor.phoneNumber}
            </p>
          )}
        </div>
        <div className="flex gap-4">
          <div className="relative">
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
            to={`/products/add?vendorId=${vendorId}`}
            className="rounded-md bg-cyan-500 px-4 py-2 text-white hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
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
              {error.includes('API') && (
                <div className="mt-2">
                  <button 
                    className="text-sm font-medium text-red-600 hover:text-red-800"
                    onClick={() => navigate('/vendors')}
                  >
                    Return to Vendors list
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-500"></div>
        </div>
      ) : (
        <>
          {sortedProducts.length === 0 && !error ? (
            <div className="mt-4 rounded-md bg-white p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search terms.' : 'This vendor has not added any products yet.'}
              </p>
              <div className="mt-6">
                <Link
                  to={`/products/add?vendorId=${vendorId}`}
                  className="inline-flex items-center rounded-md border border-transparent bg-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                  Add a product
                </Link>
              </div>
            </div>
          ) : sortedProducts.length > 0 && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedProducts.map((product) => (
                <div key={product.id} className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow transition-all hover:shadow-md">
                  <div className="relative h-48 overflow-hidden bg-gray-200">
                    <img
                      src={product.mainImage || (product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : 'https://placehold.co/300x200/EEFCFF/00B1CC?text=Product')}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900 line-clamp-1">{product.name}</h3>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="text-lg font-semibold text-gray-900">${parseFloat(product.price || 0).toFixed(2)}</div>
                      <div className="text-sm text-gray-500">Stock: {product.stock || 0}</div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>Category: {product.category || 'N/A'}</div>
                      <div>Brand: {product.brand || 'N/A'}</div>
                    </div>
                    <div className="mt-4 flex space-x-2 pt-2 border-t border-gray-200">
                      <Link 
                        to={`/products/${product.id}`}
                        className="flex-1 rounded-md bg-cyan-100 px-3 py-1.5 text-center text-sm font-medium text-cyan-700 hover:bg-cyan-200"
                      >
                        Edit
                      </Link>
                      <Link 
                        to={`/products/${product.id}/details`}
                        className="flex-1 rounded-md bg-gray-100 px-3 py-1.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-200"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
} 