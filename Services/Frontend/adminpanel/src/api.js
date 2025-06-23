import axios from 'axios';

// Get API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5261';

console.log(`🌐 Admin Panel API Base URL: ${API_BASE_URL}`);

// API base URL options
const PROXY_URL = '/api';
const DIRECT_URL = `${API_BASE_URL}/api`;

// Create axios instances
const proxyAxios = axios.create({
  baseURL: PROXY_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true  // Enable cookies for all requests
});

const directAxios = axios.create({
  baseURL: DIRECT_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true  // Enable cookies for all requests
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

// Configuration helper for cookie-based requests (Admin/SubAdmin)
const cookieConfig = () => {
  return {
    headers: {
      'Content-Type': 'application/json'
    },
    withCredentials: true, // Important for cookies
  };
};

// Helper function to try both approaches
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

// Helper function to try both approaches with cookie support
const tryBothApproachesWithCookies = async (config) => {
  try {
    // Try proxy first with cookies
    console.log('Trying proxy approach with cookies:', config.url);
    const proxyConfig = { ...config, withCredentials: true };
    return await proxyAxios(proxyConfig);
  } catch (proxyError) {
    console.log('Proxy approach failed, trying direct:', proxyError.message);
    try {
      // Fall back to direct if proxy fails
      const directConfig = { ...config, withCredentials: true };
      return await directAxios(directConfig);
    } catch (directError) {
      console.log('Direct approach also failed:', directError.message);
      throw directError;
    }
  }
};

// Product API calls
export const productApi = {
  // Get all products
  getAll: async () => {
    try {
      const response = await tryBothApproachesWithCookies({
        method: 'get',
        url: '/Product/get-all'
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  // Get products by seller ID
  getBySeller: async (sellerId) => {
    try {
      console.log('Fetching products for seller:', sellerId);
      const response = await tryBothApproaches({
        method: 'get',
        url: `/Product/get-by-seller/${sellerId}`
      });
      console.log('Products fetched successfully');
      return response.data;
    } catch (error) {
      console.error(`Error fetching products for seller ${sellerId}:`, error);
      throw error;
    }
  },

  // Get a single product by ID
  getById: async (id) => {
    try {
      const response = await tryBothApproaches({
        method: 'get',
        url: `/Product/${id}`
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },

  // Add a new product
  add: async (productData) => {
    try {
      const response = await tryBothApproaches({
        method: 'post',
        url: '/Product/add',
        data: productData,
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  },

  // Add multiple products
  addBulk: async (productsData) => {
    try {
      const response = await tryBothApproaches({
        method: 'post',
        url: '/Product/add/bulk',
        data: productsData,
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error('Error adding bulk products:', error);
      throw error;
    }
  },

  // Update a product
  update: async (id, productData) => {
    try {
      // Ensure proper case for backend
      const dataToSend = {
        ...productData,
        Id: id // Ensure Id is uppercase to match C# model
      };
      
      console.log('API sending product update data:', dataToSend);
      console.log('Data structure check:', {
        hasId: !!dataToSend.Id,
        hasName: !!dataToSend.name,
        hasSellerId: !!dataToSend.sellerId,
        hasVariants: !!dataToSend.variants,
        variantsCount: dataToSend.variants?.length,
        firstVariant: dataToSend.variants?.[0]
      });
      
      const response = await tryBothApproaches({
        method: 'put',
        url: `/Product/update/${id}`,
        data: dataToSend,
        ...authConfig()
      });
      
      console.log('Product update response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      
      // Log more detailed error information
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
        console.error('Error response headers:', error.response.headers);
        
        // Log the request that failed
        console.error('Failed request config:', error.config);
        console.error('Failed request data:', error.config?.data);
      }
      
      throw error;
    }
  },

  // Update variant stock
  updateVariantStock: async (productId, variantId, newStock) => {
    try {
      const response = await tryBothApproaches({
        method: 'put',
        url: `/Product/update-variant-stock/${productId}/${variantId}`,
        data: { NewStock: newStock },
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating variant stock:`, error);
      throw error;
    }
  },

  // Update variant price
  updateVariantPrice: async (productId, variantId, newPrice) => {
    try {
      const response = await tryBothApproaches({
        method: 'put',
        url: `/Product/update-variant-price/${productId}/${variantId}`,
        data: { NewPrice: newPrice },
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating variant price:`, error);
      throw error;
    }
  },

  // Delete a product
  delete: async (id) => {
    try {
      const response = await tryBothApproaches({
        method: 'delete',
        url: `/Product/delete/${id}`,
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  },

  // Delete all products
  deleteAll: async () => {
    try {
      const response = await tryBothApproaches({
        method: 'delete',
        url: '/Product/delete-all',
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting all products:', error);
      throw error;
    }
  }
};

// Order API calls - Updated for cookie-based authentication
export const orderApi = {
  // Place a new order
  place: async (orderData) => {
    try {
      const response = await tryBothApproachesWithCookies({
        method: 'post',
        url: '/Order',
        data: orderData
      });
      return response.data;
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  },

  // Get all orders
  getAll: async () => {
    try {
      const response = await tryBothApproachesWithCookies({
        method: 'get',
        url: '/Order'
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw error;
    }
  },

  // Get orders by buyer ID
  getByBuyer: async (buyerId) => {
    try {
      const response = await tryBothApproachesWithCookies({
        method: 'get',
        url: `/Order/buyer/${buyerId}`
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching orders for buyer ${buyerId}:`, error);
      throw error;
    }
  },

  // Get orders by seller ID
  getBySeller: async (sellerId) => {
    try {
      const response = await tryBothApproachesWithCookies({
        method: 'get',
        url: `/Order/seller/${sellerId}`
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching orders for seller ${sellerId}:`, error);
      throw error;
    }
  },

  // Update order status
  updateStatus: async (orderId, newStatus) => {
    try {
      const response = await tryBothApproachesWithCookies({
        method: 'put',
        url: `/Order/${orderId}/status`,
        data: JSON.stringify(newStatus),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating order ${orderId} status:`, error);
      throw error;
    }
  },

  // Delete all orders for a seller
  deleteAllBySeller: async (sellerId) => {
    try {
      const response = await tryBothApproachesWithCookies({
        method: 'delete',
        url: `/Order/seller/${sellerId}/all`
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting all orders for seller ${sellerId}:`, error);
      throw error;
    }
  },

  // Delete all orders
  deleteAll: async () => {
    try {
      const response = await tryBothApproachesWithCookies({
        method: 'delete',
        url: '/Order/all'
      });
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
      const response = await tryBothApproaches({
        method: 'post',
        url: '/Seller/signup',
        data: sellerData
      });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('seller', JSON.stringify(response.data.seller));
      }
      return response.data;
    } catch (error) {
      console.error('Error during seller signup:', error);
      throw error;
    }
  },

  // Log in a seller
  login: async (credentials) => {
    try {
      const response = await tryBothApproaches({
        method: 'post',
        url: '/Seller/login',
        data: credentials
      });
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
      const response = await tryBothApproachesWithCookies({
        method: 'get',
        url: '/Seller/get-all'
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all sellers:', error);
      throw error;
    }
  },

  // Get seller by ID
  getById: async (id) => {
    try {
      const response = await tryBothApproaches({
        method: 'get',
        url: `/Seller/get/${id}`,
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching seller ${id}:`, error);
      throw error;
    }
  },

  // Update seller
  update: async (id, sellerData) => {
    try {
      const response = await tryBothApproaches({
        method: 'put',
        url: `/Seller/update/${id}`,
        data: sellerData,
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating seller ${id}:`, error);
      throw error;
    }
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
  },

  // Update all seller fields
  updateAllFields: async (id, sellerData) => {
    try {
      const response = await tryBothApproaches({
        method: 'put',
        url: `/Seller/update-all-fields/${id}`,
        data: sellerData,
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating all seller fields ${id}:`, error);
      throw error;
    }
  },

  // Delete seller
  delete: async (id) => {
    try {
      const response = await tryBothApproaches({
        method: 'delete',
        url: `/Seller/delete/${id}`,
        ...authConfig()
      });
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

// User API calls (combines buyers and sellers for admin purposes)
export const userApi = {
  // Get all users (buyers + sellers combined)
  getAll: async () => {
    try {
      console.log("Fetching all users (buyers + sellers)");
      
      // Fetch both buyers and sellers in parallel
      const [buyersData, sellersData] = await Promise.all([
        buyerApi.getAll().catch(() => []),
        sellerApi.getAll().catch(() => [])
      ]);
      
      // Combine and format the data with consistent structure
      const users = [
        ...(buyersData || []).map(buyer => ({
          id: buyer.id,
          name: buyer.name || buyer.businessName || buyer.username || buyer.email,
          email: buyer.email,
          type: 'buyer',
          originalData: buyer
        })),
        ...(sellersData || []).map(seller => ({
          id: seller.id,
          name: seller.name || seller.businessName || seller.username || seller.email,
          email: seller.email,
          type: 'seller',
          originalData: seller
        }))
      ];
      
      console.log(`Combined ${users.length} users from buyers and sellers`);
      return users;
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  },

  // Get user by ID (searches both buyers and sellers)
  getById: async (id) => {
    try {
      // Try to find in buyers first
      try {
        const buyer = await buyerApi.getById(id);
        return {
          id: buyer.id,
          name: buyer.name || buyer.businessName || buyer.username || buyer.email,
          email: buyer.email,
          type: 'buyer',
          originalData: buyer
        };
      } catch (buyerError) {
        // If not found in buyers, try sellers
        try {
          const seller = await sellerApi.getById(id);
          return {
            id: seller.id,
            name: seller.name || seller.businessName || seller.username || seller.email,
            email: seller.email,
            type: 'seller',
            originalData: seller
          };
        } catch (sellerError) {
          throw new Error(`User with ID ${id} not found in buyers or sellers`);
        }
      }
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  }
};

// Buyer/Retailer API calls
export const buyerApi = {
  // Register a new buyer
  signup: async (buyerData) => {
    try {
      const response = await tryBothApproaches({
        method: 'post',
        url: '/Buyer/signup',
        data: buyerData
      });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('buyer', JSON.stringify(response.data.buyer));
      }
      return response.data;
    } catch (error) {
      console.error('Error during buyer signup:', error);
      throw error;
    }
  },

  // Log in a buyer
  login: async (credentials) => {
    try {
      const response = await tryBothApproaches({
        method: 'post',
        url: '/Buyer/login',
        data: credentials
      });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('buyer', JSON.stringify(response.data.buyer));
      }
      return response.data;
    } catch (error) {
      console.error('Error during buyer login:', error);
      throw error;
    }
  },

  // Get all buyers
  getAll: async () => {
    try {
      console.log("Fetching all buyers");
      const response = await tryBothApproachesWithCookies({
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
        url: `/Buyer/get/${id}`,
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching buyer ${id}:`, error);
      throw error;
    }
  },

  // Update buyer
  update: async (id, buyerData) => {
    try {
      const response = await tryBothApproaches({
        method: 'put',
        url: `/Buyer/update/${id}`,
        data: buyerData,
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating buyer ${id}:`, error);
      throw error;
    }
  },

  // Update buyer status
  updateStatus: async (id, status) => {
    try {
      const response = await tryBothApproaches({
        method: 'put',
        url: `/Buyer/update-status/${id}`,
        data: { Status: status },
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating buyer status:`, error);
      throw error;
    }
  },

  // Delete buyer
  delete: async (id) => {
    try {
      const response = await tryBothApproaches({
        method: 'delete',
        url: `/Buyer/delete/${id}`,
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting buyer ${id}:`, error);
      throw error;
    }
  }
};

// Category API calls
export const categoryApi = {
  // Create a new category
  create: async (categoryData) => {
    try {
      const response = await tryBothApproaches({
        method: 'post',
        url: '/Category/create',
        data: categoryData,
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  // Get all categories
  getAll: async () => {
    try {
      const response = await tryBothApproaches({
        method: 'get',
        url: '/Category/get-all',
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all categories:', error);
      throw error;
    }
  },

  // Get category by ID
  getById: async (id) => {
    try {
      const response = await tryBothApproaches({
        method: 'get',
        url: `/Category/get/${id}`,
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error);
      throw error;
    }
  },

  // Update category
  update: async (id, categoryData) => {
    try {
      const response = await tryBothApproaches({
        method: 'put',
        url: `/Category/update/${id}`,
        data: categoryData,
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating category ${id}:`, error);
      throw error;
    }
  },

  // Delete category
  delete: async (id) => {
    try {
      const response = await tryBothApproaches({
        method: 'delete',
        url: `/Category/delete/${id}`,
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting category ${id}:`, error);
      throw error;
    }
  }
};

// SubCategory API calls
export const subCategoryApi = {
  // Create a new subcategory
  create: async (subCategoryData) => {
    try {
      const payload = {
        SubCategoryName: subCategoryData.subCategoryName,
        CategoryId: subCategoryData.categoryId
      };
      const response = await tryBothApproaches({
        method: 'post',
        url: '/SubCategory',
        data: payload,
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error('Error creating subcategory:', error);
      throw error;
    }
  },

  // Get all subcategories
  getAll: async () => {
    try {
      const response = await tryBothApproaches({
        method: 'get',
        url: '/SubCategory',
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all subcategories:', error);
      throw error;
    }
  },

  // Get subcategory by ID
  getById: async (id) => {
    try {
      const response = await tryBothApproaches({
        method: 'get',
        url: `/SubCategory/${id}`,
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching subcategory ${id}:`, error);
      throw error;
    }
  },

  // Get subcategories by category ID
  getByCategoryId: async (categoryId) => {
    try {
      const response = await tryBothApproaches({
        method: 'get',
        url: `/SubCategory/by-category/${categoryId}`,
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching subcategories for category ${categoryId}:`, error);
      throw error;
    }
  },

  // Update subcategory
  update: async (id, subCategoryData) => {
    try {
      const response = await tryBothApproaches({
        method: 'put',
        url: `/SubCategory/${id}`,
        data: subCategoryData,
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating subcategory ${id}:`, error);
      throw error;
    }
  },

  // Delete subcategory
  delete: async (id) => {
    try {
      const response = await tryBothApproaches({
        method: 'delete',
        url: `/SubCategory/${id}`,
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting subcategory ${id}:`, error);
      throw error;
    }
  }
};

// Cart API calls
export const cartApi = {
  // Add item to cart
  addItem: async (cartItem) => {
    try {
      const response = await tryBothApproaches({
        method: 'post',
        url: '/Cart',
        data: cartItem,
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      throw error;
    }
  },

  // Get all cart items
  getAll: async () => {
    try {
      const response = await tryBothApproaches({
        method: 'get',
        url: '/Cart',
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all cart items:', error);
      throw error;
    }
  },

  // Get user's cart
  getByUser: async (userId) => {
    try {
      const response = await tryBothApproaches({
        method: 'get',
        url: `/Cart/user/${userId}`,
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching cart for user ${userId}:`, error);
      throw error;
    }
  },

  // Update cart item quantity
  updateQuantity: async (id, quantity) => {
    try {
      const response = await tryBothApproaches({
        method: 'put',
        url: `/Cart/${id}`,
        data: quantity,
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating cart item ${id}:`, error);
      throw error;
    }
  },

  // Remove item from cart
  removeItem: async (id) => {
    try {
      const response = await tryBothApproaches({
        method: 'delete',
        url: `/Cart/${id}`,
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error(`Error removing cart item ${id}:`, error);
      throw error;
    }
  }
};

// Wishlist API calls
export const wishlistApi = {
  // Add item to wishlist
  addItem: async (wishlistItem) => {
    try {
      const response = await tryBothApproaches({
        method: 'post',
        url: '/Wishlist',
        data: wishlistItem,
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error('Error adding item to wishlist:', error);
      throw error;
    }
  },

  // Get all wishlist items
  getAll: async () => {
    try {
      const response = await tryBothApproaches({
        method: 'get',
        url: '/Wishlist',
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all wishlist items:', error);
      throw error;
    }
  },

  // Get user's wishlist
  getByUser: async (userId) => {
    try {
      const response = await tryBothApproaches({
        method: 'get',
        url: `/Wishlist/user/${userId}`,
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching wishlist for user ${userId}:`, error);
      throw error;
    }
  },

  // Remove item from wishlist
  removeItem: async (id) => {
    try {
      const response = await tryBothApproaches({
        method: 'delete',
        url: `/Wishlist/${id}`,
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error(`Error removing wishlist item ${id}:`, error);
      throw error;
    }
  }
};

// Review and Rating API calls
export const reviewApi = {
  // Create a new review
  create: async (reviewData) => {
    try {
      const response = await tryBothApproaches({
        method: 'post',
        url: '/ReviewRating',
        data: reviewData,
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  },

  // Get all reviews
  getAll: async () => {
    try {
      const response = await tryBothApproaches({
        method: 'get',
        url: '/ReviewRating',
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all reviews:', error);
      throw error;
    }
  },

  // Get reviews by product ID
  getByProduct: async (productId) => {
    try {
      const response = await tryBothApproaches({
        method: 'get',
        url: `/ReviewRating/product/${productId}`,
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching reviews for product ${productId}:`, error);
      throw error;
    }
  },

  // Delete review
  delete: async (id) => {
    try {
      const response = await tryBothApproaches({
        method: 'delete',
        url: `/ReviewRating/${id}`,
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting review ${id}:`, error);
      throw error;
    }
  }
};

// Banner API calls for two image arrays (Image1 and Image2)
export const bannerApi = {
  // Get all banners
  getAllBanners: async () => {
    try {
      const response = await tryBothApproachesWithCookies({
        method: 'get',
        url: '/Banner'
      });
      return response;
    } catch (error) {
      console.error('Error fetching all banners:', error);
      throw error;
    }
  },

  // Get banner by ID
  getBannerById: async (id) => {
    try {
      const response = await tryBothApproachesWithCookies({
        method: 'get',
        url: `/Banner/${id}`
      });
      return response;
    } catch (error) {
      console.error(`Error fetching banner ${id}:`, error);
      throw error;
    }
  },

  // Create banner with all images (both Image1 and Image2 arrays)
  createBannerWithAllImages: async (bannerData) => {
    try {
      const response = await tryBothApproachesWithCookies({
        method: 'post',
        url: '/Banner/all',
        data: bannerData
      });
      return response;
    } catch (error) {
      console.error('Error creating banner with all images:', error);
      throw error;
    }
  },

  // Create banner with single image array
  createBannerWithSingleImage: async (bannerData) => {
    try {
      const response = await tryBothApproachesWithCookies({
        method: 'post',
        url: '/Banner/single',
        data: bannerData
      });
      return response;
    } catch (error) {
      console.error('Error creating banner with single image array:', error);
      throw error;
    }
  },

  // Update entire image array (Image1 or Image2)
  updateImageArray: async (bannerId, imageField, imageData) => {
    try {
      const response = await tryBothApproachesWithCookies({
        method: 'put',
        url: `/Banner/${bannerId}/images/${imageField}`,
        data: imageData
      });
      return response;
    } catch (error) {
      console.error(`Error updating ${imageField} array in banner ${bannerId}:`, error);
      throw error;
    }
  },

  // Add images to existing image array
  addImagesToArray: async (bannerId, imageField, imageData) => {
    try {
      const response = await tryBothApproachesWithCookies({
        method: 'post',
        url: `/Banner/${bannerId}/add-images/${imageField}`,
        data: imageData
      });
      return response;
    } catch (error) {
      console.error(`Error adding images to ${imageField} array in banner ${bannerId}:`, error);
      throw error;
    }
  },

  // Delete specific image from array
  deleteImageFromArray: async (bannerId, imageField, imageIndex) => {
    try {
      const response = await tryBothApproachesWithCookies({
        method: 'delete',
        url: `/Banner/${bannerId}/images/${imageField}/${imageIndex}`
      });
      return response;
    } catch (error) {
      console.error(`Error deleting image ${imageIndex} from ${imageField} array in banner ${bannerId}:`, error);
      throw error;
    }
  },

  // Delete entire banner
  deleteBanner: async (bannerId) => {
    try {
      const response = await tryBothApproachesWithCookies({
        method: 'delete',
        url: `/Banner/${bannerId}`
      });
      return response;
    } catch (error) {
      console.error(`Error deleting banner ${bannerId}:`, error);
      throw error;
    }
  },

  // Delete all banners
  deleteAllBanners: async () => {
    try {
      const response = await tryBothApproachesWithCookies({
        method: 'delete',
        url: '/Banner/all'
      });
      return response;
    } catch (error) {
      console.error('Error deleting all banners:', error);
      throw error;
    }
  }
};

// AskAdmin API calls
export const askAdminApi = {
  // Create a new question
  create: async (questionData) => {
    try {
      const response = await tryBothApproaches({
        method: 'post',
        url: '/AskAdmin',
        data: questionData,
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error('Error creating question:', error);
      throw error;
    }
  },

  // Get all questions
  getAll: async () => {
    try {
      const response = await tryBothApproaches({
        method: 'get',
        url: '/AskAdmin',
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all questions:', error);
      throw error;
    }
  },

  // Get questions by userId
  getByUser: async (userId) => {
    try {
      const response = await tryBothApproaches({
        method: 'get',
        url: `/AskAdmin/user/${userId}`,
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching questions for user ${userId}:`, error);
      throw error;
    }
  },

  // Get question by id
  getById: async (id) => {
    try {
      const response = await tryBothApproaches({
        method: 'get',
        url: `/AskAdmin/${id}`,
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching question ${id}:`, error);
      throw error;
    }
  },

  // Update a question (answer)
  update: async (id, updateData) => {
    try {
      const response = await tryBothApproaches({
        method: 'put',
        url: `/AskAdmin/${id}`,
        data: updateData,
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating question ${id}:`, error);
      throw error;
    }
  },

  // Delete a question
  delete: async (id) => {
    try {
      const response = await tryBothApproaches({
        method: 'delete',
        url: `/AskAdmin/${id}`,
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting question ${id}:`, error);
      throw error;
    }
  }
};

// Admin API calls - Updated for cookie-based authentication
export const adminApi = {
  // Admin signup
  signup: async (adminData) => {
    try {
      const response = await tryBothApproachesWithCookies({
        method: 'post',
        url: '/Admin/signup',
        data: adminData
      });
      // No need to store token - it's in cookies
      return response.data;
    } catch (error) {
      console.error('Error during admin signup:', error);
      throw error;
    }
  },

  // Admin login
  login: async (credentials) => {
    try {
      const response = await tryBothApproachesWithCookies({
        method: 'post',
        url: '/Admin/login',
        data: credentials
      });
      // No need to store token - it's in cookies
      return response.data;
    } catch (error) {
      console.error('Error during admin login:', error);
      throw error;
    }
  },

  // Admin logout
  logout: async () => {
    try {
      const response = await tryBothApproachesWithCookies({
        method: 'post',
        url: '/Admin/logout'
      });
      // Clear any localStorage data
      localStorage.removeItem('admin');
      return response.data;
    } catch (error) {
      console.error('Error during admin logout:', error);
      throw error;
    }
  },

  // Verify session
  verifySession: async () => {
    try {
      const response = await tryBothApproachesWithCookies({
        method: 'get',
        url: '/Admin/verify-session'
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying admin session:', error);
      throw error;
    }
  },

  // Get all admins
  getAll: async () => {
    try {
      const response = await tryBothApproachesWithCookies({
        method: 'get',
        url: '/Admin/get-all'
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all admins:', error);
      throw error;
    }
  },

  // Get admin by id
  getById: async (id) => {
    try {
      const response = await tryBothApproachesWithCookies({
        method: 'get',
        url: `/Admin/get/${id}`
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching admin ${id}:`, error);
      throw error;
    }
  },

  // Create a new admin (legacy method name for compatibility)
  create: async (adminData) => {
    return await adminApi.signup(adminData);
  },

  // Update an admin
  update: async (id, adminData) => {
    try {
      const response = await tryBothApproachesWithCookies({
        method: 'put',
        url: `/Admin/update/${id}`,
        data: adminData
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating admin ${id}:`, error);
      throw error;
    }
  },

  // Delete an admin
  delete: async (id) => {
    try {
      const response = await tryBothApproachesWithCookies({
        method: 'delete',
        url: `/Admin/delete/${id}`
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting admin ${id}:`, error);
      throw error;
    }
  }
};

// SubAdmin API calls - Updated for cookie-based authentication
export const subAdminApi = {
  // SubAdmin signup
  signup: async (subAdminData) => {
    try {
      const response = await tryBothApproachesWithCookies({
        method: 'post',
        url: '/SubAdmin/signup',
        data: subAdminData
      });
      // No need to store token - it's in cookies
      return response.data;
    } catch (error) {
      console.error('Error during subadmin signup:', error);
      throw error;
    }
  },

  // SubAdmin login
  login: async (credentials) => {
    try {
      const response = await tryBothApproachesWithCookies({
        method: 'post',
        url: '/SubAdmin/login',
        data: credentials
      });
      // No need to store token - it's in cookies
      return response.data;
    } catch (error) {
      console.error('Error during subadmin login:', error);
      throw error;
    }
  },

  // SubAdmin logout
  logout: async () => {
    try {
      const response = await tryBothApproachesWithCookies({
        method: 'post',
        url: '/SubAdmin/logout'
      });
      // Clear any localStorage data
      localStorage.removeItem('subAdmin');
      return response.data;
    } catch (error) {
      console.error('Error during subadmin logout:', error);
      throw error;
    }
  },

  // Verify session
  verifySession: async () => {
    try {
      const response = await tryBothApproachesWithCookies({
        method: 'get',
        url: '/SubAdmin/verify-session'
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying subadmin session:', error);
      throw error;
    }
  },

  // Get all subadmins
  getAll: async () => {
    try {
      const response = await tryBothApproachesWithCookies({
        method: 'get',
        url: '/SubAdmin/get-all'
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all subadmins:', error);
      throw error;
    }
  },

  // Get subadmin by id
  getById: async (id) => {
    try {
      const response = await tryBothApproachesWithCookies({
        method: 'get',
        url: `/SubAdmin/get/${id}`
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching subadmin ${id}:`, error);
      throw error;
    }
  },

  // Create a new subadmin (legacy method name for compatibility)
  create: async (subAdminData) => {
    return await subAdminApi.signup(subAdminData);
  },

  // Update a subadmin
  update: async (id, subAdminData) => {
    try {
      const response = await tryBothApproachesWithCookies({
        method: 'put',
        url: `/SubAdmin/update/${id}`,
        data: subAdminData
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating subadmin ${id}:`, error);
      throw error;
    }
  },

  // Update subadmin roles only
  updateRoles: async (id, roles) => {
    try {
      const response = await tryBothApproachesWithCookies({
        method: 'put',
        url: `/SubAdmin/update-roles/${id}`,
        data: { Roles: roles }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating subadmin roles ${id}:`, error);
      throw error;
    }
  },

  // Delete a subadmin
  delete: async (id) => {
    try {
      const response = await tryBothApproachesWithCookies({
        method: 'delete',
        url: `/SubAdmin/delete/${id}`
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting subadmin ${id}:`, error);
      throw error;
    }
  }
};

// Role API calls
export const roleApi = {
  // Get all roles
  getAll: async () => {
    try {
      const response = await tryBothApproaches({
        method: 'get',
        url: '/Role',
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all roles:', error);
      throw error;
    }
  },

  // Get role by id
  getById: async (id) => {
    try {
      const response = await tryBothApproaches({
        method: 'get',
        url: `/Role/${id}`,
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching role ${id}:`, error);
      throw error;
    }
  },

  // Create a new role
  create: async (roleData) => {
    try {
      // Ensure proper data structure for Role
      const formattedData = {
        Name: roleData.name || roleData.Name,
        Tabs: roleData.tabs || roleData.Tabs || []
      };
      
      const response = await tryBothApproaches({
        method: 'post',
        url: '/Role',
        data: formattedData,
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  },

  // Update a role
  update: async (id, roleData) => {
    try {
      // Ensure proper data structure for Role
      const formattedData = {
        Id: id,
        Name: roleData.name || roleData.Name,
        Tabs: roleData.tabs || roleData.Tabs || []
      };
      
      const response = await tryBothApproaches({
        method: 'put',
        url: `/Role/${id}`,
        data: formattedData,
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating role ${id}:`, error);
      throw error;
    }
  },

  // Update role tabs
  updateTabs: async (id, tabs) => {
    try {
      const response = await tryBothApproaches({
        method: 'put',
        url: `/Role/${id}/tabs`,
        data: tabs,
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating role tabs ${id}:`, error);
      throw error;
    }
  },

  // Delete a role
  delete: async (id) => {
    try {
      const response = await tryBothApproaches({
        method: 'delete',
        url: `/Role/${id}`,
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting role ${id}:`, error);
      throw error;
    }
  },

  // Get available tabs
  getAvailableTabs: async () => {
    try {
      const response = await tryBothApproaches({
        method: 'get',
        url: '/Role/available-tabs',
        ...authConfig()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching available tabs:', error);
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
      const response = await proxyAxios.get(`/Product/get-by-seller/${sellerId}`);
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
    
    return results;
  }
};

// Export a combined API object
const api = {
  product: productApi,
  order: orderApi,
  seller: sellerApi,
  buyer: buyerApi,
  user: userApi,  // Combined buyers and sellers
  category: categoryApi,
  subCategory: subCategoryApi,
  cart: cartApi,
  wishlist: wishlistApi,
  review: reviewApi,
  banner: bannerApi,
  askAdmin: askAdminApi,
  admin: adminApi,
  subAdmin: subAdminApi,
  role: roleApi,
  diagnostic: diagnosticApi
};

export default api; 