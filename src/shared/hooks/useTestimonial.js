import { useQuery } from '@tanstack/react-query';
import testimonialApi from '../services/testimonialApi';

export const usePublicTestimonials = (params = {}) => {
  return useQuery({
    queryKey: ['public-testimonials', params],
    queryFn: async () => {
      const response = await testimonialApi.getPublicTestimonials(params);
      return response?.data?.testimonials || [];
    },
    staleTime: 1000 * 60 * 10,
  });
};

