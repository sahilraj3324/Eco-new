import axios from 'axios';

// Get API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:7209';

// Configure axios defaults for all API calls
axios.defaults.withCredentials = true;
axios.defaults.baseURL = API_BASE_URL;

// Base API configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log(`🌐 API Base URL: ${API_BASE_URL}`);

// Add request interceptor for logging
api.interceptors.request.use((config) => {
  console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
    return Promise.reject(error);
  }
);

// Buyer Authentication APIs
export const buyerAuth = {
  // POST /api/Buyer/signup
  signup: async (userData) => {
    try {
      const response = await api.post('/api/Buyer/signup', userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },

  // POST /api/Buyer/login
  login: async (credentials) => {
    try {
      const response = await api.post('/api/Buyer/login', credentials);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },

  // POST /api/Buyer/logout
  logout: async () => {
    try {
      const response = await api.post('/api/Buyer/logout');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },

  // GET /api/Buyer/me
  getCurrentUser: async () => {
    try {
      const response = await api.get('/api/Buyer/me');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },

  // GET /api/Buyer/test
  testConnection: async () => {
    try {
      const response = await api.get('/api/Buyer/test');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },
};

// Buyer Management APIs
export const buyerManagement = {
  // GET /api/Buyer/get-all
  getAllBuyers: async () => {
    try {
      const response = await api.get('/api/Buyer/get-all');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },

  // GET /api/Buyer/get/{id}
  getBuyerById: async (id) => {
    try {
      const response = await api.get(`/api/Buyer/get/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },

  // PUT /api/Buyer/update/{id}
  updateBuyer: async (id, updateData) => {
    try {
      const response = await api.put(`/api/Buyer/update/${id}`, updateData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },

  // DELETE /api/Buyer/delete/{id}
  deleteBuyer: async (id) => {
    try {
      const response = await api.delete(`/api/Buyer/delete/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },
};

// Utility functions for common operations
export const apiUtils = {
  // Check if user is authenticated
  isAuthenticated: async () => {
    const result = await buyerAuth.getCurrentUser();
    return result.success;
  },

  // Get user data with error handling
  getUserData: async () => {
    const result = await buyerAuth.getCurrentUser();
    if (result.success) {
      return result.data.buyer;
    }
    return null;
  },

  // Login with comprehensive error handling
  loginUser: async (email, password) => {
    return await buyerAuth.login({ Email: email, Password: password });
  },

  // Signup with comprehensive error handling
  signupUser: async (userData) => {
    // Ensure the data structure matches what the backend expects
    const signupData = {
      storename: userData.storename,
      email: userData.email,
      password: userData.password,
      phoneNumber: userData.phoneNumber,
      address: userData.address,
      gstnumber: userData.gstnumber,
      pincode: userData.pincode,
      hnscode: userData.hnscode,
      profile_picture: userData.profile_picture || ""
    };
    
    return await buyerAuth.signup(signupData);
  },

  // Test backend connection
  testBackend: async () => {
    return await buyerAuth.testConnection();
  },
};

// Export the configured axios instance for direct use if needed
export { api };

// Default export with all APIs grouped
export default {
  auth: buyerAuth,
  management: buyerManagement,
  utils: apiUtils,
  api,
}; 