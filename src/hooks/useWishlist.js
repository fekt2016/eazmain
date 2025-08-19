import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { wishlistApi } from "../service/wishlistApi";
import useAuth from "../hooks/useAuth";

// Helper to get fresh wishlist from localStorage
const getGuestWishlist = () => {
  const data = localStorage.getItem("guestWishlist");
  return data ? JSON.parse(data) : [];
};
const setGuestWishlist = (wishlist) => {
  localStorage.setItem("guestWishlist", JSON.stringify(wishlist));
};
const formatGuestWishlist = (wishlist) => ({
  data: { products: wishlist.map((id) => ({ _id: id })) },
});

export const useWishlist = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      if (!isAuthenticated) return formatGuestWishlist(getGuestWishlist());
      try {
        return await wishlistApi.getWishlist();
      } catch (error) {
        console.error("Failed to fetch wishlist:", error);
        throw error;
      }
    },

    staleTime: 300000,
    retry: 2,
  });
};
// Hook for guest wishlist actions
export const useGuestWishlistActions = () => {
  const queryClient = useQueryClient();

  const add = (productId) => {
    const current = getGuestWishlist();
    if (current.includes(productId)) return;

    const newWishlist = [...current, productId];
    setGuestWishlist(newWishlist);
    queryClient.setQueryData(["wishlist"], formatGuestWishlist(newWishlist));
  };

  const remove = (productId) => {
    const current = getGuestWishlist();
    if (!current.includes(productId)) return;

    const newWishlist = current.filter((id) => id !== productId);
    setGuestWishlist(newWishlist);
    queryClient.setQueryData(["wishlist"], formatGuestWishlist(newWishlist));
  };

  return { add, remove };
};
// Hook for authenticated wishlist actions
export const useAuthenticatedWishlistActions = () => {
  const queryClient = useQueryClient();
  const { logout } = useAuth();

  const addMutation = useMutation({
    mutationFn: wishlistApi.addToWishlist,
    onSuccess: () => {
      queryClient.invalidateQueries(["wishlist"]);
    },
    onError: (error) => {
      if (error.response?.status === 401) logout();
    },
  });

  const removeMutation = useMutation({
    mutationFn: wishlistApi.removeFromWishlist,
    onSuccess: () => {
      queryClient.invalidateQueries(["wishlist"]);
    },
    onError: (error) => {
      if (error.response?.status === 401) logout();
    },
  });

  return {
    add: addMutation.mutate,
    remove: removeMutation.mutate,
    isAdding: addMutation.isLoading,
    isRemoving: removeMutation.isLoading,
  };
};

// Hook to sync guest wishlist to server
export const useSyncWishlist = () => {
  console.log("Syncing wishlist");
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const { clear } = useClearWishlist();
  const guestWishlist = localStorage.getItem("guestWishlist");
  console.log("GuestWishlist sync", guestWishlist);
  const syncMutation = useMutation({
    mutationFn: wishlistApi.syncWishlist(guestWishlist),
    onSuccess: () => {
      clear();
      queryClient.invalidateQueries(["wishlist"]);
    },
    onError: (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    },
  });

  const sync = () => {
    if (!isAuthenticated) return;

    const guestWishlist = getGuestWishlist();
    if (guestWishlist.length > 0) {
      syncMutation.mutate(guestWishlist);
    }
  };

  return {
    sync,
    isSyncing: syncMutation.isLoading,
  };
};
export const useClearWishlist = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  // The actual clear function
  const clear = () => {
    console.log("clearing wishlist");
    if (!isAuthenticated) {
      // Clear guest wishlist
      console.log(localStorage.getItem("guestWishlist"));
      localStorage.removeItem("guestWishlist");
      console.log(localStorage.getItem("guestWishlist"));
      // Update cache to empty guest wishlist
      queryClient.setQueryData(["wishlist"], formatGuestWishlist([]));
    } else {
      // For authenticated users: clear cache
      queryClient.setQueryData(["wishlist"], {
        data: { products: [] },
      });
    }
  };

  // Return a mutation-like object
  return {
    mutate: clear,
    isLoading: false, // Since it's synchronous
    isError: false,
  };
};
