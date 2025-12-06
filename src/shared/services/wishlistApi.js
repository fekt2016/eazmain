import api from './api';
import logger from '../utils/logger';
import { getSessionId, generateSessionId } from '../utils/guestWishlist';

/**
 * Check if user is authenticated
 * 
 * SECURITY: With cookie-based authentication, we don't check localStorage.
 * The backend will determine authentication status via httpOnly cookies.
 * If a user is not authenticated, the API will return 401, which we handle gracefully.
 * 
 * This function always returns true to attempt authenticated endpoints first.
 * If the user is not authenticated, the backend will return 401 and we'll fall back to guest endpoints.
 */
const isAuthenticated = () => {
  // With cookie-based auth, we can't check authentication client-side.
  // We'll attempt authenticated endpoints and handle 401 errors by falling back to guest endpoints.
  // This is more secure as authentication is verified server-side.
  return true;
};

const wishlistApi = {
  // Get wishlist (works for both authenticated and guest users)
  // SECURITY: Uses cookie-based authentication. Backend verifies auth via httpOnly cookies.
  getWishlist: async () => {
    try {
      // Try authenticated endpoint first (backend will verify via cookies)
      const response = await api.get("/wishlist");
      return response.data;
    } catch (error) {
      // If 401 (unauthorized), user is not authenticated - use guest endpoint
      if (error.response?.status === 401) {
        let sessionId = getSessionId();
        if (!sessionId) {
          sessionId = generateSessionId();
        }
        const response = await api.post("/wishlist/guest", { sessionId });
        return response.data;
      }
      // Re-throw other errors
      throw error;
    }
  },

  // Add to wishlist (works for both authenticated and guest users)
  // SECURITY: Uses cookie-based authentication. Backend verifies auth via httpOnly cookies.
  addToWishlist: async (productId) => {
    logger.log("Adding to wishlist for productId:", productId);

    try {
      // Try authenticated endpoint first (backend will verify via cookies)
      const response = await api.post("/wishlist", { productId });
      return response.data;
    } catch (error) {
      // If 401 (unauthorized), user is not authenticated - use guest endpoint
      if (error.response?.status === 401) {
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
      // Re-throw other errors
      throw error;
    }
  },

  // Remove from wishlist (works for both authenticated and guest users)
  // SECURITY: Uses cookie-based authentication. Backend verifies auth via httpOnly cookies.
  removeFromWishlist: async (productId) => {
    try {
      // Try authenticated endpoint first (backend will verify via cookies)
      const response = await api.delete(`/wishlist/${productId}`);
      return response.data;
    } catch (error) {
      // If 401 (unauthorized), user is not authenticated - use guest endpoint
      if (error.response?.status === 401) {
        let sessionId = getSessionId();
        if (!sessionId) {
          throw new Error("No session found for guest user");
        }
        const response = await api.post("/wishlist/guest/remove", {
          sessionId,
          productId,
        });
        return response.data;
      }
      // Re-throw other errors
      throw error;
    }
  },

  // Sync guest wishlist to user account after login
  // SECURITY: Uses cookie-based authentication. Backend verifies auth via httpOnly cookies.
  mergeWishlists: async () => {
    logger.log("Merging guest wishlist to user account");
    
    const sessionId = getSessionId();
    if (!sessionId) {
      throw new Error("No guest wishlist to sync");
    }

    // Backend will verify authentication via cookies
    // If not authenticated, backend will return 401
    const response = await api.post("/wishlist/merge", { sessionId });
    return response;
  },

  // Toggle product in wishlist (add if not present, remove if present)
  // SECURITY: Uses cookie-based authentication. Backend verifies auth via httpOnly cookies.
  toggleWishlist: async (productId) => {
    try {
      // Try authenticated endpoint first (backend will verify via cookies)
      const response = await api.post(`/wishlist/toggle/${productId}`);
      return response.data;
    } catch (error) {
      // If 401 (unauthorized), user is not authenticated - use guest endpoint
      if (error.response?.status === 401) {
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
        } catch (guestError) {
          // If check fails, try to add
          return await wishlistApi.addToGuestWishlist(productId);
        }
      }
      // Re-throw other errors
      throw error;
    }
  },

  // Check if a product is in the wishlist
  // SECURITY: Uses cookie-based authentication. Backend verifies auth via httpOnly cookies.
  checkInWishlist: async (productId) => {
    try {
      // Try authenticated endpoint first (backend will verify via cookies)
      const response = await api.get(`/wishlist/check/${productId}`);
      return response.data;
    } catch (error) {
      // If 401 (unauthorized), user is not authenticated - use guest endpoint
      if (error.response?.status === 401) {
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
        } catch (guestError) {
          logger.error("Error checking wishlist:", guestError);
          return { inWishlist: false };
        }
      }
      // Re-throw other errors
      throw error;
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
