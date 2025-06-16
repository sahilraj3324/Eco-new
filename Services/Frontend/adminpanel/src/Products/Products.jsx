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
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
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

  // Get paginated data
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = sortedProducts.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage)

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber)
  
  // Go to next page
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }
  
  // Go to previous page
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

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
    if (currentItems.length === 0) {
      return (
        <div className="mt-4 rounded-md bg-white p-4 text-center text-gray-500">
          No products found
        </div>
      )
    }

    return (
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {currentItems.map((product) => (
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
                  className="rounded px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 hover:text-blue-900"
                >
                  View
                </Link>
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
              {currentItems.length > 0 ? (
                currentItems.map((product) => (
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
                      <div className="text-sm text-gray-900">₹{parseFloat(product.price || 0).toFixed(2)}</div>
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
                        className="text-blue-600 hover:text-blue-900 mr-2"
                      >
                        View
                      </Link>
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

  // Pagination component
  const renderPagination = () => {
    if (sortedProducts.length <= itemsPerPage) return null;
    
    return (
      <div className="mt-4 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${
              currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
            }`}
          >
            Previous
          </button>
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${
              currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
            }`}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
              <span className="font-medium">
                {indexOfLastItem > sortedProducts.length ? sortedProducts.length : indexOfLastItem}
              </span>{' '}
              of <span className="font-medium">{sortedProducts.length}</span> results
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ${
                  currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                }`}
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* Page numbers */}
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                // Show limited page numbers
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => paginate(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        currentPage === pageNumber
                          ? 'z-10 bg-cyan-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600'
                          : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                }
                
                // Show ellipsis
                if (
                  (pageNumber === 2 && currentPage > 3) ||
                  (pageNumber === totalPages - 1 && currentPage < totalPages - 2)
                ) {
                  return (
                    <span
                      key={pageNumber}
                      className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300"
                    >
                      ...
                    </span>
                  );
                }
                
                return null;
              })}
              
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ${
                  currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                }`}
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

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
          <div className="flex items-center">
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1); // Reset to first page when changing items per page
              }}
              className="rounded-md border border-gray-300 px-3 py-2 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>
          </div>
          {/* <Link 
            to="/products/add"
            className="flex justify-center rounded-md bg-cyan-500 px-4 py-2 text-white hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
          >
            Add Product
          </Link> */}
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
        <>
          {renderProductTable()}
          {renderPagination()}
        </>
      ) : (
        <>
          {renderProductCards()}
          {renderPagination()}
        </>
      )}
    </div>
  )
} 
