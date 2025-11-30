import { useMutation, useQuery } from '@tanstack/react-query';
import shippingService from '../services/shippingApi';

/**
 * Hook to get active pickup centers
 * @param {String} city - City name (optional)
 * @returns {Object} Query object with pickup centers
 */
export const useGetPickupCenters = (city = null) => {
  return useQuery({
    queryKey: ['pickup-centers', city],
    queryFn: async () => {
      const response = await shippingService.getPickupCenters(city);
      // Handle different response structures
      if (response?.data?.pickupCenters) {
        return response.data.pickupCenters;
      }
      if (response?.data?.data?.pickupCenters) {
        return response.data.data.pickupCenters;
      }
      if (Array.isArray(response?.data)) {
        return response.data;
      }
      if (Array.isArray(response)) {
        return response;
      }
      return [];
    },
  });
};

/**
 * Hook to calculate shipping quote (legacy - for backward compatibility)
 * @returns {Object} Mutation object with calculateShippingQuote function
 * 
 * Usage:
 * const { mutate: calculateShipping } = useCalculateShippingQuote();
 * calculateShipping({
 *   buyerCity: 'ACCRA',
 *   items: [...],
 *   method: 'dispatch',
 *   pickupCenterId: null,
 *   deliverySpeed: 'standard'
 * });
 */
export const useCalculateShippingQuote = () => {
  return useMutation({
    mutationFn: ({ buyerCity, items, method, pickupCenterId, deliverySpeed }) => {
      return shippingService.calculateShippingQuote(buyerCity, items, method, pickupCenterId, deliverySpeed);
    },
  });
};

/**
 * Hook to calculate shipping fee based on neighborhood
 * @returns {Object} Mutation object with calcShipping function
 * 
 * Usage:
 * const { mutate: calcShipping } = useCalcShipping();
 * calcShipping({
 *   neighborhoodId: '...', // OR
 *   neighborhoodName: 'Nima', city: 'Accra', // OR
 *   weight: 2.5,
 *   shippingType: 'standard' | 'same_day' | 'express'
 * });
 */
export const useCalcShipping = () => {
  return useMutation({
    mutationFn: (data) => shippingService.calcShipping(data),
  });
};

/**
 * Hook to get shipping options for all types based on neighborhood
 * @param {Object} params - { neighborhoodId, neighborhoodName, city, weight, enabled }
 * @returns {Object} Query object with shipping options
 * 
 * Usage:
 * const { data, isLoading } = useGetShippingOptions({
 *   neighborhoodName: 'Nima',
 *   city: 'Accra',
 *   weight: 2.5,
 *   enabled: true
 * });
 */
export const useGetShippingOptions = (params) => {
  return useQuery({
    queryKey: ['shipping-options', params],
    queryFn: async () => {
      // Extract fragile from params and pass it to the API
      const { fragile, ...apiParams } = params;
      const response = await shippingService.getShippingOptions({
        ...apiParams,
        fragile: fragile || false,
      });
      // Backend returns: { status: 'success', data: { options, zone, neighborhood, distance } }
      // Return the data object directly
      return response?.data || response;
    },
    enabled: params?.enabled !== false && !!(params?.neighborhoodId || (params?.neighborhoodName && params?.city)) && !!params?.weight && params?.weight > 0,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
