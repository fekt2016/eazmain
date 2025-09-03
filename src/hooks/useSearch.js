import { useQuery } from "@tanstack/react-query";
import searchApi from "../service/seachApi";

export const useSearchProducts = (searchTerm) => {
  return useQuery({
    queryKey: ["searchProducts", searchTerm],
    queryFn: async () => {
      if (!searchTerm) return { results: [] };
      const response = await searchApi.searchProducts(searchTerm);
      return response.data;
    },
    enabled: !!searchTerm, // Only run query when searchTerm is not empty
    staleTime: 5 * 60 * 1000, // Cache results for 5 minutes
  });
};
