import { useQuery } from "@tanstack/react-query";
import searchApi from '../services/searchApi';

/**
 * Hook for search suggestions (autocomplete)
 * @param {string} searchTerm - Search term
 * @param {Object} options - Query options
 */
export const useSearchSuggestions = (searchTerm, options = {}) => {
  const { staleTime = 2 * 60 * 1000 } = options;

  return useQuery({
    queryKey: ["searchSuggestions", searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return { success: true, data: [] };
      const response = await searchApi.searchSuggestions(searchTerm);
      // response is already response.data from searchApi, which should be { success: true, data: [...] }
      return response;
    },
    enabled: !!searchTerm && searchTerm.length >= 2, // Must be a boolean, not an object
    staleTime,
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
};

/**
 * Hook for search products (typeahead)
 * @param {string} searchTerm - Search term
 */
export const useSearchProducts = (searchTerm) => {
  return useQuery({
    queryKey: ["searchProducts", searchTerm],
    queryFn: async () => {
      if (!searchTerm || searchTerm.length < 2) return [];
      const response = await searchApi.searchProducts(searchTerm);
      return response;
    },
    enabled: !!searchTerm && searchTerm.length >= 2,
    staleTime: 5 * 60 * 1000, // Cache results for 5 minutes
  });
};

/**
 * Hook for search results with filters and pagination
 * @param {Object} queryParams - Search query parameters
 */
export const useSearchResults = (queryParams) => {
  return useQuery({
    queryKey: ["searchResults", queryParams],
    queryFn: async () => {
      const response = await searchApi.searchResults(queryParams);
      return response;
    },
    enabled: !!queryParams && (!!queryParams.q || !!queryParams.type || !!queryParams.category),
    staleTime: 5 * 60 * 1000,
  });
};
