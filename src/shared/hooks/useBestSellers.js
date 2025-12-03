import { useQuery } from "@tanstack/react-query";
import sellerApi from "../services/sellerApi";
import { useMemo } from "react";
import logger from "../utils/logger";

/**
 * Hook to fetch best sellers (sellers with most orders)
 * Fetches sellers sorted by order count
 */
export const useGetBestSellers = (options = {}) => {
  const { sort = "orders", page = 1, limit = 20 } = options;

  // Map frontend sort values to backend sort values
  const backendSort = sort === 'best-seller' ? 'orders' : sort === 'top-rated' ? 'rating' : sort;

  // Get best sellers (sellers with most orders)
  const { data: sellersData, isLoading, error } = useQuery({
    queryKey: ["best-sellers", backendSort, page, limit],
    queryFn: async () => {
      return await sellerApi.getBestSellers({ page, limit, sort: backendSort });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    refetchOnWindowFocus: false,
  });

  // Process sellers data
  const bestSellers = useMemo(() => {
    if (!sellersData) {
      return {
        sellers: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    // Handle different response structures
    // Backend returns: { status: 'success', data: { sellers: [...], total, page, limit, totalPages } }
    // sellerApi returns: response.data which is { status: 'success', data: { sellers: [...], ... } }
    const responseData = sellersData?.data || sellersData;
    const sellers = responseData?.sellers || responseData?.results || [];

    // Backend already sorts, but we can re-sort if needed
    let sortedSellers = [...sellers];
    if (sort === "orders" || sort === "best-seller") {
      sortedSellers.sort((a, b) => {
        const aOrders = a.totalOrders || a.orderCount || a.ordersCount || 0;
        const bOrders = b.totalOrders || b.orderCount || b.ordersCount || 0;
        return bOrders - aOrders;
      });
    } else if (sort === "rating" || sort === "top-rated") {
      sortedSellers.sort((a, b) => {
        const aRating = a.rating || a.averageRating || 0;
        const bRating = b.rating || b.averageRating || 0;
        return bRating - aRating;
      });
    }

    return {
      sellers: sortedSellers,
      total: responseData?.total || sortedSellers.length,
      page: responseData?.page || page,
      limit: responseData?.limit || limit,
      totalPages: responseData?.totalPages || Math.ceil((responseData?.total || sortedSellers.length) / limit),
    };
  }, [sellersData, sort, page, limit]);

  return {
    data: bestSellers,
    isLoading,
    error,
  };
};

export default useGetBestSellers;
