import { useMutation } from '@tanstack/react-query';
import { shippingRateService } from '../services/shippingRateApi';

/**
 * Hook for calculating shipping fees using the new ShippingRate system
 * POST /api/v1/shipping-rates/calculate
 * 
 * IMPORTANT: Origin is always the fixed warehouse location (backend handles this).
 * Only pass destination coordinates or destinationAddress.
 * Supports both distance-based (destination/destinationAddress) and zone-based (zone) calculation
 */
export const useShippingCalculator = () => {
  return useMutation({
    mutationFn: async ({ weight, shippingType, zone, destination, destinationAddress, type, distanceKm, fragile, orderTime }) => {
      const response = await shippingRateService.calculateFee({
        weight,
        shippingType,
        zone,
        destination, // { lat, lng } - customer destination coordinates
        destinationAddress, // Address string - will be geocoded by backend
        type: type || shippingType,
        distanceKm,
        fragile: fragile || false,
        orderTime: orderTime || new Date().toISOString(),
      });
      return response.data; // Returns { shippingFee, estimatedDays, baseFee, perKgFee, weight, shippingType, zone, distanceKm, breakdown }
    },
  });
};

