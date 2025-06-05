import { createContext, useContext, useState, useEffect } from 'react';
import { adminApi, subAdminApi } from '../api';
import { setCurrentUserForUtils } from '../utils/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper function to update current user and sync with utils
  const updateCurrentUser = (userData) => {
    setCurrentUser(userData);
    setCurrentUserForUtils(userData); // Sync with utility functions
  };

  // Login function - for cookie-based auth, just set user data directly
  function login(token, userData) {
    // For token-based auth (buyer/seller), store token
    if (token) {
      localStorage.setItem('token', token);
    }
    
    // Set user data directly in state (no localStorage for cookie-based auth)
    updateCurrentUser(userData);
  }

  // Logout function
  async function logout() {
    try {
      // Try to logout from backend (this will clear cookies)
      if (currentUser?.userType === 'admin') {
        await adminApi.logout();
      } else if (currentUser?.userType === 'subadmin') {
        await subAdminApi.logout();
      }
    } catch (error) {
      // Silent error handling for logout
    } finally {
      // Clear local storage (only token for buyer/seller)
      localStorage.removeItem('token');
      updateCurrentUser(null);
    }
  }

  // Verify session on app load
  useEffect(() => {
    async function verifySession() {
      try {
        // First try to verify admin session via cookies
        try {
          const response = await adminApi.verifySession();
          updateCurrentUser({
            ...response.admin,
            userType: 'admin',
            role: 'admin',
            accessibleTabs: ['all'], // Admin has access to all tabs
            roles: ['admin']
          });
          return; // Exit early if admin session is valid
        } catch (adminError) {
          // No valid admin session
        }

        // Then try to verify subadmin session via cookies
        try {
          const response = await subAdminApi.verifySession();
          updateCurrentUser({
            ...response.subAdmin,
            userType: 'subadmin',
            roles: response.subAdmin.Roles || response.subAdmin.roles || [],
            accessibleTabs: response.subAdmin.AccessibleTabs || response.subAdmin.accessibleTabs || []
          });
          return; // Exit early if subadmin session is valid
        } catch (subAdminError) {
          // No valid subadmin session
        }

        // If no cookie-based sessions, check for token-based auth (buyer/seller)
        const token = localStorage.getItem('token');
        if (token) {
          // For buyer/seller, you might want to verify the token here
          // For now, we'll assume it's valid if it exists
          const userData = localStorage.getItem('userData');
          if (userData) {
            updateCurrentUser(JSON.parse(userData));
          }
        }

      } catch (error) {
        // Silent error handling for session verification
      } finally {
        setLoading(false);
      }
    }

    verifySession();
  }, []);

  const value = {
    currentUser,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 
