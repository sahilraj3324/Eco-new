// Authentication and role management utilities
// NOTE: For cookie-based authentication, we should use React Context instead of localStorage
// This file provides utility functions that can be used in non-React contexts

// For React components, prefer using useAuth() hook from AuthContext
// These functions are fallbacks for non-React contexts or legacy code

let currentUser = null;

// Function to set current user from AuthContext (called by AuthContext)
export const setCurrentUserForUtils = (user) => {
  currentUser = user;
};

export const getCurrentUser = () => {
  // First try to get from our internal state (set by AuthContext)
  if (currentUser) {
    return {
      type: currentUser.userType === 'admin' ? 'admin' : 'subAdmin',
      data: currentUser
    };
  }
  
  // Fallback to localStorage for token-based auth (buyer/seller)
  const admin = localStorage.getItem('admin');
  const subAdmin = localStorage.getItem('subAdmin');
  
  if (admin) {
    return { type: 'admin', data: JSON.parse(admin) };
  }
  
  if (subAdmin) {
    return { type: 'subAdmin', data: JSON.parse(subAdmin) };
  }
  
  return null;
};

export const getUserRoles = () => {
  const user = getCurrentUser();
  
  if (user?.type === 'admin') {
    // Admins have access to all roles
    return ['vendors', 'products', 'categories', 'retailers', 'asks', 'admins', 'roles', 'dashboard'];
  }
  
  if (user?.type === 'subAdmin') {
    const userData = user.data;
    const roles = userData.roles || userData.Roles || [];
    const accessibleTabs = userData.accessibleTabs || userData.AccessibleTabs || [];
    
    // Combine roles and accessible tabs
    const allPermissions = [...roles, ...accessibleTabs];
    
    // If user has 'all' access, return all permissions
    if (allPermissions.includes('all') || allPermissions.includes('admin')) {
      return ['vendors', 'products', 'categories', 'retailers', 'asks', 'admins', 'roles', 'dashboard'];
    }
    
    return allPermissions;
  }
  
  return [];
};

export const hasPermission = (requiredRole) => {
  const roles = getUserRoles();
  return roles.includes(requiredRole);
};

export const getAccessibleTabs = () => {
  const user = getCurrentUser();
  
  if (user?.type === 'admin') {
    return {
      dashboard: true,
      vendors: true,
      products: true,
      categories: true,
      retailers: true,
      orders: true,
      asks: true,
      banners: true,
      roles: true,
      admins: true
    };
  }
  
  if (user?.type === 'subAdmin') {
    const roles = getUserRoles();
    return {
      dashboard: roles.includes('dashboard') || true, // Dashboard is usually accessible
      vendors: roles.includes('vendors'),
      products: roles.includes('products'),
      categories: roles.includes('categories'),
      retailers: roles.includes('retailers'),
      orders: roles.includes('orders'),
      asks: roles.includes('asks'),
      banners: roles.includes('banners'),
      roles: roles.includes('roles') || roles.includes('admin') || roles.includes('all'),
      admins: roles.includes('admins') || roles.includes('admin') || roles.includes('all')
    };
  }
  
  return {
    dashboard: false,
    vendors: false,
    products: false,
    categories: false,
    retailers: false,
    orders: false,
    asks: false,
    banners: false,
    roles: false,
    admins: false
  };
};

export const isAdmin = () => {
  const user = getCurrentUser();
  return user?.type === 'admin';
};

export const isSubAdmin = () => {
  const user = getCurrentUser();
  return user?.type === 'subAdmin';
}; 
