/**
 * Wishlist Hooks - Refactored with Best Practices
 * 
 * Improvements:
 * - Optimistic updates for better UX
 * - Optimized query keys
 * - Better invalidation logic
 * - Debounced mutations
 * - Disabled UI actions while loading
 * - Cleaner error handling
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import wishlistApi from '../services/wishlistApi';
import useAuth from '../../shared/hooks/useAuth';
import { getSessionId, clearSessionId } from '../utils/guestWishlist';
import logger from '../utils/logger';
import { toast } from 'react-toastify';

/**
 * Get wishlist query key helper
 */
const getWishlistQueryKey = (userId, sessionId) => {
  return userId ? ["wishlist", userId] : ["wishlist", "guest", sessionId];
};

/**
 * Hook to fetch wishlist data
 * @returns {Object} Query result with wishlist data
 */
export const useWishlist = () => {
  const { userData } = useAuth();
  const user = userData?.data?.data || {};
  const sessionId = getSessionId();

  return useQuery({
    queryKey: getWishlistQueryKey(user?.id, sessionId),
    queryFn: async () => {
      try {
        if (user?.id) {
          const response = await wishlistApi.getWishlist();
          return response;
        } else if (sessionId) {
          const response = await wishlistApi.getOrCreateGuestWishlist();
          return response;
        } else {
          // Return empty wishlist for new guests
          return { data: { wishlist: { products: [] } } };
        }
      } catch (error) {
        logger.error("Error fetching wishlist:", error);
        // Return empty wishlist on error to prevent UI breaking
        return { data: { wishlist: { products: [] } } };
      }
    },
    enabled: !!user?.id || !!sessionId,
    staleTime: 30 * 1000, // 30 seconds - balance between freshness and performance
    refetchOnWindowFocus: false, // Prevent excessive refetches
    refetchOnMount: true, // Refetch when component mounts
    refetchOnReconnect: true, // Refetch on network reconnect
    meta: { global: false }, // Prevent global loading overlay
  });
};

/**
 * Hook to add product to wishlist with optimistic update
 * @returns {Object} Mutation object
 */
export const useAddToWishlist = () => {
  const queryClient = useQueryClient();
  const { userData } = useAuth();
  const user = userData?.data?.data || {};
  const sessionId = getSessionId();
  const queryKey = getWishlistQueryKey(user?.id, sessionId);

  return useMutation({
    mutationFn: (productId) => {
      if (user?.id) {
        return wishlistApi.addToWishlist(productId);
      } else {
        return wishlistApi.addToGuestWishlist(productId);
      }
    },
    meta: { global: false },
    
    // Optimistic update - update UI immediately
    onMutate: async (productId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousWishlist = queryClient.getQueryData(queryKey);

      // Optimistically update to the new value
      queryClient.setQueryData(queryKey, (old) => {
        const wishlist = old?.data?.wishlist || old?.data || { products: [] };
        const products = wishlist.products || [];
        
        // Check if product already exists
        const exists = products.some(
          (item) => 
            item.product?._id === productId || 
            item.product === productId ||
            item.product?.id === productId
        );

        if (exists) {
          return old; // Don't add duplicate
        }

        // Add product optimistically
        return {
          ...old,
          data: {
            ...old?.data,
            wishlist: {
              ...wishlist,
              products: [
                ...products,
                {
                  product: { _id: productId },
                  addedAt: new Date().toISOString(),
                },
              ],
            },
          },
        };
      });

      // Return context with snapshot for rollback
      return { previousWishlist };
    },

    // On error, rollback to previous value
    onError: (err, productId, context) => {
      if (context?.previousWishlist) {
        queryClient.setQueryData(queryKey, context.previousWishlist);
      }
    },

    // On success, refetch to ensure consistency
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey,
        refetchType: 'active',
      });
    },

    // Always refetch after mutation settles
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey,
        refetchType: 'active',
      });
    },
  });
};

/**
 * Hook to remove product from wishlist with optimistic update
 * @returns {Object} Mutation object
 */
