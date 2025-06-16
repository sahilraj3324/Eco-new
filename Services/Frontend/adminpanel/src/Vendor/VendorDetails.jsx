import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'

export default function VendorDetails() {
  const [vendor, setVendor] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [productsError, setProductsError] = useState(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  
  // Pagination states for products
  const [currentPage, setCurrentPage] = useState(1)
  const [productsPerPage, setProductsPerPage] = useState(6)
  
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    fetchVendorDetails()
    fetchVendorProducts()
  }, [id])

  const fetchVendorDetails = async () => {
    try {
      setLoading(true)
      const data = await api.seller.getById(id)
      setVendor(data)
      setError(null)
    } catch (err) {
      setError('Failed to fetch vendor details. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const fetchVendorProducts = async () => {
    try {
      setProductsLoading(true)
      const data = await api.product.getBySeller(id)
      setProducts(Array.isArray(data) ? data : [])
      setProductsError(null)
    } catch (err) {
      setProductsError('Failed to load vendor products. Please try again later.')
      setProducts([])
    } finally {
      setProductsLoading(false)
    }
  }

  const updateVendorStatus = async (status) => {
    try {
      setUpdatingStatus(true)
      await api.seller.updateStatus(id, status)
      // Update the local vendor state with new status
      setVendor(prev => ({ ...prev, status }))
      setError(null)
    } catch (err) {
      setError('Failed to update vendor status. Please try again later.')
    } finally {
      setUpdatingStatus(false)
    }
  }

  // Get paginated products
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct)
  const totalPages = Math.ceil(products.length / productsPerPage)

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

  // Pagination component for products
  const renderPagination = () => {
    if (products.length <= productsPerPage) return null;
    
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
              Showing <span className="font-medium">{indexOfFirstProduct + 1}</span> to{' '}
              <span className="font-medium">
                {indexOfLastProduct > products.length ? products.length : indexOfLastProduct}
              </span>{' '}
              of <span className="font-medium">{products.length}</span> products
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

  const getStatusBadge = (status) => {
    if (!status) return null
    
    const statusColors = {
      'Approved': 'bg-green-100 text-green-800',
      'Not Approved': 'bg-red-100 text-red-800',
      'InReview': 'bg-yellow-100 text-yellow-800',
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    )
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
    )
  }

  if (!vendor) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Vendor not found</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold text-gray-800 mr-3">Vendor Details</h1>
          {getStatusBadge(vendor.status)}
        </div>
        <div class="flex gap-2">
          <button
            onClick={() => navigate(`/vendors/${id}/edit`)}
            className="rounded-md bg-cyan-500 px-4 py-2 text-white hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
          >
            Edit Vendor
          </button>
          <button
            onClick={() => navigate('/vendors')}
            className="rounded-md bg-gray-100 px-4 py-2 text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Back to Vendors
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:space-x-6 mb-6">
            {vendor.profile_picture ? (
              <img
                src={vendor.profile_picture}
                alt={vendor.storename}
                className="h-24 w-24 rounded-full object-cover mb-4 md:mb-0"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center mb-4 md:mb-0">
                <span className="text-gray-500">No image</span>
              </div>
            )}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{vendor.storename}</h2>
              <p className="text-gray-500 text-lg">{vendor.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-medium text-gray-700 mb-3">Contact Information</h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="text-sm text-gray-900">{vendor.phoneNumber}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="text-sm text-gray-900">{vendor.email}</dd>
                </div>
              </dl>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-medium text-gray-700 mb-3">Business Information</h3>
              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">GST Number</dt>
                  <dd className="text-sm text-gray-900">{vendor.gstNumber || 'Not provided'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="text-sm text-gray-900">
                    {vendor.address || 'Not provided'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm font-medium text-gray-500">PIN Code</dt>
                  <dd className="text-sm text-gray-900">{vendor.pincode || 'Not provided'}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Approval Actions */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Vendor Approval Actions</h3>
            <p className="mb-4 text-sm text-gray-600">
              {vendor.status === 'Approved' 
                ? 'This vendor is currently approved and can add products to the platform.'
                : vendor.status === 'Not Approved'
                  ? 'This vendor is currently not approved. They can log in but cannot add products.'
                  : 'This vendor is pending review. Please approve or reject them.'}
            </p>
            
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => updateVendorStatus('Approved')}
                disabled={updatingStatus || vendor.status === 'Approved'}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
                ${vendor.status === 'Approved' 
                  ? 'bg-green-300 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'}`}
              >
                {vendor.status === 'Approved' ? 'Already Approved' : 'Approve Vendor'}
              </button>
              
              <button
                onClick={() => updateVendorStatus('Not Approved')}
                disabled={updatingStatus || vendor.status === 'Not Approved'}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
                ${vendor.status === 'Not Approved' 
                  ? 'bg-red-300 cursor-not-allowed' 
                  : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2'}`}
              >
                {vendor.status === 'Not Approved' ? 'Already Rejected' : 'Reject Vendor'}
              </button>
              
              <button
                onClick={() => updateVendorStatus('InReview')}
                disabled={updatingStatus || vendor.status === 'InReview'}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
                ${vendor.status === 'InReview' 
                  ? 'bg-yellow-300 cursor-not-allowed' 
                  : 'bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2'}`}
              >
                {vendor.status === 'InReview' ? 'Already In Review' : 'Mark as In Review'}
              </button>
            </div>

            {updatingStatus && (
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-cyan-500"></div>
                Updating vendor status...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Vendor Products</h2>
          <div className="flex items-center space-x-4">
            <select
              value={productsPerPage}
              onChange={(e) => {
                setProductsPerPage(Number(e.target.value));
                setCurrentPage(1); // Reset to first page when changing items per page
              }}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value={6}>6 per page</option>
              <option value={12}>12 per page</option>
              <option value={24}>24 per page</option>
            </select>
            <button
              onClick={() => navigate(`/vendors/${id}/add-product`)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="-ml-1 mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Product
            </button>
          </div>
        </div>

        {productsError && (
          <div className="mx-6 my-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{productsError}</p>
              </div>
            </div>
          </div>
        )}

        {productsLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-cyan-500"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No products found for this vendor. Click "Add Product" to add one.
          </div>
        ) : (
          <div>
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {currentProducts.map((product) => (
                  <div key={product.id} className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {product.mainImage ? (
                            <img className="h-12 w-12 rounded-md object-cover" src={product.mainImage} alt={product.name} />
                          ) : (
                            <div className="h-12 w-12 rounded-md bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 text-xs">No img</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-5">
                          <h3 className="text-lg leading-6 font-medium text-gray-900">{product.name}</h3>
                          <div className="mt-1 flex items-center">
                            <span className="text-sm font-medium text-green-600">₹{product.price}</span>
                            <span className="mx-2 text-gray-500">•</span>
                            <span className="text-sm text-gray-500">Stock: {product.stock}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3 flex justify-end">
                      <button
                        onClick={() => navigate(`/products/${product.id}`)}
                        className="text-sm font-medium text-cyan-600 hover:text-cyan-800"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {renderPagination()}
          </div>
        )}
      </div>
    </div>
  )
} 
