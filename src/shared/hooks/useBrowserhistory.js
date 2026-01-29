import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import browswerHistoryApi from '../services/browserHistoryApi';
import logger from '../utils/logger';

// Fetch user's browsing history
export const useGetHistory = () => {
  return useQuery({
    queryKey: ["browserHistory"],
    queryFn: async () => {
      try {
        const response = await browswerHistoryApi.getHistory();

        return response;
      } catch (error) {
        logger.error(error);
      }
    },
  });
};

// Add a new history item (call this when viewing product/seller)
export const useAddHistoryItem = () => {
  return useMutation({
    mutationFn: async (data) => {
      try {
        const response = await browswerHistoryApi.addHistoryItem(data);
        
        // Handle skipped responses (duplicate views within 24h)
        // This is NOT an error - it's expected behavior
        if (response?.data?.skipped === true) {
          // Return response but don't log as success (it was skipped)
          // This prevents React Query from treating it as an error
          return response;
        }
        
        return response;
      } catch (error) {
        // Browsing history is non-critical. Avoid noisy logs in production.
        if (import.meta.env.DEV) {
          logger.error("Failed to add history item:", error);
        }
        throw error; // Re-throw to trigger onError for real errors
      }
    },
    onSuccess: (data) => {
      // Only log success if item was actually added (not skipped)
      if (data?.data?.skipped !== true) {
        logger.log("History item added successfully", data);
      }
      // Silently handle skipped responses - no logging needed
    },
    onError: (error) => {
      // Browsing history is non-critical. Avoid noisy logs in production.
      if (import.meta.env.DEV) {
        logger.error("Error adding history item:", error);
      }
    },
  });
};

// Delete multiple history items
export const useDeleteMultipleHistoryItems = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids) => {
      // Pass IDs directly to the API function
      await browswerHistoryApi.deleteMultipleItems(ids);
    },
    onSuccess: () => {
      queryClient.invalidateQueries("browserHistory");
    },
    onError: (error) => {
      logger.error("Deletion error:", error.message);
    },
  });
};

// Clear entire history
export const useClearHistory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => await browswerHistoryApi.clearAllHistory(),
    onSuccess: () => {
      queryClient.invalidateQueries("browserHistory");
    },
  });
};
