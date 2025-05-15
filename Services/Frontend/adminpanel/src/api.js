import axios from 'axios';

// API base URL - adjust this based on your backend URL
const API_URL = '/api';

// Configuration helper for authenticated requests
const authConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

// Product API calls
export const productApi = {
  // Get all products
  getAll: async () => {
    try {
      const response = await axios.get(`${API_URL}/Product/get-all`);
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get products by seller ID
  getBySeller: async (sellerId) => {
    try {
      const response = await axios.get(`${API_URL}/Product/get-by-seller/${sellerId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching products for seller ${sellerId}:`, error);
      throw error;
    }
  },

  // Get a single product by ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/Product/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },

  // Add a new product
  add: async (productData) => {
    try {
      const response = await axios.post(`${API_URL}/Product/add`, productData, authConfig());
      return response.data;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  },

  // Add multiple products
  addBulk: async (productsData) => {
    try {
      const response = await axios.post(`${API_URL}/Product/add/bulk`, productsData, authConfig());
      return response.data;
    } catch (error) {
      console.error('Error adding bulk products:', error);
      throw error;
    }
  },

  // Update a product
  update: async (id, productData) => {
    try {
      const response = await axios.put(`${API_URL}/Product/update/${id}`, productData, authConfig());
      return response.data;
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
  },

  // Delete a product
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/Product/delete/${id}`, authConfig());
      return response.data;
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  },

  // Delete all products
  deleteAll: async () => {
    try {
      const response = await axios.delete(`${API_URL}/Product/delete-all`, authConfig());
      return response.data;
    } catch (error) {
      console.error('Error deleting all products:', error);
      throw error;
    }
  }
};

// Order API calls
export const orderApi = {
  // Place a new order
  place: async (orderData) => {
    try {
      const response = await axios.post(`${API_URL}/Order`, orderData, authConfig());
      return response.data;
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  },

  // Get orders by buyer ID
  getByBuyer: async (buyerId) => {
    try {
      const response = await axios.get(`${API_URL}/Order/buyer/${buyerId}`, authConfig());
      return response.data;
    } catch (error) {
      console.error(`Error fetching orders for buyer ${buyerId}:`, error);
      throw error;
    }
  },

  // Get orders by seller ID
  getBySeller: async (sellerId) => {
    try {
      const response = await axios.get(`${API_URL}/Order/seller/${sellerId}`, authConfig());
      return response.data;
    } catch (error) {
      console.error(`Error fetching orders for seller ${sellerId}:`, error);
      throw error;
    }
  },

  // Update order status
  updateStatus: async (orderId, newStatus) => {
    try {
      const response = await axios.put(`${API_URL}/Order/${orderId}/status`, JSON.stringify(newStatus), authConfig());
      return response.data;
    } catch (error) {
      console.error(`Error updating order ${orderId} status:`, error);
      throw error;
    }
  },

  // Delete all orders for a seller
  deleteAllBySeller: async (sellerId) => {
    try {
      const response = await axios.delete(`${API_URL}/Order/seller/${sellerId}/all`, authConfig());
      return response.data;
    } catch (error) {
      console.error(`Error deleting all orders for seller ${sellerId}:`, error);
      throw error;
    }
  },

  // Delete all orders
  deleteAll: async () => {
    try {
      const response = await axios.delete(`${API_URL}/Order/all`, authConfig());
      return response.data;
    } catch (error) {
      console.error('Error deleting all orders:', error);
      throw error;
    }
  }
};

// Seller API calls
export const sellerApi = {
  // Register a new seller
  signup: async (sellerData) => {
    try {
      const response = await axios.post(`${API_URL}/Seller/signup`, sellerData);
      return response.data;
    } catch (error) {
      console.error('Error during seller signup:', error);
      throw error;
    }
  },

  // Log in a seller
  login: async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/Seller/login`, credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('seller', JSON.stringify(response.data.seller));
      }
      return response.data;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  },

  // Get all sellers
  getAll: async () => {
    try {
      const response = await axios.get(`${API_URL}/Seller/get-all`, authConfig());
      return response.data;
    } catch (error) {
      console.error('Error fetching all sellers:', error);
      throw error;
    }
  },

  // Get seller by ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/Seller/get/${id}`, authConfig());
      return response.data;
    } catch (error) {
      console.error(`Error fetching seller ${id}:`, error);
      throw error;
    }
  },

  // Update seller
  update: async (id, sellerData) => {
    try {
      const response = await axios.put(`${API_URL}/Seller/update/${id}`, sellerData, authConfig());
      return response.data;
    } catch (error) {
      console.error(`Error updating seller ${id}:`, error);
      throw error;
    }
  },

  // Delete seller
  delete: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/Seller/delete/${id}`, authConfig());
      return response.data;
    } catch (error) {
      console.error(`Error deleting seller ${id}:`, error);
      throw error;
    }
  },

  // Log out (client-side only)
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('seller');
  }
};

// Export a combined API object
const api = {
  product: productApi,
  order: orderApi,
  seller: sellerApi
};

export default api; 