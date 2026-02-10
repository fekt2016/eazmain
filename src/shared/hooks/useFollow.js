import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import followApi from '../services/followApi';
import useAuth from '../../shared/hooks/useAuth';
import { useMemo } from "react";
import logger from '../utils/logger';

export const useToggleFollow = (sellerId) => {
  const queryClient = useQueryClient();
  const { userData } = useAuth();
  // useAuth returns userData = the user object directly (from getCurrentUser query)
  const user = useMemo(() => {
    if (!userData) return null;
    if (userData?.id || userData?._id) return userData;
    return userData?.user || userData?.data || null;
  }, [userData]);
  const userId = user?.id || user?._id;

  // NEW: Query to fetch seller follow status
  const sellerQuery = useQuery({
    queryKey: ["follower", sellerId],
    queryFn: async () => {
      try {
        return await followApi.getFollowStatus(sellerId);
      } catch (error) {
        if (error.response?.status === 401) {
          // Handle authentication errors
          logger.warn("Authentication required for follow status");
          return { isFollowing: false, followersCount: 0 };
        }
        throw error;
      }
    },
    enabled: !!sellerId && !!user, // Only fetch when authenticated
  });

  const currentSeller = sellerQuery?.data || {};
  // console.log("currentSeller", currentSeller);
  const isFollowing = currentSeller?.isFollowing || false;

  // Cache update logic
  const updateCache = (isFollowing) => {
    // Update seller profile
    queryClient.setQueryData(["follower", sellerId], (oldData) => {
      const current = oldData || {};

      return {
        ...current,
        isFollowing,
        followersCount: isFollowing
          ? (current.followersCount || 0) + 1
          : Math.max((current.followersCount || 0) - 1, 0),
      };
    });

    // Update followed sellers list
    queryClient.setQueryData(["followed-sellers", userId], (oldData = []) => {
      if (isFollowing) {
        return [...oldData, { _id: sellerId }];
      }
      return oldData.filter((seller) => seller._id !== sellerId);
    });
  };

  // Follow mutation
  const follow = useMutation({
    mutationFn: async () => {
      const response = await followApi.followSeller(sellerId);
      return response;
    },
    meta: { global: false },
    onMutate: () => {
      const previousSeller =
        queryClient.getQueryData(["follower", sellerId]) || currentSeller;
      const previousFollowed =
        queryClient.getQueryData(["followed-sellers", userId]) || [];

      // Optimistically update UI
      updateCache(true);

      return { previousSeller, previousFollowed };
    },
    onError: (error, variables, context) => {
      logger.error("Follow error:", error);
      toast.error(error?.response?.data?.message || "Failed to follow. Please try again.");
      // Revert optimistic update
      if (context?.previousSeller) {
        queryClient.setQueryData(
          ["follower", sellerId],
          context.previousSeller
        );
      }
      if (context?.previousFollowed) {
        queryClient.setQueryData(
          ["followed-sellers", userId],
          context.previousFollowed
        );
      }
    },
    onSuccess: () => {
      toast.success("Following shop");
    },
    onSettled: () => {
      queryClient.invalidateQueries(["follower", sellerId]);
      queryClient.invalidateQueries(["followed-sellers", userId]);
      queryClient.invalidateQueries(["followers", sellerId]);
    },
  });

  // Unfollow mutation
  const unfollow = useMutation({
    mutationFn: async () => {
      logger.log("Unfollowing seller:", sellerId);
      const response = await followApi.unfollowSeller(sellerId);
      return response;
    },
    meta: { global: false },
    onMutate: () => {
      const previousSeller =
        queryClient.getQueryData(["follower", sellerId]) || currentSeller;
      const previousFollowed =
        queryClient.getQueryData(["followed-sellers", userId]) || [];

      // Optimistically update UI
      updateCache(false);

      return { previousSeller, previousFollowed };
    },
    onError: (error, variables, context) => {
      logger.error("Unfollow error:", error);
      // Revert optimistic update
      if (context?.previousSeller) {
        queryClient.setQueryData(
          ["follower", sellerId],
          context.previousSeller
        );
      }
      if (context?.previousFollowed) {
        queryClient.setQueryData(
          ["followed-sellers", userId],
          context.previousFollowed
        );
      }
    },
    onSettled: () => {
      // Refetch to ensure data is fresh
      queryClient.invalidateQueries(["follower", sellerId]);
      queryClient.invalidateQueries(["followed-sellers", userId]);
    },
  });

  // Toggle function
  const toggleFollow = () => {
    if (!user) {
      toast.info("Please log in to follow this shop", { autoClose: 4000 });
      return;
    }

    if (isFollowing) {
      unfollow.mutate();
    } else {
      follow.mutate();
    }
  };

  return {
    toggleFollow,
    isFollowing,
    isLoading: follow.isPending || unfollow.isPending,
    isError: follow.isError || unfollow.isError || sellerQuery.isError,
    error: follow.error || unfollow.error || sellerQuery.error,
  };
};
export const useGetSellersFollowers = (sellerId) => {
  return useQuery({
    queryKey: ["followers", sellerId],
    queryFn: async () => {
      const response = await followApi.getSellerFollowers(sellerId);
      return response;
    },
    enabled: !!sellerId,
    retry: (failureCount, error) => (error?.code !== 'ERR_NETWORK' && failureCount < 2),
  });
};
export const useGetFollowedSellerByUser = () => {
  return useQuery({
    queryKey: ["followers"],
    queryFn: async () => {
      const response = await followApi.getFollowedShops();

      return response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Products from sellers the current user follows. For homepage "From sellers you follow" section.
 * Only runs when user is logged in. Returns { data, products, total, isLoading }.
 */
export const useFollowedSellerProducts = (limit = 12) => {
  const { userData } = useAuth();
  const user = useMemo(() => {
    if (!userData) return null;
    if (userData?.id || userData?._id) return userData;
    return userData?.user || userData?.data || null;
  }, [userData]);

  const query = useQuery({
    queryKey: ["followed-seller-products", limit],
    queryFn: () => followApi.getFollowedSellerProducts(limit),
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
  });

  const products = useMemo(() => {
    const raw = query.data?.data?.data ?? query.data?.data ?? query.data;
    return Array.isArray(raw) ? raw : [];
  }, [query.data]);

  return {
    ...query,
    products,
    total: query.data?.total ?? 0,
  };
};
