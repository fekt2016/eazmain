import { useQuery } from "@tanstack/react-query";
import searchApi from "../service/seachApi";

export const useSearchProducts = (searchTerm) => {
  return useQuery({
    queryKey: ["searchProducts", searchTerm],
    queryFn: async () => {
      if (!searchTerm) return { results: [] };
      const response = await searchApi.searchProducts(searchTerm);
      console.log("response", response);
      return response;
    },
    enabled: !!searchTerm, // Only run query when searchTerm is not empty
    staleTime: 5 * 60 * 1000, // Cache results for 5 minutes
  });
};

export const useSearchResults = (queryParams) => {
  return useQuery({
    queryKey: ["searchResults", queryParams],
    queryFn: async () => {
      const response = await searchApi.searchResults(queryParams);
      return response;
    },
    enabled: !!queryParams, // only run if something exists
    staleTime: 5 * 60 * 1000,
  });
};
