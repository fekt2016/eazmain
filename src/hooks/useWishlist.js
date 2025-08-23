import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import wishlistApi from "../service/wishlistApi";
import useAuth from "../hooks/useAuth";
import { getSessionId, clearSessionId } from "../utils/guestWishlist";

export const useWishlist = () => {
  const { userData } = useAuth();

  const user = userData?.data?.data || {};

  const sessionId = getSessionId();

  return useQuery({
    queryKey: ["wishlist", user ? user.id : sessionId],
    queryFn: async () => {
      try {
        if (user) {
          const response = await wishlistApi.getWishlist();

          return response;
        } else if (sessionId) {
          const response = await wishlistApi.getOrCreateGuestWishlist();
          console.log("Guest Wishlist data:", response);
          return response;
        } else {
          // Create a new session and wishlist
          return { data: { wishlist: { products: [] } } };
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error);
        return { data: { wishlist: { products: [] } } };
      }
    },
    enabled: !!user || !!sessionId,
  });
};

export const useAddToWishlist = () => {
  const queryClient = useQueryClient();
  const { userData: user } = useAuth();

  return useMutation({
    mutationFn: (productId) => {
      if (user) {
        return wishlistApi.addToWishlist(productId);
      } else {
        return wishlistApi.addToGuestWishlist(productId);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch wishlist data
      queryClient.invalidateQueries(["wishlist"]);
    },
  });
};

export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId) => wishlistApi.removeFromWishlist(productId),
    onSuccess: () => {
      // Invalidate and refetch wishlist data
      queryClient.invalidateQueries(["wishlist"]);
    },
  });
};

export const useCheckInWishlist = (productId) => {
  const { user } = useAuth();
  const sessionId = getSessionId();

  return useQuery({
    queryKey: ["wishlist", "check", productId, user ? user.id : sessionId],
    queryFn: async () => await wishlistApi.checkInWishlist(productId),
    enabled: !!productId && (!!user || !!sessionId),
  });
};

export const useMergeWishlists = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await wishlistApi.mergeWishlists();
      return response;
    },
    onSuccess: () => {
      console.log("Wishlist merged successfully");
      // Clear guest session ID
      clearSessionId();
      // Invalidate and refetch wishlist data
      queryClient.invalidateQueries(["wishlist"]);
    },
  });
};

// Combined toggle hook that works for both guest and authenticated users
export const useToggleWishlist = (productId) => {
  // const queryClient = useQueryClient();
  const { data: wishlist } = useWishlist();
  console.log("useToggleWishlist wishlist:", wishlist);
  // const { userData } = useAuth();
  // console.log("useToggleWishlist userData:", userData);

  const addMutation = useAddToWishlist();
  const removeMutation = useRemoveFromWishlist();

  const isInWishlist = (
    wishlist?.data?.wishlist?.products ||
    wishlist?.data?.products ||
    []
  ).some(
    (item) => item.product._id === productId || item.product === productId
  );
  console.log("isInWishlist", isInWishlist);
  const toggleWishlist = async () => {
    // Check if product is in wishlist

    if (isInWishlist) {
      await removeMutation.mutateAsync(productId);
    } else {
      await addMutation.mutateAsync(productId);
    }
  };

  return {
    toggleWishlist,
    isInWishlist,
    isAdding: addMutation.isLoading,
    isRemoving: removeMutation.isLoading,
  };
};
