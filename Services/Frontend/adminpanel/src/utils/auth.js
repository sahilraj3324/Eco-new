// Authentication and role management utilities

export const getCurrentUser = () => {
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
    return ['vendors', 'products', 'categories', 'retailers', 'asks', 'admins'];
  }
  
  if (user?.type === 'subAdmin') {
    return user.data.roles || user.data.Roles || [];
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
      asks: true,
      admins: true
    };
  }
  
  if (user?.type === 'subAdmin') {
    const roles = getUserRoles();
    return {
      dashboard: true, // Dashboard is always accessible
      vendors: roles.includes('vendors'),
      products: roles.includes('products'),
      categories: roles.includes('categories'),
      retailers: roles.includes('retailers'),
      asks: roles.includes('asks'),
      admins: false // SubAdmins cannot access admin management
    };
  }
  
  return {
    dashboard: false,
    vendors: false,
    products: false,
    categories: false,
    retailers: false,
    asks: false,
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