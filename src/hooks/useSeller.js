import { useQuery } from "@tanstack/react-query";
import sellerApi from "../service/sellerApi";

export const useGetSellerProfile = (sellerId) => {
  return useQuery({
    queryKey: ["seller", sellerId], // Unique key per seller
    queryFn: async () => {
      if (!sellerId) throw new Error("Seller ID is required");
      const data = await sellerApi.getSellerProfile(sellerId);

      return data;
    },
    enabled: !!sellerId, // Only run when sellerId exists
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error("Seller error:", error.message);
    },
  });
};
export const useGetSellerById = (sellerId) => {
  return useQuery({
    queryKey: ["seller", sellerId], // Include sellerId in queryKey for proper caching
    queryFn: async () => {
      if (!sellerId) {
        throw new Error("No sellerId provided");
      }

      try {
        const data = await sellerApi.getSellerById(sellerId);
        return data;
      } catch (error) {
        console.error("Error fetching seller:", error);
        throw new Error("Failed to fetch seller data");
      }
    },
    enabled: !!sellerId, // Only run query when sellerId exists
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    retry: 2, // Retry twice on failure
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error("Seller fetch error:", error.message);
    },
    onSettled: (data, error) => {
      if (error) {
        console.warn(`Error fetching seller ${sellerId}:`, error);
      } else {
        console.log(`Successfully fetched seller ${sellerId}`, data);
      }
    },
  });
};
// Create a new hook
export const useGetFeaturedSellers = (options = {}) => {
  const { limit = 8, minRating = 4.0 } = options;

  return useQuery({
    queryKey: ["featured-sellers", limit, minRating],
    queryFn: async () => {
      const sellers = await sellerApi.getFeaturedSellers(limit, minRating);
      return sellers;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false,
    onError: (error) => {
      console.error("Featured sellers error:", error.message);
    },
  });
};
