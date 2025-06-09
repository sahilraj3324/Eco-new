// Complete cookie-based authentication utilities

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { buyerAuth, apiUtils } from '../api.js';

// Cache for user data to avoid repeated API calls
let userDataCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Add safety check for navigate
  let navigate;
  let location;
  try {
    navigate = useNavigate();
    location = useLocation();
  } catch (error) {
    console.warn('useNavigate/useLocation not available:', error);
    navigate = () => {}; // Fallback function
    location = { pathname: '/' };
  }

  // Function to logout user
  const logout = useCallback(async (callApi = true) => {
    try {
      if (callApi) {
        await buyerAuth.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      
      // Clear cache
      userDataCache = null;
      cacheTimestamp = null;
      
      // Safe navigation
      try {
        navigate('/retailerlogin');
      } catch (error) {
        console.warn('Navigation failed:', error);
        window.location.href = '/retailerlogin';
      }
    }
  }, [navigate]);

  // Function to fetch current user data using token from cookies
  const fetchCurrentUser = useCallback(async () => {
    try {
      setLoading(true);
      
      const result = await buyerAuth.getCurrentUser();
      
      if (result.success && result.data && result.data.buyer) {
        console.log('User data fetched:', result.data.buyer);
        setUser(result.data.buyer);
        setIsAuthenticated(true);
        setLoading(false);
        
        // Update cache
        userDataCache = result.data.buyer;
        cacheTimestamp = Date.now();
        
        return result.data.buyer;
      } else {
        console.log('No user data returned from fetchCurrentUser');
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      // If token is invalid or expired, clear auth state but don't call logout API
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      
      // Clear cache
      userDataCache = null;
      cacheTimestamp = null;
      
      // Only redirect to login if not already on login/signup pages
      if (!location.pathname.includes('/retailerlogin') && !location.pathname.includes('/retailersignup')) {
        console.log('Redirecting to login due to auth failure');
      }
      
      return null;
    }
  }, [location]);

  // Check authentication status on component mount
  useEffect(() => {
    // Don't check auth if already on login/signup pages
    if (location.pathname.includes('/retailerlogin') || location.pathname.includes('/retailersignup')) {
      setLoading(false);
      return;
    }

    // Add safety checks
    try {
      // Add a small delay to prevent immediate requests on page load
      const timer = setTimeout(() => {
        fetchCurrentUser();
      }, 100);

      return () => clearTimeout(timer);
    } catch (error) {
      console.error('Error in useAuth useEffect:', error);
      setLoading(false);
    }
  }, [fetchCurrentUser, location.pathname]);

  // Function to refresh user data
  const refreshUser = useCallback(() => {
    try {
      return fetchCurrentUser();
    } catch (error) {
      console.error('Error refreshing user:', error);
      return null;
    }
  }, [fetchCurrentUser]);

  return {
    user,
    loading,
    isAuthenticated,
    logout,
    refreshUser,
    fetchCurrentUser
  };
};

export default useAuth;

// Check if user is authenticated by calling the backend
export const isAuthenticated = async () => {
  return await apiUtils.isAuthenticated();
};

// Get current user data from backend using JWT cookie
export const getCurrentUser = async (useCache = true) => {
  // Check cache first if enabled
  if (useCache && userDataCache && cacheTimestamp) {
    const now = Date.now();
    if (now - cacheTimestamp < CACHE_DURATION) {
      console.log('Using cached user data');
      return { success: true, user: userDataCache };
    }
  }

  const result = await buyerAuth.getCurrentUser();
  
  if (result.success && result.data && result.data.buyer) {
    // Update cache
    userDataCache = result.data.buyer;
    cacheTimestamp = Date.now();
    return { success: true, user: result.data.buyer };
  } else {
    // Clear cache on error
    userDataCache = null;
    cacheTimestamp = null;
    return { success: false, error: result.error || 'Failed to get user data' };
  }
};

// Login function
export const login = async (credentials) => {
  try {
    const result = await buyerAuth.login(credentials);
    
    if (result.success) {
      // Clear cache to force fresh data fetch
      userDataCache = null;
      cacheTimestamp = null;
      
      return { success: true, data: result.data };
    } else {
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message || 'Login failed' };
  }
};

// Signup function
export const signup = async (userData) => {
  try {
    const result = await buyerAuth.signup(userData);
    return result;
  } catch (error) {
    console.error('Signup error:', error);
    return { success: false, error: error.message || 'Signup failed' };
  }
};

// Clear user cache
export const clearUserCache = () => {
  userDataCache = null;
  cacheTimestamp = null;
};

// Get cached user data if available
export const useCurrentUser = async () => {
  return await apiUtils.getUserData();
};

// Check authentication status
export const checkAuthStatus = async () => {
  return await apiUtils.isAuthenticated();
};

// Utility function to get authentication status and user data
export const getAuthStatus = async () => {
  try {
    const result = await getCurrentUser(true);
    if (result.success) {
      return {
        isAuthenticated: true,
        user: result.user
      };
    } else {
      return {
        isAuthenticated: false,
        user: null
      };
    }
  } catch (error) {
    return {
      isAuthenticated: false,
      user: null,
      error: error.message
    };
  }
};

// Test cookies functionality
export const testCookies = async () => {
  return await buyerAuth.testConnection();
}; 