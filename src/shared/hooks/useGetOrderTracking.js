import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

/**
 * Hook to get order tracking information
 * GET /api/v1/orders/:orderId/tracking
 */
export const useGetOrderTracking = (orderId, options = {}) => {
  return useQuery({
    queryKey: ['order-tracking', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const response = await api.get(`/order/${orderId}/tracking`);
      return response.data.data.order;
    },
    enabled: !!orderId && (options.enabled !== false),
    refetchInterval: options.refetchInterval || false, // Set to 10000 for live updates (10 seconds)
    ...options,
  });
};

