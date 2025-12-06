// src/service/browserHistoryApi.js
import api from "./api";
import logger from '../utils/logger';

const browserHistoryApi = {
  //   Get user's browsing history
  getHistory: async () => {
    try {
      const response = await api.get("/history");

      return response;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch history"
      );
    }
  },

  // Add a new history item
  addHistoryItem: async (item) => {
    try {
      const response = await api.post("/history", item);
      return response;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to add history item"
      );
    }
  },

  // Delete a single history item
  //   deleteHistoryItem: async (id) => {
  //     try {
  //       await api.delete(`/history/${id}`);
  //     } catch (error) {
  //       throw new Error(
  //         error.response?.data?.message || "Failed to delete history item"
  //       );
  //     }
  //   },

  // Delete multiple history items
  deleteMultipleItems: async (ids) => {
    logger.log("Deleting IDs:", ids);

    try {
      // Send IDs in request body
      const response = await api.delete("/history/multiple", {
        data: { ids }, // Send as { ids: [...] }
      });
      return response;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to delete items"
      );
    }
  },

  // Clear all browsing history
  clearAllHistory: async () => {
    try {
      await api.delete("/history/clear-all");
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to clear history"
      );
    }
  },
};

export default browserHistoryApi;
