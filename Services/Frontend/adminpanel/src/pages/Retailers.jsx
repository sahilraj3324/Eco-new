import { useState, useEffect } from 'react'

// Mock data - would be replaced with API calls
const mockRetailers = [
  { id: 1, name: 'Green Market', email: 'info@greenmarket.com', status: 'Active', ordersCount: 156, joinDate: '2023-01-15' },
  { id: 2, name: 'Eco Shop', email: 'support@ecoshop.com', status: 'Active', ordersCount: 89, joinDate: '2023-02-22' },
  { id: 3, name: 'Sustainable Living', email: 'hello@sustainableliving.com', status: 'Blocked', ordersCount: 42, joinDate: '2023-03-10' },
  { id: 4, name: 'Planet Friendly', email: 'contact@planetfriendly.com', status: 'Active', ordersCount: 118, joinDate: '2023-04-05' },
  { id: 5, name: 'Bio Retail', email: 'info@bioretail.com', status: 'Active', ordersCount: 73, joinDate: '2023-05-17' },
  { id: 6, name: 'Eco Bazaar', email: 'hello@ecobazaar.com', status: 'Blocked', ordersCount: 29, joinDate: '2023-06-30' },
  { id: 7, name: 'Green Life Store', email: 'sales@greenlifestore.com', status: 'Active', ordersCount: 104, joinDate: '2023-07-12' },
]

export default function Retailers() {
  const [retailers, setRetailers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Simulate API call
  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setRetailers(mockRetailers)
      setLoading(false)
    }, 500)
  }, [])

  const toggleRetailerStatus = (id) => {
    setRetailers(retailers.map(retailer => {
      if (retailer.id === id) {
        const newStatus = retailer.status === 'Active' ? 'Blocked' : 'Active'
        return { ...retailer, status: newStatus }
      }
      return retailer
    }))
  }

  const filteredRetailers = retailers.filter(retailer => {
    const matchesSearch = 
      retailer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      retailer.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (statusFilter === 'all') return matchesSearch
    return matchesSearch && retailer.status.toLowerCase() === statusFilter.toLowerCase()
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
                  Retailer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Orders
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Join Date
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
                      <div className="text-sm font-medium text-gray-900">{retailer.name}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-500">{retailer.email}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusBadgeClass(retailer.status)}`}>
                        {retailer.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {retailer.ordersCount}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {retailer.joinDate}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <button
                        onClick={() => toggleRetailerStatus(retailer.id)}
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
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    No retailers found
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