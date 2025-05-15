import { useState, useEffect } from 'react'
import api from '../api'

export default function Retailers() {
  const [retailers, setRetailers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [orderCounts, setOrderCounts] = useState({})

  // Fetch retailers data from API
  useEffect(() => {
    const fetchRetailers = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const retailersData = await api.buyer.getAll()
        
        // Handle different API response formats
        const retailersArray = Array.isArray(retailersData) 
          ? retailersData 
          : (retailersData?.value || [])
        
        console.log('Retailers fetched:', retailersArray)
        setRetailers(retailersArray)
        
        // Fetch order counts for each retailer
        const orderCountsObj = {}
        await Promise.all(
          retailersArray.map(async (retailer) => {
            try {
              // Use the Order/buyer/{buyerId} endpoint to fetch orders
              const orderData = await api.order.getByBuyer(retailer.id)
              const orders = Array.isArray(orderData) 
                ? orderData 
                : (orderData?.value || [])
              
              orderCountsObj[retailer.id] = orders.length
            } catch (err) {
              console.error(`Error fetching orders for buyer ${retailer.id}:`, err)
              orderCountsObj[retailer.id] = 0
            }
          })
        )
        
        setOrderCounts(orderCountsObj)
      } catch (err) {
        console.error('Error fetching retailers:', err)
        setError(err.message || 'Failed to fetch retailers')
        setRetailers([])
      } finally {
        setLoading(false)
      }
    }

    fetchRetailers()
  }, [])

  const toggleRetailerStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Blocked' : 'Active'
    
    try {
      // Update status in the backend
      await api.buyer.updateStatus(id, newStatus)
      
      // Update local state if API call succeeds
      setRetailers(retailers.map(retailer => {
        if (retailer.id === id) {
          return { ...retailer, status: newStatus }
        }
        return retailer
      }))
    } catch (err) {
      console.error('Error updating retailer status:', err)
      alert(`Failed to ${newStatus === 'Active' ? 'activate' : 'block'} retailer: ${err.message}`)
    }
  }

  const filteredRetailers = retailers.filter(retailer => {
    const matchesSearch = 
      retailer.storename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      retailer.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (statusFilter === 'all') return matchesSearch
    return matchesSearch && retailer.status?.toLowerCase() === statusFilter.toLowerCase()
  })

  const getStatusBadgeClass = (status) => {
    return status === 'Active' 
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800'
  }

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <h1 className="text-2xl font-semibold text-gray-800">Retailers</h1>
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative">
            <input
              type="text"
              placeholder="Search retailers..."
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
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border border-gray-300 px-4 py-2 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
          </select>
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
                  GST Number
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Orders
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Address
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredRetailers.length > 0 ? (
                filteredRetailers.map((retailer) => (
                  <tr key={retailer.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{retailer.storename}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-500">{retailer.email}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-500">{retailer.phoneNumber}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-500">{retailer.gstNumber}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {orderCounts[retailer.id] || 0}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-500">{retailer.address}</div>
                      <div className="text-xs text-gray-400">PIN: {retailer.pincode}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <button
                        onClick={() => toggleRetailerStatus(retailer.id, retailer.status)}
                        className={`rounded px-3 py-1 text-xs font-medium text-white ${
                          retailer.status === 'Active' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                        }`}
                      >
                        {retailer.status === 'Active' ? 'Block' : 'Unblock'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                    {error ? 'Error loading retailers' : 'No retailers found'}
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