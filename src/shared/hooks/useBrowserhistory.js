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
        return response;
      } catch (error) {
        logger.error(error);
      }
    },
    onSuccess: (data) => {
      console.log("history item added successfully!!!", data);
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
