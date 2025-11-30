import { useMutation } from '@tanstack/react-query';
import api from '../services/api';

/**
 * Hook for hybrid address lookup
 * Supports both Ghana Digital Address and GPS coordinates
 * 
 * @returns {Object} Mutation object with lookupAddress function
 */
export function useLookupAddress() {
  return useMutation({
    mutationFn: async (payload) => {
      const response = await api.post('/location/lookup', payload);
      return response.data.data;
    },
  });
}

