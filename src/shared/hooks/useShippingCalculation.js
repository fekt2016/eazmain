import { useMutation, useQuery } from '@tanstack/react-query';
import shippingCalculationService from '../services/shippingCalculationApi';

/**
 * Hook to calculate shipping fee
 * @returns {Object} Mutation object with calculateShipping function
 */
export const useCalculateShipping = () => {
  return useMutation({
    mutationFn: async ({ weight, shippingType, zone, orderTime, items, buyerCity }) => {
      const response = await shippingCalculationService.calculateShipping({
        weight,
        shippingType,
        zone,
        orderTime,
        items,
        buyerCity,
      });
      return response.data;
    },
  });
};

/**
 * Hook to get shipping options (both same-day and standard)
 * @param {Object} params - Query parameters
 * @param {String} params.city - Buyer's city
 * @param {Number} params.weight - Total weight in kg
 * @param {Array} params.items - Cart items
 * @param {Boolean} params.enabled - Whether to enable the query
 * @returns {Object} Query object with shipping options
 */
export const useShippingOptions = ({ city, weight, items, enabled = true }) => {
  return useQuery({
    queryKey: ['shipping-options', city, weight, items],
    queryFn: async () => {
      const response = await shippingCalculationService.getShippingOptions({
        city,
        weight,
        items,
      });
      return response.data;
    },
    enabled: enabled && !!city && (!!weight || !!items),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

