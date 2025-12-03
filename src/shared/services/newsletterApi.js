import api from "./api";
import logger from '../utils/logger';

const newsletter = {
  subscribe: async (email) => {
    try {
      const response = await api.post("/newsletter", { email });
      return response;
    } catch (error) {
      logger.log("API Error - subscribe:", {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
      });
      throw new Error(error.response?.data?.message || "Failed to subscribe");
    }
  },
};

export default newsletter;
