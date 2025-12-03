import { useQuery } from '@tanstack/react-query';
import { shippingRateService } from '../services/shippingRateApi';
import { calculateCartWeight } from '../utils/calculateCartWeight';
import { detectZone } from '../utils/zoneDetection';
import { WAREHOUSE_LOCATION } from '../config/warehouseConfig';
import logger from '../utils/logger';

/**
 * Hook to get shipping options using the new ShippingRate system
 * Supports both distance-based (origin/destination) and zone-based calculation
 * @param {Object} params
 * @param {String} params.city - Buyer's city
 * @param {String} params.region - Buyer's region (optional, for zone detection)
 * @param {Number} params.weight - Total weight in kg (optional, will calculate from items if not provided)
 * @param {Array} params.items - Cart items (optional, for weight calculation)
 * @param {Object} params.destination - Destination coordinates { lat, lng } (optional, for distance-based calculation)
 * @param {String} params.destinationAddress - Destination address string (optional, will be geocoded by backend)
 * @param {Number} params.distanceKm - Distance in km (optional, if provided, skips distance calculation)
 * @param {Boolean} params.fragile - Whether item is fragile (default: false)
 * @param {Boolean} params.enabled - Whether to enable the query
 * @returns {Object} Query object with shipping options
 * 
 * NOTE: Origin is always the fixed warehouse location - backend handles this automatically.
 * Only pass destination coordinates or destinationAddress.
 */
export const useShippingRateOptions = ({ 
  city, 
  region, 
  weight, 
  items, 
  destination,
  destinationAddress,
  distanceKm,
  fragile = false,
  enabled = true 
}) => {
  return useQuery({
    queryKey: ['shipping-rate-options', city, region, weight, items, destination, destinationAddress, distanceKm, fragile],
    queryFn: async () => {
      // Calculate weight if not provided
      let totalWeight = weight;
      if (!totalWeight && items && items.length > 0) {
        totalWeight = calculateCartWeight(items);
      }
      if (!totalWeight || totalWeight <= 0) {
        totalWeight = 0.5; // Default minimum weight
      }

      // Use distance-based calculation if destination coordinates or address are available
      // IMPORTANT: Origin is always the fixed warehouse - backend handles this automatically
      const useDistanceBased = !!(destination?.lat && destination?.lng) || !!destinationAddress || distanceKm !== undefined;
      
      // Detect zone - will be calculated by backend if using distance-based
      let zone = null;
      if (!useDistanceBased) {
        zone = detectZone(region || city, city);
      }

      // Calculate fees for both shipping types
      // NOTE: Do NOT pass origin - backend always uses fixed warehouse location
      const [standardResult, sameDayResult] = await Promise.allSettled([
        shippingRateService.calculateFee(
          useDistanceBased
            ? {
                weight: totalWeight,
                type: 'standard',
                destination, // Customer destination coordinates
                destinationAddress, // Customer address string (for geocoding if coordinates not available)
                distanceKm,
                fragile,
                orderTime: new Date().toISOString(),
              }
            : {
                weight: totalWeight,
                shippingType: 'standard',
                zone,
                fragile,
                orderTime: new Date().toISOString(),
              }
        ),
        shippingRateService.calculateFee(
          useDistanceBased
            ? {
                weight: totalWeight,
                type: 'same_day',
                destination, // Customer destination coordinates
                destinationAddress, // Customer address string (for geocoding if coordinates not available)
                distanceKm,
                fragile,
                orderTime: new Date().toISOString(),
              }
            : {
                weight: totalWeight,
                shippingType: 'same_day',
                zone,
                fragile,
                orderTime: new Date().toISOString(),
              }
        ),
      ]);

      const options = [];

      // Standard delivery option
      if (standardResult.status === 'fulfilled') {
        // Backend returns: { status: 'success', data: { shippingFee, estimatedDays, ... } }
        const response = standardResult.value;
        const data = response?.data || response;
        options.push({
          type: 'standard',
          fee: data?.shippingFee || 0,
          estimate: data?.estimatedDays || '1-3 days',
          available: true,
          baseFee: data?.baseFee,
          perKgFee: data?.perKgFee,
        });
      } else {
        logger.error('Standard shipping calculation failed:', standardResult.reason);
      }

      // Same-day delivery option
      if (sameDayResult.status === 'fulfilled') {
        // Backend returns: { status: 'success', data: { shippingFee, estimatedDays, ... } }
        const response = sameDayResult.value;
        const data = response?.data || response;
        options.push({
          type: 'same_day',
          fee: data?.shippingFee || 0,
          estimate: data?.estimatedDays || 'Arrives Today',
          available: true,
          baseFee: data?.baseFee,
          perKgFee: data?.perKgFee,
          breakdown: data?.breakdown,
        });
      } else {
        // Same-day might not be available (e.g., after cutoff time or no rate found)
        const errorMessage = sameDayResult.reason?.response?.data?.message || 
                            sameDayResult.reason?.message || 
                            'Same-day delivery unavailable';
        options.push({
          type: 'same_day',
          fee: 0,
          estimate: 'Unavailable',
          available: false,
          error: errorMessage,
        });
      }

      // Extract zone and distance from successful result if available
      const successfulResult = standardResult.status === 'fulfilled' ? standardResult.value : sameDayResult.value;
      const resultData = successfulResult?.data || successfulResult;
      const finalZone = resultData?.zone || zone;
      const finalDistanceKm = resultData?.distanceKm;

      return {
        options,
        weight: totalWeight,
        zone: finalZone,
        distanceKm: finalDistanceKm,
        city,
      };
    },
    enabled: enabled && !!city && (!!weight || !!items),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

