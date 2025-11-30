import { useMutation } from '@tanstack/react-query';
import api from '../services/api';

/**
 * Hook for Google Maps Reverse Geocoding
 * Converts GPS coordinates to physical address using Google Maps API
 */
export function useGoogleReverseGeocode() {
  const mutation = useMutation({
    mutationFn: async ({ lat, lng }) => {
      const response = await api.post('/location/reverse-geocode', { lat, lng });
      return response.data.data;
    },
  });

  return {
    reverseGeocode: mutation.mutate,
    reverseGeocodeAsync: mutation.mutateAsync,
    data: mutation.data,
    isLoading: mutation.isPending,
    error: mutation.error,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  };
}

