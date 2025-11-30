import { useQuery } from '@tanstack/react-query';
import neighborhoodService from '../services/neighborhoodApi';

/**
 * Hook to search neighborhoods (for autocomplete)
 * Used in checkout and address forms
 */
export const useSearchNeighborhoods = (query, city, enabled = true) => {
  return useQuery({
    queryKey: ['neighborhoods', 'search', query, city],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      const response = await neighborhoodService.searchNeighborhoods(query, city);
      return response?.data?.neighborhoods || response?.neighborhoods || [];
    },
    enabled: enabled && !!query && query.length >= 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to get neighborhoods by city
 */
export const useGetNeighborhoodsByCity = (city, enabled = true) => {
  return useQuery({
    queryKey: ['neighborhoods', 'city', city],
    queryFn: async () => {
      if (!city) return [];
      const response = await neighborhoodService.getNeighborhoodsByCity(city);
      return response?.data?.neighborhoods || response?.neighborhoods || [];
    },
    enabled: enabled && !!city,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

/**
 * Hook to get a single neighborhood by ID
 */
export const useGetNeighborhood = (id, enabled = true) => {
  return useQuery({
    queryKey: ['neighborhood', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await neighborhoodService.getNeighborhood(id);
      return response?.data?.neighborhood || response?.neighborhood || null;
    },
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

