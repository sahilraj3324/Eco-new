import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

export default function Dashboard() {
  const [stats, setStats] = useState({
    vendors: 0,
    products: 0,
    retailers: 0,
    orders: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentOrders, setRecentOrders] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [revenueSummary, setRevenueSummary] = useState({
    total: 0,
    today: 0,
    weekly: 0,
    monthly: 0
  })

  // Fetch dashboard data from APIs
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        // Fetch counts in parallel
        const [sellers, products, buyers, ordersData] = await Promise.all([
          api.seller.getAll(),
          api.product.getAll(),
          api.buyer.getAll(),
          fetchAllOrders()
        ])
        
        // Process sellers data
        const sellersList = Array.isArray(sellers) ? sellers : (sellers?.value || [])
        
        // Process products data
        const productsList = Array.isArray(products) ? products : (products?.value || [])
        
        // Process buyers data
        const buyersList = Array.isArray(buyers) ? buyers : (buyers?.value || [])
        
        // Process orders data
        const ordersList = Array.isArray(ordersData) ? ordersData : (ordersData?.value || [])
        
        // Set statistics
        setStats({
          vendors: sellersList.length,
          products: productsList.length,
          retailers: buyersList.length,
          orders: ordersList.length
        })
        
        // Calculate revenue metrics
        calculateRevenueMetrics(ordersList)
        
        // Set recent orders (latest 5)
        setRecentOrders(ordersList.sort((a, b) => 
          new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0)
        ).slice(0, 5))
        
        // Find top selling products
        findTopSellingProducts(ordersList, productsList)
        
        // Generate recent activity
        generateRecentActivity(sellersList, productsList, buyersList, ordersList)
      } 
      catch (error) {
        console.error('Error fetching dashboard data:', error)
      } 
      finally {
        setLoading(false)
      }
    }
    
    fetchDashboardData()
  }, [])
  
  // Helper function to fetch all orders
  const fetchAllOrders = async () => {
    // We don't have a direct "get all orders" endpoint, so this is a placeholder
    // In a real implementation, you'd need to implement this either with a new API endpoint
    // or by fetching orders for each buyer and seller and combining them
    try {
      // Mock implementation - in real app you'd call your API
      return [] // Replace with actual API call
    } catch (error) {
      console.error('Error fetching all orders:', error)
      return []
    }
  }
  
  // Calculate revenue metrics from orders
  const calculateRevenueMetrics = (orders) => {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - 7)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    
    let totalRevenue = 0
    let todayRevenue = 0
    let weeklyRevenue = 0
    let monthlyRevenue = 0
    
    orders.forEach(order => {
      const orderAmount = order.totalAmount || 0
      const orderDate = new Date(order.createdAt || order.date || 0)
      
      // Add to total revenue
      totalRevenue += orderAmount
      
      // Check if order is from today
      if (orderDate >= todayStart) {
        todayRevenue += orderAmount
      }
      
      // Check if order is from this week
      if (orderDate >= weekStart) {
        weeklyRevenue += orderAmount
      }
      
      // Check if order is from this month
      if (orderDate >= monthStart) {
        monthlyRevenue += orderAmount
      }
    })
    
    setRevenueSummary({
      total: totalRevenue,
      today: todayRevenue,
      weekly: weeklyRevenue,
      monthly: monthlyRevenue
    })
  }
  
  // Find top selling products
  const findTopSellingProducts = (orders, products) => {
    // Count occurrences of each product in orders
    const productCounts = {}
    
    orders.forEach(order => {
      const items = order.items || []
      items.forEach(item => {
        const productId = item.productId
        if (productId) {
          productCounts[productId] = (productCounts[productId] || 0) + (item.quantity || 1)
        }
      })
    })
    
    // Convert to array and sort by count
    const sortedProducts = Object.keys(productCounts)
      .map(id => {
        const product = products.find(p => p.id === id) || { id }
        return {
          ...product,
          soldCount: productCounts[id]
        }
      })
      .sort((a, b) => b.soldCount - a.soldCount)
      .slice(0, 5)
    
    setTopProducts(sortedProducts)
  }
  
  // Generate recent activity
  const generateRecentActivity = (sellers, products, buyers, orders) => {
    const activities = []
    
    // Add recent orders
    orders.slice(0, 3).forEach(order => {
      activities.push({
        type: 'order',
        title: `New order placed (#${order.id?.substring(0, 8) || 'N/A'})`,
        time: order.createdAt || order.date || new Date(),
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        )
      })
    })
    
    // Add recent sellers
    sellers.slice(0, 2).forEach(seller => {
      activities.push({
        type: 'seller',
        title: `New vendor registered: ${seller.storename || 'Unknown Vendor'}`,
        time: seller.createdAt || new Date(),
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        )
      })
    })
    
    // Add recent products
    products.slice(0, 2).forEach(product => {
      activities.push({
        type: 'product',
        title: `New product added: ${product.name || 'Unknown Product'}`,
        time: product.createdAt || new Date(),
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        )
      })
    })
    
    // Sort by time (newest first) and take top 5
    setRecentActivity(
      activities
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 5)
    )
  }

  const StatCard = ({ title, value, icon, trend, link }) => (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">
            {loading ? '...' : value}
          </p>
          {trend && (
            <p className={`mt-1 text-xs ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% from last month
            </p>
          )}
        </div>
        <div className="rounded-full bg-cyan-100 p-3 text-cyan-500">
          {icon}
        </div>
      </div>
      {link && (
        <div className="mt-4 text-right">
          <Link to={link} className="text-sm font-medium text-cyan-600 hover:text-cyan-800">
            View All →
          </Link>
        </div>
      )}
    </div>
  )
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-800">Dashboard</h1>
      
      {/* Main Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Vendors" 
          value={stats.vendors}
          link="/vendors"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          } 
        />
        
        <StatCard 
          title="Total Products" 
          value={stats.products}
          link="/products"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          } 
        />
        
        <StatCard 
          title="Total Retailers" 
          value={stats.retailers}
          link="/retailers"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          } 
        />
        
        <StatCard 
          title="Total Orders"
          value={stats.orders}
          link="/orders"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          } 
        />
      </div>
      
      {/* Revenue Stats */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 p-6 text-white shadow-md">
          <p className="text-sm font-medium text-cyan-100">Total Revenue</p>
          <p className="mt-1 text-3xl font-semibold">
            {loading ? '...' : formatCurrency(revenueSummary.total)}
          </p>
        </div>
        
        <div className="rounded-lg bg-white p-6 shadow-md">
          <p className="text-sm font-medium text-gray-500">Today's Revenue</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">
            {loading ? '...' : formatCurrency(revenueSummary.today)}
          </p>
        </div>
        
        <div className="rounded-lg bg-white p-6 shadow-md">
          <p className="text-sm font-medium text-gray-500">Weekly Revenue</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">
            {loading ? '...' : formatCurrency(revenueSummary.weekly)}
          </p>
        </div>
        
        <div className="rounded-lg bg-white p-6 shadow-md">
          <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">
            {loading ? '...' : formatCurrency(revenueSummary.monthly)}
          </p>
        </div>
      </div>

      {/* Recent Orders and Top Products */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="mb-4 flex justify-between">
            <h2 className="text-lg font-medium text-gray-800">Recent Orders</h2>
            <Link to="/orders" className="text-sm font-medium text-cyan-600 hover:text-cyan-800">
              View All →
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-cyan-500"></div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <div key={order.id} className="py-3">
                    <div className="flex justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Order #{order.id?.substring(0, 8) || 'N/A'}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt || order.date || 0).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(order.totalAmount || 0)}
                        </p>
                        <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${
                          order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status || 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-sm text-gray-500">No recent orders</p>
              )}
            </div>
          )}
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="mb-4 flex justify-between">
            <h2 className="text-lg font-medium text-gray-800">Top Selling Products</h2>
            <Link to="/products" className="text-sm font-medium text-cyan-600 hover:text-cyan-800">
              View All →
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-cyan-500"></div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {topProducts.length > 0 ? (
                topProducts.map((product) => (
                  <div key={product.id} className="flex items-center py-3">
                    <div className="h-12 w-12 overflow-hidden rounded-md bg-gray-200">
                      <img
                        src={product.mainImage || (product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : 'https://placehold.co/100x100/EEFCFF/00B1CC?text=Product')}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-700">{product.name || 'Unknown Product'}</p>
                      <p className="text-xs text-gray-500">
                        {product.category || 'Uncategorized'} • 
                        {product.stock !== undefined ? ` Stock: ${product.stock}` : ''}
                      </p>
                    </div>
                    <div className="ml-2 text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(product.price || 0)}
                      </p>
                      <p className="text-xs text-green-600">
                        {product.soldCount} sold
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-sm text-gray-500">No product data available</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity and Inventory Status */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-medium text-gray-800">Recent Activity</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-cyan-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center rounded-md bg-gray-50 p-3">
                    <div className="mr-4 rounded-full bg-cyan-100 p-2 text-cyan-500">
                      {activity.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{activity.title}</p>
                      <p className="text-xs text-gray-500">
                        {typeof activity.time === 'string' 
                          ? activity.time 
                          : new Date(activity.time).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-sm text-gray-500">No recent activity</p>
              )}
            </div>
          )}
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-lg font-medium text-gray-800">Inventory Status</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-cyan-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Products in Stock</span>
                  <span className="text-sm font-medium text-gray-700">
                    {stats.products ? `${stats.products}/${stats.products}` : 'N/A'}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div className="h-2 rounded-full bg-green-500" style={{ width: '100%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Low Stock Products</span>
                  <span className="text-sm font-medium text-gray-700">0%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div className="h-2 rounded-full bg-yellow-500" style={{ width: '0%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="mb-1 flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Out of Stock Products</span>
                  <span className="text-sm font-medium text-gray-700">0%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div className="h-2 rounded-full bg-red-500" style={{ width: '0%' }}></div>
                </div>
              </div>
              
              <div className="mt-6">
                <Link 
                  to="/products" 
                  className="inline-flex items-center rounded-md border border-transparent bg-cyan-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                >
                  Manage Inventory
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 