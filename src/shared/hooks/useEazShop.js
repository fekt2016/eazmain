import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eazshopService } from '../services/eazshopApi';
import logger from '../utils/logger';

export const useEazShop = () => {
  const queryClient = useQueryClient();

  // Get EazShop products
  const useGetEazShopProducts = () =>
    useQuery({
      queryKey: ['eazshop', 'products'],
      queryFn: async () => {
        try {
          const response = await eazshopService.getEazShopProducts();
          // CRITICAL: Additional client-side filter to ensure deleted products are excluded
          const products = response.data?.products || [];
          return products.filter(product => {
            // Exclude deleted products
            if (product.isDeleted === true || 
                product.isDeletedByAdmin === true || 
                product.isDeletedBySeller === true ||
                product.status === 'archived') {
              return false;
            }
            return true;
          });
        } catch (error) {
          logger.error('Failed to fetch EazShop products:', error);
          throw new Error('Failed to load Saiisai products');
        }
      },
      staleTime: 1000 * 30, // Reduced to 30 seconds for faster updates after deletion
      cacheTime: 1000 * 60 * 2, // Keep in cache for 2 minutes
      refetchOnWindowFocus: true, // Refetch when window regains focus
      retry: 2,
    });

  // Get pickup centers
  const useGetPickupCenters = (city) =>
    useQuery({
      queryKey: ['eazshop', 'pickup-centers', city],
      queryFn: async () => {
        try {
          const response = await eazshopService.getPickupCenters(city);
          return response.data?.pickupCenters || [];
        } catch (error) {
          logger.error('Failed to fetch pickup centers:', error);
          throw new Error('Failed to load pickup centers');
        }
      },
      enabled: !!city,
      staleTime: 1000 * 60 * 10, // 10 minutes
      retry: 2,
    });

  return {
    useGetEazShopProducts,
    useGetPickupCenters,
  };
};

