// src/apiService/cartApi.js
import api from "./api"; // Your base API instance

const cartApi = {
  getCart: async () => {
    const response = await api.get("/cart");
    return response;
  },

  addToCart: async (productId, quantity, variantId) => {
    try {
      // Match backend expected format
      const response = await api.post("/cart", {
        productId,
        quantity,
        variantId,
      });
      // console.log("api response cart:", response.data);
      return response; // Return full response
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    }
  },
  updateCartItem: async (itemId, quantity) => {
    const response = await api.patch(`/cart/items/${itemId}`, { quantity });
    console.log("Updated cart item:", response);
    return response;
  },

  removeCartItem: async (itemId) => {
    console.log("api Removing item:", itemId);
    await api.delete(`/cart/items/${itemId}`);
    return itemId;
  },

  clearCart: async () => {
    await api.delete("/cart");
    return [];
  },
};

export default cartApi;
