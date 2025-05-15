import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'
import axios from 'axios'

export default function Vendors() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [vendorProducts, setVendorProducts] = useState({})
  const [diagnosticStatus, setDiagnosticStatus] = useState('')
  const [diagnosticResults, setDiagnosticResults] = useState(null)

  // Run basic diagnostic tests on component mount
  useEffect(() => {
    async function runBasicDiagnostics() {
      setDiagnosticStatus('Running basic connectivity tests...');
      
      try {
        const results = await api.diagnostic.checkConnection();
        console.log('API Diagnostic results:', results);
        setDiagnosticResults(results);
        
        // Format results for display
        const statusText = [
          `Proxy connection: ${results.proxy.status === 'unknown' ? 'Failed' : results.proxy.status}`,
          `Direct connection: ${results.direct.status === 'unknown' ? 'Failed' : results.direct.status}`
        ].join('\n');
        
        setDiagnosticStatus(statusText);
      } catch (error) {
        console.error('Diagnostic tests failed:', error);
        setDiagnosticStatus(`Diagnostic tests failed: ${error.message}`);
      }
    }
    
    runBasicDiagnostics();
  }, []);

  // Function to run product-specific tests
  const runProductApiTests = async (sellerId) => {
    if (!sellerId) {
      // Use the first vendor's ID if available
      if (vendors.length > 0) {
        sellerId = vendors[0].id;
      } else {
        setDiagnosticStatus(prev => prev + '\nNo vendor ID available for testing');
        return;
      }
    }
    
    setDiagnosticStatus(prev => prev + `\nTesting product API for seller ${sellerId}...`);
    
    try {
      const results = await api.diagnostic.testProductApi(sellerId);
      console.log('Product API test results:', results);
      
      // Format results for display
      let statusText = [
        `\nProduct API via proxy: ${results.proxy.status}`,
        `Product API via direct: ${results.direct.status}`,
        `\nAlternative endpoints tested:`
      ];
      
      results.altEndpoints.forEach(endpoint => {
        statusText.push(`${endpoint.endpoint}: ${endpoint.status} (${endpoint.success ? 'SUCCESS' : 'FAILED'})`);
      });
      
      setDiagnosticStatus(prev => prev + '\n' + statusText.join('\n'));
      
      // Check if any endpoint succeeded
      const anySuccess = results.altEndpoints.some(endpoint => endpoint.success);
      if (anySuccess) {
        setDiagnosticStatus(prev => prev + '\n\nFOUND WORKING ENDPOINT! Check console for details.');
      }
    } catch (error) {
      console.error('Product API tests failed:', error);
      setDiagnosticStatus(prev => prev + `\nProduct API tests failed: ${error.message}`);
    }
  };

  // Fetch vendors
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch vendors
        const vendorsData = await api.seller.getAll()
        const vendorsArray = Array.isArray(vendorsData) ? vendorsData : (vendorsData?.value || [])
        console.log('Vendors data fetched:', vendorsArray);
        setVendors(vendorsArray)
        
        // Fetch products for each vendor using the getBySeller function
        const productPromises = vendorsArray.map(async (vendor) => {
          try {
            const vendorProducts = await api.product.getBySeller(vendor.id)
            const productsCount = Array.isArray(vendorProducts) 
              ? vendorProducts.length 
              : (vendorProducts?.value?.length || 0)
            
            return { sellerId: vendor.id, count: productsCount }
          } catch (err) {
            console.error(`Error fetching products for vendor ${vendor.id}:`, err)
            // Return 0 as count when there's an error, but mark it as error
            return { sellerId: vendor.id, count: 0, error: true }
          }
        })
        
        // Wait for all product fetch calls to complete
        const productsResults = await Promise.all(productPromises)
        
        // Create a map of sellerId to product count
        const productCountsMap = productsResults.reduce((acc, result) => {
          acc[result.sellerId] = result
          return acc
        }, {})
        
        setVendorProducts(productCountsMap)
      } catch (err) {
        setError(err.message || 'Failed to fetch data')
        setVendors([])
      } finally {
        setLoading(false)
      }
    }
    

    fetchVendors()
  }, [])

  const filteredVendors = vendors.filter(vendor => 
    vendor.storename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.address?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Vendors</h1>
        <div className="flex gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search vendors..."
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
          <button className="rounded-md bg-cyan-500 px-4 py-2 text-white hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2">
            Add Vendor
          </button>
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

      {diagnosticStatus && (
        <div className="mb-4 rounded-md bg-blue-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-grow">
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-medium text-blue-800">API Diagnostics</h3>
                <button 
                  onClick={() => runProductApiTests()}
                  className="ml-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Test Product API
                </button>
              </div>
              <div className="mt-2 text-sm text-blue-700 whitespace-pre-line">{diagnosticStatus}</div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-cyan-500"></div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Store Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Phone
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Address
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  GST Number
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Profile Picture
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Products
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredVendors.length > 0 ? (
                filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{vendor.storename}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-500">{vendor.email}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-500">{vendor.phoneNumber}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-500">{vendor.address}</div>
                      <div className="text-xs text-gray-400">PIN: {vendor.pincode}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-500">{vendor.gstNumber}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {vendor.profile_picture ? (
                        <img
                          src={vendor.profile_picture}
                          alt={vendor.storename}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 text-xs">No image</span>
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <Link 
                        to={`/vendors/${vendor.id}/products`}
                        className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                          vendorProducts[vendor.id]?.error 
                            ? 'bg-gray-100 text-gray-800' 
                            : 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200'
                        }`}
                      >
                        {vendorProducts[vendor.id]?.error 
                          ? (
                            <span className="flex items-center">
                              <svg className="mr-1 h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Error loading products
                            </span>
                          ) 
                          : (
                            <>
                              {vendorProducts[vendor.id]?.count || 0} Products
                              <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                              </svg>
                            </>
                          )
                        }
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                    No vendors found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
} 