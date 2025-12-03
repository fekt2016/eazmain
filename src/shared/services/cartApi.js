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
        response: error.response?.data,
        status: error.response?.status,
      });
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
    await api.delete("/cart");
    return [];
  },
};

export default cartApi;
