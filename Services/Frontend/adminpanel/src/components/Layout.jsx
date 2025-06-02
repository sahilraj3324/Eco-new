import { useState, useEffect } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import logo from '../assets/logo.png'

// Define all navigation items with their required roles
const allNavItems = [
  { name: 'Dashboard', path: '/dashboard', roles: ['admin', 'dashboard'] }, // Admin or dashboard role
  { name: 'Vendors', path: '/vendors', roles: ['admin', 'vendors'] },
  { name: 'Products', path: '/products', roles: ['admin', 'products'] },
  { name: 'Categories', path: '/categories', roles: ['admin', 'categories'] },
  { name: 'Retailers', path: '/retailers', roles: ['admin', 'retailers'] },
  { name: 'Orders', path: '/orders', roles: ['admin', 'orders'] },
  { name: 'Asks', path: '/asks', roles: ['admin', 'asks'] },
  { name: 'Banners', path: '/banners', roles: ['admin', 'banners'] },
  { name: 'Roles', path: '/roles', roles: ['admin', 'roles'] }, // Admin or roles permission
  { name: 'Admins', path: '/admins', roles: ['admin', 'admins'] }, // Admin or admins permission
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  
  // Filter navigation items based on user role(s)
  const getFilteredNavItems = () => {
    if (!user) return []
    
    // Admin has access to all items
    if (user.userType === 'admin') {
      return allNavItems
    }
    
    // SubAdmin has access based on their accessible tabs from assigned roles
    // Check multiple possible property names for roles and tabs
    const userRoles = user.roles || user.Roles || user.role || []
    const userTabs = user.accessibleTabs || user.AccessibleTabs || []
    const rolesArray = Array.isArray(userRoles) ? userRoles : [userRoles]
    const tabsArray = Array.isArray(userTabs) ? userTabs : [userTabs]
    
    console.log('🔍 SubAdmin Navigation Debug:')
    console.log('  - User object:', user)
    console.log('  - User roles:', rolesArray)
    console.log('  - User accessible tabs:', tabsArray)
    console.log('  - Available nav items:', allNavItems)
    
    // Filter based on accessible tabs
    const filteredItems = allNavItems.filter(item => {
      // Check if user has access to any of the required roles/tabs
      const hasAccess = item.roles.some(role => {
        if (role === 'admin') return false // SubAdmins can't access admin-only items unless they have specific permission
        return tabsArray.includes(role) || rolesArray.includes(role)
      })
      
      console.log(`  - ${item.name} (${item.path}): ${hasAccess ? '✅' : '❌'} - Required: [${item.roles.join(', ')}]`)
      return hasAccess
    })
    
    console.log('  - Final filtered items:', filteredItems)
    return filteredItems
  }

  const navItems = getFilteredNavItems()
  
  // Redirect SubAdmin to their first available tab if they're on dashboard and don't have dashboard access
  useEffect(() => {
    if (user?.userType !== 'admin' && location.pathname === '/dashboard') {
      const userTabs = user.accessibleTabs || user.AccessibleTabs || []
      const tabsArray = Array.isArray(userTabs) ? userTabs : [userTabs]
      
      // If user doesn't have dashboard access, redirect to first available tab
      if (!tabsArray.includes('dashboard') && navItems.length > 0) {
        navigate(navItems[0].path)
      }
    }
  }, [user, location.pathname, navItems, navigate])
  
  // Close sidebar when route changes (mobile navigation)
  useEffect(() => {
    setSidebarOpen(false)
  }, [location])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-30 w-64 transform overflow-y-auto bg-blue-900 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0`}
      >
        <div className="flex h-16 items-center justify-between border-b border-cyan-500 px-6">
          <div className="flex items-center justify-center">
            <img src={logo} alt="Eco Logo" className="h-14 w-auto" />
          </div>
          <button 
            className="text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
            >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* User info */}
        <div className="px-6 py-4 border-b border-cyan-500">
          <div className="text-white">
            <p className="text-sm font-medium">{user?.name || 'Admin User'}</p>
            <p className="text-xs text-cyan-200 capitalize">
              {user?.userType === 'admin' ? 'Administrator' : 
                (() => {
                  const userRoles = user?.roles || user?.Roles || user?.role || []
                  const userTabs = user?.accessibleTabs || user?.AccessibleTabs || []
                  const rolesArray = Array.isArray(userRoles) ? userRoles : [userRoles]
                  const tabsArray = Array.isArray(userTabs) ? userTabs : [userTabs]
                  
                  // Show accessible tabs if available, otherwise show roles
                  const displayItems = tabsArray.length > 0 ? tabsArray : rolesArray
                  return displayItems.length > 0 ? displayItems.join(', ').replace(/_/g, ' ') : 'SubAdmin'
                })()
              }
            </p>
          </div>
        </div>

        <nav className="mt-5 space-y-2 px-3">
          {navItems.length > 0 ? (
            navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center rounded-md px-4 py-3 text-sm font-medium ${
                    isActive
                      ? 'bg-cyan-700 text-white'
                      : 'text-white hover:bg-cyan-700'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))
          ) : user?.userType !== 'admin' ? (
            <div className="px-4 py-3 text-sm text-cyan-200">
              <p className="font-medium">No access permissions</p>
              <p className="text-xs">Contact your administrator to assign roles.</p>
            </div>
          ) : null}
        </nav>

        {/* Logout button */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center rounded-md px-4 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="flex h-16 items-center justify-between px-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-md p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 lg:hidden"
              aria-label="Open sidebar"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </button>
            <div className="flex items-center text-xl font-semibold text-gray-700 lg:pl-0">
              <img src={logo} alt="Eco Logo" className="h-8 w-8" />
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                <span className="font-medium">{user?.name || 'Admin User'}</span>
                <span className="text-gray-500 ml-1">
                  ({user?.userType === 'admin' ? 'Admin' : 'SubAdmin'})
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700 hidden lg:block"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-gray-100 p-4">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
} 