import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import followApi from '../../shared/services/followApi';
import useAuth from '../../shared/hooks/useAuth';
import { useMemo } from "react";
import logger from '../../shared/utils/logger';

export const useToggleFollow = (sellerId) => {
  const queryClient = useQueryClient();
  const { userData } = useAuth();
  const user = useMemo(() => {
    return userData?.user || userData?.data || null;
  }, [userData]);

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
    queryClient.setQueryData(["followed-sellers", user?.id], (oldData = []) => {
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
    onMutate: () => {
      const previousSeller =
        queryClient.getQueryData(["follower", sellerId]) || currentSeller;
      const previousFollowed =
        queryClient.getQueryData(["followed-sellers", user?.id]) || [];

      // Optimistically update UI
      updateCache(true);

      return { previousSeller, previousFollowed };
    },
    onError: (error, variables, context) => {
      logger.error("Follow error:", error);
      // Revert optimistic update
      if (context?.previousSeller) {
        queryClient.setQueryData(
          ["follower", sellerId],
          context.previousSeller
        );
      }
      if (context?.previousFollowed) {
        queryClient.setQueryData(
          ["followed-sellers", user?.id],
          context.previousFollowed
        );
      }
    },
    onSettled: () => {
      // Refetch to ensure data is fresh
      queryClient.invalidateQueries(["follower", sellerId]);
      queryClient.invalidateQueries(["followed-sellers", user?.id]);
    },
  });

  // Unfollow mutation
  const unfollow = useMutation({
    mutationFn: async () => {
      logger.log("Unfollowing seller:", sellerId);
      const response = await followApi.unfollowSeller(sellerId);
      return response;
    },
    onMutate: () => {
      const previousSeller =
        queryClient.getQueryData(["follower", sellerId]) || currentSeller;
      const previousFollowed =
        queryClient.getQueryData(["followed-sellers", user?.id]) || [];

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
          ["followed-sellers", user?.id],
          context.previousFollowed
        );
      }
    },
    onSettled: () => {
      // Refetch to ensure data is fresh
      queryClient.invalidateQueries(["follower", sellerId]);
      queryClient.invalidateQueries(["followed-sellers", user?.id]);
    },
  });

  // Toggle function
  const toggleFollow = () => {
    if (!user) {
      logger.log("User is not logged in");
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
    isLoading: follow.isPending || unfollow.isPending || sellerQuery.isLoading,
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
  });
};
export const useGetFollowedSellerByUser = () => {
  return useQuery({
    queryKey: ["followers"],
    queryFn: async () => {
      const response = await followApi.getFollowedShops();

      return response;
    },
    // onSuccess: (data) => {
    //   console.log("[API] Followed shops:", data);
    // },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
