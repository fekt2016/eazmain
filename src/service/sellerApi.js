import api from "./api";

const sellerApi = {
  getFeaturedSellers: async (limit = 8, minRating = 4.0) => {
    try {
      const response = await api.get("/seller/public/featured", {
        params: { limit, minRating },
      });
      return response.data.data.sellers;
    } catch (error) {
      console.error("Error fetching featured sellers:", error);
      return [];
    }
  },
  getSellerById: async (sellerId) => {
    try {
      const response = await api.get(`/seller/public/${sellerId}`);
      return response.data.data.seller;
    } catch (error) {
      // Handle different error statuses
      if (error.response) {
        if (error.response.status === 404) {
          throw new Error("Seller not found");
        }
        if (error.response.status === 401) {
          throw new Error("Unauthorized access");
        }
      }
      throw new Error("Failed to fetch seller data");
    }
  },

  getSellerProfile: async (sellerId) => {
    try {
      const response = await api.get(`/seller/profile/${sellerId}`);
      return response; // Adjust based on your actual response structure
    } catch (error) {
      console.error("Error fetching seller:", error);
      throw error; // Important: throw to trigger React Query error state
    }
  },
};

export default sellerApi;
