// sr./apiService/cartApi.js
import api from './api';
import logger from '../utils/logger'; // Your base API instance

const cartApi = {
  getCart: async () => {
    const response = await api.get("/cart");
    return response;
  },

  addToCart: async (productId, quantity, variantId) => {
    try {
      // Match backend expected format
      // variantId can be a string ID or an object with _id
      const variantIdValue = typeof variantId === 'object' && variantId?._id 
        ? variantId._id 
        : variantId;
      
      logger.log("Add to cart request:", { productId, quantity, variantId: variantIdValue });
      
      const response = await api.post("/cart", {
        productId,
        quantity,
        variantId: variantIdValue || undefined, // Only include if it exists
      });
      logger.log("Add to cart API response:", response.data);
      return response; // Return full response
    } catch (error) {
      logger.error("Error adding to cart:", error);
      logger.error("Error details:", {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
        },
      });
      
      // Handle network errors specifically
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        const networkError = new Error(
          "Unable to connect to the server. Please check your internet connection and ensure the server is running."
        );
        networkError.code = 'NETWORK_ERROR';
        networkError.originalError = error;
        throw networkError;
      }
      
      // Handle timeout errors
      if (error.code === 'ECONNABORTED') {
        const timeoutError = new Error(
          "Request timed out. Please try again."
        );
        timeoutError.code = 'TIMEOUT';
        timeoutError.originalError = error;
        throw timeoutError;
      }
      
      // Provide user-friendly error messages
      if (error.response?.status === 403) {
        const errorMessage = error.response?.data?.message || 
          "You don't have permission to add items to cart. Please ensure you're logged in as a buyer account.";
        const enhancedError = new Error(errorMessage);
        enhancedError.status = 403;
        enhancedError.code = 'FORBIDDEN';
        enhancedError.originalError = error;
        throw enhancedError;
      }
      
      if (error.response?.status === 401) {
        const errorMessage = error.response?.data?.message || 
          "Please log in to add items to your cart.";
        const enhancedError = new Error(errorMessage);
        enhancedError.status = 401;
        enhancedError.code = 'UNAUTHORIZED';
        enhancedError.originalError = error;
        throw enhancedError;
      }
      
      throw error;
    }
  },
  updateCartItem: async (itemId, quantity) => {
    const response = await api.patch(`/cart/items/${itemId}`, { quantity });
    logger.log("Updated cart item:", response);
    return response;
  },

  removeCartItem: async (itemId) => {
    logger.log("api Removing item:", itemId);
    await api.delete(`/cart/items/${itemId}`);
    return itemId;
  },

  clearCart: async () => {
    try {
      const response = await api.delete("/cart");
      // Backend may return 204 No Content or { data: null, status: 'success' }
      // Return proper structure for empty cart that matches getCartStructure expectations
      if (response?.data?.data?.cart) {
        return response.data;
      }
      // If response is null/undefined (204 No Content) or has different structure
      return { 
        status: 'success', 
        data: { 
          cart: { 
            products: [] 
          } 
        } 
      };
    } catch (error) {
      logger.error("Error clearing cart:", error);
      throw error;
    }
  },
};

export default cartApi;
