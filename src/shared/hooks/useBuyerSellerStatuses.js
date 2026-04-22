import { useQuery } from '@tanstack/react-query';
import buyerStatusApi from '../services/buyerStatusApi';

/**
 * @param {string|null|undefined} sellerId
 * @param {{ enabled?: boolean }} [options]
 */
export function useBuyerSellerStatuses(sellerId, options = {}) {
  const { enabled = true } = options;
  return useQuery({
    queryKey: ['buyer-seller-statuses', sellerId],
    queryFn: () => buyerStatusApi.getBuyerStatusesBySeller(sellerId),
    enabled: Boolean(sellerId) && enabled,
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
