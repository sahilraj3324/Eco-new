import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

// Configure axios defaults
axios.defaults.withCredentials = true;

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
        await axios.post('/api/Seller/logout', {}, {
          withCredentials: true,
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      
      // Safe navigation
      try {
        navigate('/login');
      } catch (error) {
        console.warn('Navigation failed:', error);
        window.location.href = '/login';
      }
    }
  }, [navigate]);

  // Function to fetch current user data using token from cookies
  const fetchCurrentUser = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await axios.get('/api/Seller/me', {
        withCredentials: true,
        timeout: 10000, // 10 second timeout
      });
      
      if (response && response.data && response.data.seller) {
        console.log('User data fetched:', response.data.seller);
        setUser(response.data.seller);
        setIsAuthenticated(true);
        setLoading(false);
        return response.data.seller;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      // If token is invalid or expired, clear auth state but don't call logout API
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      
      // Only redirect to login if not already on login/signup pages
      if (!location.pathname.includes('/login') && !location.pathname.includes('/signup')) {
        console.log('Redirecting to login due to auth failure');
      }
      
      return null;
    }
  }, [location]);

  // Check authentication status on component mount
  useEffect(() => {
    // Don't check auth if already on login/signup pages
    if (location.pathname.includes('/login') || location.pathname.includes('/signup')) {
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