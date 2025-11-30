import api from "./api";

const newsletter = {
  subscribe: async (email) => {
    try {
      const response = await api.post("/newsletter", { email });
      return response;
    } catch (error) {
      console.log("API Error - subscribe:", {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
      });
      throw new Error(error.response?.data?.message || "Failed to subscribe");
    }
  },
};

export default newsletter;
