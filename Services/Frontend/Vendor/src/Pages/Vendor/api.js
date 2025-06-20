import axios from 'axios';

// Get API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5261';

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

console.log(`🌐 Vendor API Base URL: ${API_BASE_URL}`);

const api = {
  // Product API endpoints
  product: {
    // Get all products for a seller
    getBySellerId: async (sellerId) => {
      const response = await axios.get(`/api/Product/get-by-seller/${sellerId}`);
      return response.data;
    },

    // Get product by ID
    getById: async (id) => {
      const response = await axios.get(`/api/Product/${id}`);
      return response.data;
    },

    // Create new product
    create: async (productData) => {
      const response = await axios.post('/api/Product/add', productData, {
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;
    },

    // Update product
    update: async (id, productData) => {
      const response = await axios.put(`/api/Product/${id}`, productData, {
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;
    },

    // Delete product
    delete: async (id) => {
      const response = await axios.delete(`/api/Product/delete/${id}`);
      return response.data;
    },

    // Update variant stock
    updateVariantStock: async (productId, variantId, newStock) => {
      const response = await axios.put(
        `/api/Product/update-variant-stock/${productId}/${variantId}`,
        { newStock },
        { headers: { 'Content-Type': 'application/json' } }
      );
      return response.data;
    },

    // Update variant price
    updateVariantPrice: async (productId, variantId, newPrice) => {
      const response = await axios.put(
        `/api/Product/update-variant-price/${productId}/${variantId}`,
        { newPrice },
        { headers: { 'Content-Type': 'application/json' } }
      );
      return response.data;
    },
  },

  // Category API endpoints
  category: {
    // Get all categories
    getAll: async () => {
      const response = await axios.get('/api/Category/get-all');
      return response.data;
    },
  },

  // SubCategory API endpoints
  subCategory: {
    // Get subcategories by category ID
    getByCategoryId: async (categoryId) => {
      const response = await axios.get(`/api/SubCategory/by-category/${categoryId}`);
      return response.data;
    },
  },

  // Ask Admin API endpoints
  askAdmin: {
    // Submit question to admin
    submitQuestion: async (questionData) => {
      const response = await axios.post('/api/AskAdmin', questionData, {
        headers: { 'Content-Type': 'application/json' },
      });
      return response.data;
    },

    // Get user's questions
    getUserQuestions: async (userId) => {
      const response = await axios.get(`/api/AskAdmin/user/${userId}`);
      return response.data;
    },
  },
};

export default api; 