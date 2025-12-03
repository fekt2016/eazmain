import api from "./api";
import logger from "../utils/logger";

const sellerApi = {
  getFeaturedSellers: async (limit = 8, minRating = 4.0) => {
    try {
      const response = await api.get("/seller/public/featured", {
        params: { limit, minRating },
      });
      return response.data.data.sellers;
    } catch (error) {
      logger.error("Error fetching featured sellers:", error);
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
      logger.error("Error fetching seller:", error);
      throw error; // Important: throw to trigger React Query error state
    }
  },

  getBestSellers: async (params = {}) => {
    const { page = 1, limit = 20, sort = 'orders' } = params;
    
    try {
      const response = await api.get("/seller/public/best-sellers", {
        params: { page, limit, sort },
      });
      // Axios response structure: response.data contains the backend response
      // Backend returns: { status: 'success', data: { sellers: [...], total, page, limit, totalPages } }
      return response.data;
    } catch (error) {
      logger.error("Error fetching best sellers:", error);
      logger.error("Error details:", error.response?.data || error.message);
      // Return empty result on error instead of fallback
      return { 
        status: 'error',
        data: { 
          sellers: [], 
          total: 0, 
          page, 
          limit, 
          totalPages: 0 
        } 
      };
    }
  },
};

export default sellerApi;
