import { useQuery } from '@tanstack/react-query';
import { officialStoreService } from '../services/officialStoreApi';
import logger from '../utils/logger';

/**
 * Hook for EazShop / Official Store product data.
 * useEazShop() returns { useGetEazShopProducts }.
 * useGetEazShopProducts() is a hook that returns { data, isLoading, error }.
 */
export const useEazShop = () => {
  const useGetEazShopProducts = () =>
    useQuery({
      queryKey: ['eazshop', 'products'],
      queryFn: async () => {
        try {
          return await officialStoreService.getOfficialStoreProducts();
        } catch (error) {
          logger.error('Failed to fetch EazShop products:', error);
          throw error;
        }
      },
      staleTime: 1000 * 60 * 5,
      retry: 2,
    });

  return { useGetEazShopProducts };
};

export default useEazShop;
