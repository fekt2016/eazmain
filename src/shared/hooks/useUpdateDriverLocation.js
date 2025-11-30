import { useMutation } from '@tanstack/react-query';
import api from '../services/api';

/**
 * Hook to update driver location
 * PATCH /api/v1/orders/:orderId/driver-location
 * Called by driver app every 10-20 seconds
 */
export const useUpdateDriverLocation = () => {
  return useMutation({
    mutationFn: async ({ orderId, lat, lng }) => {
      const response = await api.patch(`/order/${orderId}/driver-location`, {
        lat,
        lng,
      });
      return response.data;
    },
  });
};

