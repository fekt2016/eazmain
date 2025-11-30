import { useMutation } from '@tanstack/react-query';
import api from '../services/api';

/**
 * Hook for full location resolution
 * Combines GPS → GhanaPostGPS Digital Address + Google Maps Reverse Geocoding
 * 
 * @returns {Object} Mutation object with resolveFullLocation function
 */
export function useFullLocation() {
  return useMutation({
    mutationFn: async ({ lat, lng }) => {
      const response = await api.post('/location/full-location', { lat, lng });
      return response.data.data;
    },
  });
}

