/**
 * Hook for validating cart and getting backend-calculated totals
 * SECURITY: All price calculations must be done on backend
 */
import { useMutation } from '@tanstack/react-query';
import { orderService } from '../services/orderApi';
import logger from '../utils/logger';

export const useValidateCart = () => {
  return useMutation({
    mutationFn: async (cartData) => {
      try {
        // SECURITY: Send cart items to backend for validation
        // Backend will:
        // 1. Fetch actual prices from database
        // 2. Validate quantities against stock
        // 3. Calculate discounts from backend
        // 4. Calculate shipping costs
        // 5. Calculate final totals
        const response = await orderService.validateCart(cartData);
        return response;
      } catch (error) {
        logger.error("[useValidateCart] Cart validation error:", error);
        throw error;
      }
    },
  });
};

