import { useMutation } from '@tanstack/react-query';
import api from '../services/api';

/**
 * Hook for getting location from GPS coordinates using Google Maps Reverse Geocoding
 * 
 * @returns {Object} Mutation object with gpsLocation function
 */
export function useGPSLocation() {
  return useMutation({
    mutationFn: async ({ lat, lng }) => {
      const res = await api.post('/location/from-gps', { lat, lng });
      return res.data.data;
    },
  });
}
