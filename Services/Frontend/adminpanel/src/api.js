import axios from 'axios';

// API base URL options
const PROXY_URL = '/api';
const DIRECT_URL = 'https://localhost:7209/api';

// Create axios instances
const proxyAxios = axios.create({
  baseURL: PROXY_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const directAxios = axios.create({
  baseURL: DIRECT_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

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

// Helper function to try both proxy and direct approaches
const tryBothApproaches = async (config) => {
  try {
    // Try proxy first
    console.log('Trying proxy approach:', config.url);
    return await proxyAxios(config);
  } catch (proxyError) {
    console.log('Proxy approach failed, trying direct:', proxyError.message);
    try {
      // Fall back to direct if proxy fails
      return await directAxios(config);
    } catch (directError) {
      console.log('Direct approach also failed:', directError.message);
      throw directError; // Re-throw the last error
    }
  }
};

// Product API calls
export const productApi = {
  // Get all products
  getAll: async () => {
    try {
      const response = await axios.get(`${PROXY_URL}/Product/get-all`);
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get products by seller ID
  getBySeller: async (sellerId) => {
    try {
      console.log(sellerId);
      
      // Try both proxy and direct approaches with multiple endpoints
      const endpoints = [
        `/Product/get-by-seller/${sellerId}`,
        `/Product/getBySeller/${sellerId}`,
        `/Product/seller/${sellerId}`,
        `/Product/bySeller/${sellerId}`,
        `/Products/seller/${sellerId}`
      ];
      
      let lastError = null;
      
      // Try each endpoint with both proxy and direct approaches
      for (const endpoint of endpoints) {
        console.log(`Trying endpoint: ${endpoint}`);
        try {
          const response = await tryBothApproaches({
            method: 'get',
            url: endpoint
          });
          console.log(`Success with endpoint: ${endpoint}`);
          return response.data;
        } catch (error) {
          console.log(`Failed with endpoint: ${endpoint}`, error.message);
          lastError = error;
        }
      }
      
      // If we get here, all attempts failed
      throw lastError || new Error('Failed to fetch products');
    } catch (error) {
      console.error(`Error fetching products for seller ${sellerId}:`, error);
      throw error;
    }
  },

  // Get a single product by ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${PROXY_URL}/Product/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },

  // Add a new product
  add: async (productData) => {
    try {
      const response = await axios.post(`${PROXY_URL}/Product/add`, productData, authConfig());
      return response.data;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  },

  // Add multiple products
  addBulk: async (productsData) => {
    try {
      const response = await axios.post(`${PROXY_URL}/Product/add/bulk`, productsData, authConfig());
      return response.data;
    } catch (error) {
      console.error('Error adding bulk products:', error);
      throw error;
    }
  },

  // Update a product
  update: async (id, productData) => {
    try {
      // We're already formatting the data correctly in the component
      // Just ensure the Id is set properly and matches the URL parameter
      const dataToSend = {
        ...productData,
        Id: id // Ensure Id is uppercase to match C# model
      };
      
      console.log('API sending data:', dataToSend);
      
      const response = await axios.put(`${PROXY_URL}/Product/update/${id}`, dataToSend, authConfig());
      return response.data;
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
  },

  // Delete a product
  delete: async (id) => {
    try {
      const response = await axios.delete(`${PROXY_URL}/Product/delete/${id}`, authConfig());
      return response.data;
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  },

  // Delete all products
  deleteAll: async () => {
    try {
      const response = await axios.delete(`${PROXY_URL}/Product/delete-all`, authConfig());
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
      const response = await axios.post(`${PROXY_URL}/Order`, orderData, authConfig());
      return response.data;
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  },

  // Get orders by buyer ID
  getByBuyer: async (buyerId) => {
    try {
      const response = await axios.get(`${PROXY_URL}/Order/buyer/${buyerId}`, authConfig());
      return response.data;
    } catch (error) {
      console.error(`Error fetching orders for buyer ${buyerId}:`, error);
      throw error;
    }
  },

  // Get orders by seller ID
  getBySeller: async (sellerId) => {
    try {
      const response = await axios.get(`${PROXY_URL}/Order/seller/${sellerId}`, authConfig());
      return response.data;
    } catch (error) {
      console.error(`Error fetching orders for seller ${sellerId}:`, error);
      throw error;
    }
  },

  // Update order status
  updateStatus: async (orderId, newStatus) => {
    try {
      const response = await axios.put(`${PROXY_URL}/Order/${orderId}/status`, JSON.stringify(newStatus), authConfig());
      return response.data;
    } catch (error) {
      console.error(`Error updating order ${orderId} status:`, error);
      throw error;
    }
  },

  // Delete all orders for a seller
  deleteAllBySeller: async (sellerId) => {
    try {
      const response = await axios.delete(`${PROXY_URL}/Order/seller/${sellerId}/all`, authConfig());
      return response.data;
    } catch (error) {
      console.error(`Error deleting all orders for seller ${sellerId}:`, error);
      throw error;
    }
  },

  // Delete all orders
  deleteAll: async () => {
    try {
      const response = await axios.delete(`${PROXY_URL}/Order/all`, authConfig());
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
      const response = await axios.post(`${PROXY_URL}/Seller/signup`, sellerData);
      return response.data;
    } catch (error) {
      console.error('Error during seller signup:', error);
      throw error;
    }
  },

  // Log in a seller
  login: async (credentials) => {
    try {
      const response = await axios.post(`${PROXY_URL}/Seller/login`, credentials);
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
      const response = await proxyAxios.get('/Seller/get-all', authConfig());
      return response.data;
    } catch (error) {
      console.error('Error fetching all sellers:', error);
      throw error;
    }
  },

  // Get seller by ID
  getById: async (id) => {
    try {
      const response = await axios.get(`${PROXY_URL}/Seller/get/${id}`, authConfig());
      return response.data;
    } catch (error) {
      console.error(`Error fetching seller ${id}:`, error);
      throw error;
    }
  },

  // Update seller
  update: async (id, sellerData) => {
    try {
      const response = await axios.put(`${PROXY_URL}/Seller/update/${id}`, sellerData, authConfig());
      return response.data;
    } catch (error) {
      console.error(`Error updating seller ${id}:`, error);
      throw error;
    }
  },

  // Delete seller
  delete: async (id) => {
    try {
      const response = await axios.delete(`${PROXY_URL}/Seller/delete/${id}`, authConfig());
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
  },

  // Update seller status
  updateStatus: async (id, status) => {
    try {
      const response = await tryBothApproaches({
        method: 'put',
        url: `/Seller/update-status/${id}`,
        data: { Status: status },
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating seller status:`, error);
      throw error;
    }
  }
};

// Buyer/Retailer API calls
export const buyerApi = {
  // Get all buyers
  getAll: async () => {
    try {
      console.log("Fetching all buyers");
      const response = await tryBothApproaches({
        method: 'get',
        url: '/Buyer/get-all'
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching buyers:', error);
      throw error;
    }
  },

  // Get buyer by ID
  getById: async (id) => {
    try {
      const response = await tryBothApproaches({
        method: 'get', 
        url: `/Buyer/get/${id}`
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching buyer ${id}:`, error);
      throw error;
    }
  },

  // Update buyer status
  updateStatus: async (id, status) => {
    try {
      const response = await tryBothApproaches({
        method: 'put',
        url: `/Buyer/update-status/${id}`,
        data: { status },
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating buyer status:`, error);
      throw error;
    }
  }
};

// Category API calls
export const categoryApi = {
  create: async (categoryData) => {
    try {
      const response = await axios.post(`${PROXY_URL}/Category/create`, categoryData, authConfig());
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },
  getAll: async () => {
    try {
      const response = await axios.get(`${PROXY_URL}/Category/get-all`, authConfig());
      return response.data;
    } catch (error) {
      console.error('Error fetching all categories:', error);
      throw error;
    }
  },
  getById: async (id) => {
    try {
      const response = await axios.get(`${PROXY_URL}/Category/get/${id}`, authConfig());
      return response.data;
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error);
      throw error;
    }
  }
};

// SubCategory API calls
export const subCategoryApi = {
  create: async (subCategoryData) => {
    try {
      const payload = {
        SubCategoryName: subCategoryData.subCategoryName,
        CategoryId: subCategoryData.categoryId
      };
      const response = await axios.post(`${PROXY_URL}/SubCategory`, payload, authConfig());
      return response.data;
    } catch (error) {
      console.error('Error creating subcategory:', error);
      throw error;
    }
  },
  getByCategoryId: async (categoryId) => {
    try {
      const response = await axios.get(`${PROXY_URL}/SubCategory/by-category/${categoryId}`, authConfig());
      return response.data;
    } catch (error) {
      console.error(`Error fetching subcategories for category ${categoryId}:`, error);
      throw error;
    }
  }
};

// Diagnostic Functions
export const diagnosticApi = {
  checkConnection: async () => {
    const results = {
      proxy: { status: 'unknown', error: null },
      direct: { status: 'unknown', error: null },
      sellerEndpoint: { status: 'unknown', error: null },
      productEndpoint: { status: 'unknown', error: null }
    };
    
    // Test proxy
    try {
      const proxyResponse = await proxyAxios.get('/Seller/get-all', authConfig());
      results.proxy.status = proxyResponse.status;
      results.proxy.data = proxyResponse.data;
    } catch (error) {
      results.proxy.status = error.response?.status || 'failed';
      results.proxy.error = error.message;
    }
    
    // Test direct connection
    try {
      const directResponse = await directAxios.get('/Seller/get-all');
      results.direct.status = directResponse.status;
      results.direct.data = directResponse.data;
    } catch (error) {
      results.direct.status = error.response?.status || 'failed';
      results.direct.error = error.message;
    }
    
    return results;
  },
  
  // Test product API specifically
  testProductApi: async (sellerId) => {
    const results = {
      proxy: { status: 'unknown', error: null },
      direct: { status: 'unknown', error: null },
      altEndpoints: []
    };
    
    // Test via proxy
    try {
      const response = await axios.get(`${PROXY_URL}/Product/get-by-seller/${sellerId}`);
      results.proxy.status = response.status;
      results.proxy.data = response.data;
    } catch (error) {
      results.proxy.status = error.response?.status || 'failed';
      results.proxy.error = error.message;
    }
    
    // Test via direct connection
    try {
      const response = await directAxios.get(`/Product/get-by-seller/${sellerId}`);
      results.direct.status = response.status;
      results.direct.data = response.data;
    } catch (error) {
      results.direct.status = error.response?.status || 'failed';
      results.direct.error = error.message;
    }
    
    // Try alternative endpoints
    const altEndpoints = [
      `/Product/getBySeller/${sellerId}`,
      `/Product/seller/${sellerId}`,
      `/Product/bySeller/${sellerId}`,
      `/Products/seller/${sellerId}`,
      `/Products/get-by-seller/${sellerId}`
    ];
    
    for (const endpoint of altEndpoints) {
      try {
        const response = await directAxios.get(endpoint);
        results.altEndpoints.push({
          endpoint,
          status: response.status,
          success: response.status >= 200 && response.status < 300,
          data: response.data
        });
      } catch (error) {
        results.altEndpoints.push({
          endpoint,
          status: error.response?.status || 'failed',
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }
};

// AskAdmin API calls
export const askAdminApi = {
  // Get all questions
  getAll: async () => {
    try {
      const response = await axios.get(`${PROXY_URL}/AskAdmin`, authConfig());
      return response.data;
    } catch (error) {
      console.error('Error fetching all questions:', error);
      throw error;
    }
  },

  // Get questions by userId
  getByUser: async (userId) => {
    try {
      const response = await axios.get(`${PROXY_URL}/AskAdmin/user/${userId}`, authConfig());
      return response.data;
    } catch (error) {
      console.error(`Error fetching questions for user ${userId}:`, error);
      throw error;
    }
  },

  // Get question by id
  getById: async (id) => {
    try {
      const response = await axios.get(`${PROXY_URL}/AskAdmin/${id}`, authConfig());
      return response.data;
    } catch (error) {
      console.error(`Error fetching question ${id}:`, error);
      throw error;
    }
  },

  // Create a new question
  create: async (questionData) => {
    try {
      const response = await axios.post(`${PROXY_URL}/AskAdmin`, questionData, authConfig());
      return response.data;
    } catch (error) {
      console.error('Error creating question:', error);
      throw error;
    }
  },

  // Update a question (answer)
  update: async (id, updateData) => {
    try {
      const response = await axios.put(`${PROXY_URL}/AskAdmin/${id}`, updateData, authConfig());
      return response.data;
    } catch (error) {
      console.error(`Error updating question ${id}:`, error);
      throw error;
    }
  },

  // Delete a question
  delete: async (id) => {
    try {
      const response = await axios.delete(`${PROXY_URL}/AskAdmin/${id}`, authConfig());
      return response.data;
    } catch (error) {
      console.error(`Error deleting question ${id}:`, error);
      throw error;
    }
  }
};

// Admin API calls
export const adminApi = {
  // Get all admins
  getAll: async () => {
    try {
      const response = await axios.get(`${PROXY_URL}/Admin`, authConfig());
      return response.data;
    } catch (error) {
      console.error('Error fetching all admins:', error);
      throw error;
    }
  },

  // Get admin by id
  getById: async (id) => {
    try {
      const response = await axios.get(`${PROXY_URL}/Admin/${id}`, authConfig());
      return response.data;
    } catch (error) {
      console.error(`Error fetching admin ${id}:`, error);
      throw error;
    }
  },

  // Create a new admin
  create: async (adminData) => {
    try {
      const response = await axios.post(`${PROXY_URL}/Admin`, adminData, authConfig());
      return response.data;
    } catch (error) {
      console.error('Error creating admin:', error);
      throw error;
    }
  },

  // Update an admin
  update: async (id, adminData) => {
    try {
      const response = await axios.put(`${PROXY_URL}/Admin/${id}`, adminData, authConfig());
      return response.data;
    } catch (error) {
      console.error(`Error updating admin ${id}:`, error);
      throw error;
    }
  },

  // Delete an admin
  delete: async (id) => {
    try {
      const response = await axios.delete(`${PROXY_URL}/Admin/${id}`, authConfig());
      return response.data;
    } catch (error) {
      console.error(`Error deleting admin ${id}:`, error);
      throw error;
    }
  }
};

// SubAdmin API calls
export const subAdminApi = {
  // Get all subadmins
  getAll: async () => {
    try {
      const response = await axios.get(`${PROXY_URL}/SubAdmin`, authConfig());
      return response.data;
    } catch (error) {
      console.error('Error fetching all subadmins:', error);
      throw error;
    }
  },

  // Get subadmin by id
  getById: async (id) => {
    try {
      const response = await axios.get(`${PROXY_URL}/SubAdmin/${id}`, authConfig());
      return response.data;
    } catch (error) {
      console.error(`Error fetching subadmin ${id}:`, error);
      throw error;
    }
  },

  // Create a new subadmin
  create: async (subAdminData) => {
    try {
      const response = await axios.post(`${PROXY_URL}/SubAdmin`, subAdminData, authConfig());
      return response.data;
    } catch (error) {
      console.error('Error creating subadmin:', error);
      throw error;
    }
  },

  // Update a subadmin
  update: async (id, subAdminData) => {
    try {
      const response = await axios.put(`${PROXY_URL}/SubAdmin/${id}`, subAdminData, authConfig());
      return response.data;
    } catch (error) {
      console.error(`Error updating subadmin ${id}:`, error);
      throw error;
    }
  },

  // Delete a subadmin
  delete: async (id) => {
    try {
      const response = await axios.delete(`${PROXY_URL}/SubAdmin/${id}`, authConfig());
      return response.data;
    } catch (error) {
      console.error(`Error deleting subadmin ${id}:`, error);
      throw error;
    }
  }
};

// Export a combined API object
const api = {
  product: productApi,
  order: orderApi,
  seller: sellerApi,
  buyer: buyerApi,
  diagnostic: diagnosticApi,
  category: categoryApi,
  subCategory: subCategoryApi,
  askAdmin: askAdminApi,
  admin: adminApi,
  subAdmin: subAdminApi
};

export default api; 