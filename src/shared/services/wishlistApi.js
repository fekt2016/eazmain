import api from './api';
import logger from '../utils/logger';
import { getSessionId, generateSessionId } from '../utils/guestWishlist';

// Check if user is authenticated
const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token;
};

const wishlistApi = {
  // Get wishlist (works for both authenticated and guest users)
  getWishlist: async () => {
    if (isAuthenticated()) {
      // Authenticated user - use the standard endpoint
      const response = await api.get("/wishlist");
      return response.data;
    } else {
      // Guest user - use guest endpoint with session ID
      let sessionId = getSessionId();
      if (!sessionId) {
        sessionId = generateSessionId();
      }

      const response = await api.post("/wishlist/guest", { sessionId });
      return response.data;
    }
  },

  // Add to wishlist (works for both authenticated and guest users)
  addToWishlist: async (productId) => {
    logger.log("Adding to wishlist for productId:", productId);

    if (isAuthenticated()) {
      // Authenticated user - use the standard endpoint
      const response = await api.post("/wishlist", { productId });
      return response.data;
    } else {
      // Guest user - use guest endpoint with session ID
      let sessionId = getSessionId();
      if (!sessionId) {
        sessionId = generateSessionId();
      }

      const response = await api.post("/wishlist/guest/add", {
        sessionId,
        productId,
      });
      return response.data;
    }
  },

  // Remove from wishlist (works for both authenticated and guest users)
  removeFromWishlist: async (productId) => {
    if (isAuthenticated()) {
      // Authenticated user - use the standard endpoint
      const response = await api.delete(`/wishlist/${productId}`);
      return response.data;
    } else {
      // Guest user - use guest endpoint with session ID
      let sessionId = getSessionId();
      if (!sessionId) {
        throw new Error("No session found for guest user");
      }

      // Note: You'll need to create a guest remove endpoint on your backend
      const response = await api.post("/wishlist/guest/remove", {
        sessionId,
        productId,
      });
      return response.data;
    }
  },

  // Sync guest wishlist to user account after login
  mergeWishlists: async () => {
    logger.log("Merging guest wishlist to user account");
    if (!isAuthenticated()) {
      throw new Error("User must be authenticated to sync wishlist");
    }

    const sessionId = getSessionId();
    if (!sessionId) {
      throw new Error("No guest wishlist to sync");
    }

    const response = await api.post("/wishlist/merge", { sessionId });
    return response;
  },

  // Toggle product in wishlist (add if not present, remove if present)
  toggleWishlist: async (productId) => {
    if (isAuthenticated()) {
      // Authenticated user - use the toggle endpoint
      const response = await api.post(`/wishlist/toggle/${productId}`);
      return response.data;
    } else {
      // Guest user - check if in wishlist first, then add or remove
      let sessionId = getSessionId();
      if (!sessionId) {
        sessionId = generateSessionId();
      }

      // Check if product is in wishlist
      try {
        const checkResponse = await api.post("/wishlist/guest", { sessionId });
        const wishlist = checkResponse.data?.data?.wishlist;
        const inWishlist = wishlist?.products?.some(
          (item) => item.product._id === productId || item.product === productId
        );

        if (inWishlist) {
          // Remove from wishlist
          return await wishlistApi.removeFromGuestWishlist(productId);
        } else {
          // Add to wishlist
          return await wishlistApi.addToGuestWishlist(productId);
        }
      } catch (error) {
        // If check fails, try to add
        return await wishlistApi.addToGuestWishlist(productId);
      }
    }
  },

  // Check if a product is in the wishlist
  checkInWishlist: async (productId) => {
    if (isAuthenticated()) {
      // Authenticated user - use the standard endpoint
      const response = await api.get(`/wishlist/check/${productId}`);
      return response.data;
    } else {
      // Guest user - we need to get the wishlist and check locally
      let sessionId = getSessionId();
      if (!sessionId) {
        return { inWishlist: false };
      }

      try {
        const response = await api.post("/wishlist/guest", { sessionId });
        const wishlist = response.data.wishlist;
        const inWishlist = wishlist.products.some(
          (item) => item.product._id === productId || item.product === productId
        );

        return { inWishlist };
      } catch (error) {
        logger.error("Error checking wishlist:", error);
        return { inWishlist: false };
      }
    }
  },
  getOrCreateGuestWishlist: async () => {
    let sessionId = getSessionId();
    if (!sessionId) {
      return { data: { wishlist: { products: [] } } };
    }

    const response = await api.post("/wishlist/guest", { sessionId });
    return response.data;
  },
  addToGuestWishlist: async (productId) => {
    let sessionId = getSessionId();
    if (!sessionId) {
      sessionId = generateSessionId();
    }

    const response = await api.post("/wishlist/guest/add", {
      sessionId,
      productId,
    });
    return response.data;
  },
  removeFromGuestWishlist: async (productId) => {
    let sessionId = getSessionId();
    if (!sessionId) {
      throw new Error("No session found for guest user");
    }

    const response = await api.post("/wishlist/guest/remove", {
      sessionId,
      productId,
    });
    return response.data;
  },
};

export default wishlistApi;
