import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import recommendationService from '../services/recommendationApi';
import useAuth from './useAuth';

/**
 * Hook to get related products based on similarity
 */
export const useRelatedProducts = (productId, limit = 10) => {
  return useQuery({
    queryKey: ['recommendations', 'related', productId, limit],
    queryFn: async () => {
      if (!productId) return { data: { products: [] } };
      const response = await recommendationService.getRelatedProducts(productId, limit);
      return response;
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: 2,
  });
};

/**
 * Hook to get products that customers also bought
 */
export const useAlsoBought = (productId, limit = 10) => {
  return useQuery({
    queryKey: ['recommendations', 'also-bought', productId, limit],
    queryFn: async () => {
      if (!productId) return { data: { products: [] } };
      const response = await recommendationService.getAlsoBought(productId, limit);
      return response;
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 15, // 15 minutes
    retry: 2,
  });
};

/**
 * Hook to get AI-powered semantically similar products
 */
export const useAISimilar = (productId, limit = 10) => {
  return useQuery({
    queryKey: ['recommendations', 'ai-similar', productId, limit],
    queryFn: async () => {
      if (!productId) return { data: { products: [] } };
      const response = await recommendationService.getAISimilar(productId, limit);
      return response;
    },
    enabled: !!productId,
    staleTime: 1000 * 60 * 30, // 30 minutes (AI results change less frequently)
    retry: 2,
  });
};

/**
 * Hook to get personalized recommendations for a user
 */
export const usePersonalized = (userId, limit = 10) => {
  const { userData } = useAuth();
  const effectiveUserId = userId || userData?._id || userData?.id;

  return useQuery({
    queryKey: ['recommendations', 'personalized', effectiveUserId, limit],
    queryFn: async () => {
      if (!effectiveUserId) return { data: { products: [] } };
      const response = await recommendationService.getPersonalized(effectiveUserId, limit);
      return response;
    },
    enabled: !!effectiveUserId,
    staleTime: 1000 * 60 * 5, // 5 minutes (personalized changes more frequently)
    retry: 2,
  });
};

/**
 * Hook to get recently viewed products
 */
export const useRecentlyViewed = (userId, limit = 10) => {
  const { userData } = useAuth();
  const effectiveUserId = userId || userData?._id || userData?.id;

  return useQuery({
    queryKey: ['recommendations', 'recently-viewed', effectiveUserId, limit],
    queryFn: async () => {
      if (!effectiveUserId) return { data: { products: [] } };
      const response = await recommendationService.getRecentlyViewed(effectiveUserId, limit);
      return response;
    },
    enabled: !!effectiveUserId,
    staleTime: 1000 * 60 * 2, // 2 minutes (recently viewed changes frequently)
    retry: 2,
  });
};

/**
 * Hook to get trending products
 */
export const useTrending = (limit = 10) => {
  return useQuery({
    queryKey: ['recommendations', 'trending', limit],
    queryFn: async () => {
      const response = await recommendationService.getTrending(limit);
      return response;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: 2,
  });
};

/**
 * Hook to track user activity
 */
export const useTrackActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productId, action, metadata = {} }) => {
      return await recommendationService.trackActivity(productId, action, metadata);
    },
    onSuccess: () => {
      // Invalidate personalized recommendations after tracking
      queryClient.invalidateQueries({ queryKey: ['recommendations', 'personalized'] });
      queryClient.invalidateQueries({ queryKey: ['recommendations', 'recently-viewed'] });
    },
  });
};

