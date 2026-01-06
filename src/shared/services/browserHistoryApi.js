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
      
      // Handle skipped responses gracefully (not an error)
      // Backend returns 200 with skipped: true for duplicate views within 24h
      if (response?.data?.skipped === true) {
        // Return the response as-is - this is a successful operation
        // that was intentionally skipped, not an error
        return response;
      }
      
      return response;
    } catch (error) {
      // Only throw for actual errors (network, 500, auth, etc.)
      // 400 errors for duplicates are now handled by backend returning 200 with skipped flag
      const status = error.response?.status;
      const errorMessage = error.response?.data?.message || "Failed to add history item";
      
      // If it's a 400 and the message indicates duplicate, treat as skipped
      // (This is a fallback in case backend hasn't been updated yet)
      if (status === 400 && errorMessage.includes('already viewed')) {
        return {
          data: {
            status: 'success',
            skipped: true,
            reason: 'ALREADY_VIEWED',
            message: errorMessage,
          },
        };
      }
      
      // Throw for all other errors
      throw new Error(errorMessage);
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