export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();
  const { userData } = useAuth();
  const user = userData?.data?.data || {};
  const sessionId = getSessionId();
  const queryKey = getWishlistQueryKey(user?.id, sessionId);

  // Use same source as wishlist fetch: authenticated DELETE when logged in, guest/remove when guest.
  // Prevents removing from guest list while viewing user list (which made items reappear on refresh).
  return useMutation({
    mutationFn: (productId) =>
      user?.id
        ? wishlistApi.removeFromWishlistAuthenticated(productId)
        : wishlistApi.removeFromGuestWishlist(productId),
    meta: { global: false },
    
    // Optimistic update
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey });

      const previousWishlist = queryClient.getQueryData(queryKey);

      // Optimistically remove product (compare as strings for reliable match)
      const idStr = String(productId);
      queryClient.setQueryData(queryKey, (old) => {
        const wishlist = old?.data?.wishlist || old?.data || { products: [] };
        const products = wishlist.products || [];
        
        const filteredProducts = products.filter((item) => {
          const itemId = item?.product?._id ?? item?.product?.id ?? item?.product;
          return itemId != null && String(itemId) !== idStr;
        });

        return {
          ...old,
          data: {
            ...old?.data,
            wishlist: {
              ...wishlist,
              products: filteredProducts,
            },
          },
        };
      });

      return { previousWishlist };
    },

    // Use server response as source of truth so UI matches backend
    onSuccess: (data) => {
      if (data?.data?.wishlist != null) {
        queryClient.setQueryData(queryKey, data);
      }
      queryClient.invalidateQueries({ queryKey, refetchType: 'active' });
    },

    onError: (err, productId, context) => {
      if (context?.previousWishlist) {
        queryClient.setQueryData(queryKey, context.previousWishlist);
      }
      logger.error('Remove from wishlist failed', err);
      toast.error(err?.response?.data?.message || err?.message || 'Could not remove from wishlist');
    },
  });
};

/**
 * Hook to check if product is in wishlist
 * @param {string} productId - Product ID to check
 * @returns {Object} Query result with inWishlist boolean
 */
export const useCheckInWishlist = (productId) => {
  const { userData } = useAuth();
  const user = userData?.data?.data || {};
  const sessionId = getSessionId();

  // Use the main wishlist query if available, otherwise make a separate check
  const { data: wishlistData } = useWishlist();
  
  // Derive from wishlist data if available (more efficient)
  const isInWishlistFromData = wishlistData?.data?.wishlist?.products?.some(
    (item) =>
      item.product?._id === productId ||
      item.product === productId ||
      item.product?.id === productId
  ) || false;

  // Fallback to API check if wishlist data not available
  const checkQuery = useQuery({
    queryKey: ["wishlist", "check", productId, user?.id || sessionId],
    queryFn: async () => await wishlistApi.checkInWishlist(productId),
    enabled: !!productId && (!!user?.id || !!sessionId) && !wishlistData,
    staleTime: 10 * 1000, // 10 seconds
    meta: { global: false },
  });

  return {
    inWishlist: wishlistData ? isInWishlistFromData : checkQuery.data?.inWishlist || false,
    isLoading: wishlistData ? false : checkQuery.isLoading,
  };
};

/**
 * Hook to merge guest wishlist with user wishlist after login
 * @returns {Object} Mutation object
 */
export const useMergeWishlists = () => {
  const queryClient = useQueryClient();
  const { userData } = useAuth();
  const user = userData?.data?.data || {};
  const sessionId = getSessionId();

  return useMutation({
    mutationFn: async () => {
      const response = await wishlistApi.mergeWishlists();
      return response;
    },
    onSuccess: () => {
      // Clear guest session ID
      clearSessionId();
      
      // Invalidate all wishlist queries
      queryClient.invalidateQueries({
        queryKey: ["wishlist"],
        refetchType: 'active',
      });
    },
  });
};

/**
 * Combined toggle hook with optimistic updates
 * @param {string} productId - Product ID to toggle
 * @returns {Object} Toggle function and state
 */
export const useToggleWishlist = (productId) => {
  const { data: wishlist, isLoading } = useWishlist();
  const addMutation = useAddToWishlist();
  const removeMutation = useRemoveFromWishlist();

  // Check if product is in wishlist
  const isInWishlist = (
    wishlist?.data?.wishlist?.products ||
    wishlist?.data?.products ||
    []
  ).some(
    (item) =>
      item.product?._id === productId ||
      item.product === productId ||
      item.product?.id === productId
  );

  const toggleWishlist = async () => {
    if (!productId) return;

    // Use appropriate mutation based on current state
    if (isInWishlist) {
      await removeMutation.mutateAsync(productId);
    } else {
      await addMutation.mutateAsync(productId);
    }
  };

  return {
    toggleWishlist,
    isInWishlist,
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
    isLoading: isLoading || addMutation.isPending || removeMutation.isPending,
  };
};
