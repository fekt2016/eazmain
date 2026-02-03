import api from "./api";
import logger from "../utils/logger";

const unwrapAdsResponse = (response) => {
  if (!response) return [];

  const data = response.data ?? response;
  if (!data) return [];

  if (Array.isArray(data)) return data;
  if (Array.isArray(data.ads)) return data.ads;
  if (Array.isArray(data.data?.ads)) return data.data.ads;

  return [];
};

const adApi = {
  async getActiveAds() {
    try {
      const response = await api.get("/ads/public");
      return unwrapAdsResponse(response);
    } catch (error) {
      logger.error("Failed to fetch active advertisements:", error);
      throw error;
    }
  },

  async getAds(params = {}) {
    try {
      const response = await api.get("/ads", { params });
      return response?.data ?? response;
    } catch (error) {
      logger.error("Failed to fetch advertisements:", error);
      throw error;
    }
  },

  async createAd(payload) {
    try {
      const response = await api.post("/ads", payload);
      return response?.data ?? response;
    } catch (error) {
      logger.error("Failed to create advertisement:", error);
      throw error;
    }
  },

  async updateAd(id, payload) {
    try {
      const response = await api.patch(`/ads/${id}`, payload);
      return response?.data ?? response;
    } catch (error) {
      logger.error(`Failed to update advertisement ${id}:`, error);
      throw error;
    }
  },

  async deleteAd(id) {
    try {
      const response = await api.delete(`/ads/${id}`);
      return response?.data ?? response;
    } catch (error) {
      logger.error(`Failed to delete advertisement ${id}:`, error);
      throw error;
    }
  },
};

export default adApi;
