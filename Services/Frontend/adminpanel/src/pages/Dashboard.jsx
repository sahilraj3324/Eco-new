import { useState, useEffect } from 'react'

// Mock data - would be replaced with API calls
const mockStats = {
  vendors: 24,
  products: 156,
  retailers: 38,
  asks: 72
}

export default function Dashboard() {
  const [stats, setStats] = useState(mockStats)
  const [loading, setLoading] = useState(false)

  // Simulate API call
  useEffect(() => {
    // In a real app, fetch data from API
    setLoading(true)
    setTimeout(() => {
      setStats(mockStats)
      setLoading(false)
    }, 500)
  }, [])

  const StatCard = ({ title, value, icon }) => (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">
            {loading ? '...' : value}
          </p>
        </div>
        <div className="rounded-full bg-cyan-100 p-3 text-cyan-500">
          {icon}
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-800">Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Vendors" 
          value={stats.vendors}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          } 
        />
        
        <StatCard 
          title="Total Products" 
          value={stats.products}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          } 
        />
        
        <StatCard 
          title="Total Retailers" 
          value={stats.retailers}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          } 
        />
        
        <StatCard 
          title="Total Asks" 
          value={stats.asks}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          } 
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-medium text-gray-800">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center rounded-md bg-gray-50 p-3">
              <div className="mr-4 rounded-full bg-cyan-100 p-2 text-cyan-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">New vendor registered</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center rounded-md bg-gray-50 p-3">
              <div className="mr-4 rounded-full bg-cyan-100 p-2 text-cyan-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">New product added</p>
                <p className="text-xs text-gray-500">5 hours ago</p>
              </div>
            </div>
            <div className="flex items-center rounded-md bg-gray-50 p-3">
              <div className="mr-4 rounded-full bg-cyan-100 p-2 text-cyan-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">New ask received</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-medium text-gray-800">System Status</h2>
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between">
                <span className="text-sm font-medium text-gray-700">Server Load</span>
                <span className="text-sm font-medium text-gray-700">28%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div className="h-2 rounded-full bg-cyan-500" style={{ width: '28%' }}></div>
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between">
                <span className="text-sm font-medium text-gray-700">Database Usage</span>
                <span className="text-sm font-medium text-gray-700">45%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div className="h-2 rounded-full bg-cyan-500" style={{ width: '45%' }}></div>
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between">
                <span className="text-sm font-medium text-gray-700">Storage</span>
                <span className="text-sm font-medium text-gray-700">62%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div className="h-2 rounded-full bg-cyan-500" style={{ width: '62%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 