// src/hooks/useCart.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { toast } from "react-toastify";
import { useCallback } from "react";
import cartApi from '../services/cartApi';
import useAuth from './useAuth';
import { useEffect } from "react";
import logger from '../utils/logger';
export const getCartStructure = (cartData) => {
  if (!cartData) return [];

  // Helper function to safely traverse nested properties
  const getNestedProperty = (obj, ...paths) => {
    return paths.reduce((current, path) => {
      if (current && typeof current === "object" && path in current) {
        return current[path];
      }
      return undefined;
    }, obj);
  };

  // Handle different possible structures
  const structures = [
    // Case 1: Already an array of products
    () => (Array.isArray(cartData) ? cartData : undefined),

    // Case 2: Authenticated user response structure
    () => getNestedProperty(cartData, "data", "cart", "products"),

    // Case 3: Guest cart structure
    () => getNestedProperty(cartData, "cart", "products"),

    // Case 4: Direct products array
    () => getNestedProperty(cartData, "products"),

    // Case 5: Nested data structure variations
    () => getNestedProperty(cartData, "data", "products"),
    () => getNestedProperty(cartData, "data", "data", "products"),
    () => getNestedProperty(cartData, "data", "data", "cart", "products"),
  ];

  // Find the first matching structure
  for (const handler of structures) {
    const result = handler();
    if (Array.isArray(result)) return result;
  }

  // Fallback to empty array
  logger.warn("Unknown cart structure:", cartData);
  return [];
};

// Helper to save guest cart to localStorage

const saveGuestCart = (cartData) => {
  logger.log("Saving guest cart:", cartData);
  try {
    localStorage.setItem("guestCart", JSON.stringify(cartData));
  } catch (error) {
    logger.error("Failed to save guest cart", error);
  }
};
const getGuestCart = () => {
  try {
    const guestCart = localStorage.getItem("guestCart");
    return guestCart ? JSON.parse(guestCart) : { cart: { products: [] } };
  } catch (error) {
    logger.error("Error parsing guest cart, resetting", error);
    const emptyCart = { cart: { products: [] } };
    localStorage.setItem("guestCart", JSON.stringify(emptyCart));
    return emptyCart;
  }
};

// Helper to get consistent cart query key
const getCartQueryKey = (isAuthenticated) => ["cart", isAuthenticated];
// Get cart query hook
export const useGetCart = () => {
  const { isAuthenticated } = useAuth();
  const queryKey = getCartQueryKey(isAuthenticated);

  return useQuery({
    queryKey,
    queryFn: async () => {
      if (isAuthenticated) {
        try {
          const response = await cartApi.getCart();

          return response;
        } catch (error) {
          logger.error("Failed to fetch cart:", error);
          return { data: { cart: { products: [] } } };
        }
      }
      return getGuestCart();
    },
    onSuccess: (data) => {
      if (!isAuthenticated) saveGuestCart(data);
    },
  });
};
export const useCartTotals = () => {
  const { data } = useGetCart();
  const products = getCartStructure(data);

  return products.reduce(
    (acc, item) => {
      const price = item?.product?.defaultPrice || 0;

      const quantity = item?.quantity || 0;
      acc.total += price * quantity;
      acc.count += quantity;
      return acc;
    },
    { total: 0, count: 0 }
  );
};

export const useCartActions = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated, logout } = useAuth();

  const queryKey = getCartQueryKey(isAuthenticated);

  const mutationOptions = {
    onError: (error) => {
      if (error.response?.status === 401) logout();
    },
  };
  const addToCartMutation = useMutation({
    mutationFn: async ({ product, quantity, variant }) => {
      logger.log("cart mutation", product, quantity, variant);
      // Support both id and _id for product identifier
      const productId = product?.id || product?._id;
      
      if (!productId) {
        logger.error("Product ID not found:", product);
        throw new Error("Product ID is required");
      }

      if (isAuthenticated) {
        // variant can be an object with _id or just an ID string
        const variantId = typeof variant === 'object' && variant?._id 
          ? variant._id 
          : variant;
        
        logger.log('[addToCart] Calling API with:', { productId, quantity, variantId });
        const response = await cartApi.addToCart(productId, quantity, variantId);
        logger.log('[addToCart] API response:', response);
        logger.log('[addToCart] API response.data:', response.data);
        
        // Backend returns: { status: 'success', data: { cart: {...} } }
        // axios response structure: { data: { status: 'success', data: { cart: {...} } } }
        // So response.data = { status: 'success', data: { cart: {...} } }
        // We need to return the full response.data structure so onSuccess can extract it
        return response.data;
      }
      const guestCart = getGuestCart();

      const products = guestCart?.cart?.products || [];
      // Check for existing item by product ID (support both _id and id)
      const existingItem = products?.find(
        (item) => {
          const itemProductId = item.product?._id || item.product?.id;
          return itemProductId === productId;
        }
      );
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        products.push({
          _id: `guest-${Date.now()}-${productId}`,
          product: {
            _id: productId,
            id: productId,
            name: product?.name,
            defaultPrice: product?.defaultPrice || product?.price,
            imageCover: product?.imageCover || product?.image,
          },
          quantity,
          variant: variant ? { _id: variant } : undefined,
        });
      }

      saveGuestCart(guestCart);
      return guestCart;
    },
    onSuccess: (apiResponse) => {
      logger.log('[addToCart] Success response:', apiResponse);
      
      // apiResponse structure: { status: 'success', data: { cart: {...} } }
      // We need to extract { data: { cart: {...} } } to match getCartStructure expectations
      let cartData;
      
      if (apiResponse?.data?.cart) {
        // Structure: { status: 'success', data: { cart: {...} } }
        cartData = { data: { cart: apiResponse.data.cart } };
      } else if (apiResponse?.cart) {
        // Structure: { cart: {...} }
        cartData = { data: { cart: apiResponse.cart } };
      } else if (apiResponse?.data) {
        // Structure: { data: {...} }
        cartData = apiResponse.data;
      } else {
        // Fallback: use response as-is
        cartData = apiResponse;
      }
      
      logger.log('[addToCart] Setting cart data:', cartData);
      logger.log('[addToCart] Cart products:', cartData?.data?.cart?.products || cartData?.cart?.products);
      
      // Update query data and invalidate to ensure UI refreshes
      queryClient.setQueryData(queryKey, cartData);
      queryClient.invalidateQueries(queryKey);
      
      // Show success notification
      toast.success('Item added to cart successfully!', {
        position: "top-right",
        autoClose: 2000,
      });
    },
    onError: (error) => {
      logger.error('Add to cart error:', error);
      // Show error notification
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add item to cart';
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
      // Call parent error handler
      if (mutationOptions.onError) {
        mutationOptions.onError(error);
      }
    },
    ...mutationOptions,
  });
  const updateCartItemMutation = useMutation({
    mutationFn: async (data) => {
      const { itemId: productId, quantity } = data;
      
      // SECURITY: Validate quantity on frontend (backend must also validate)
      const validatedQuantity = Math.max(1, Math.min(quantity || 1, 999)); // Max 999 per item
      if (validatedQuantity !== quantity) {
        logger.warn(`[updateCartItem] Quantity ${quantity} adjusted to ${validatedQuantity}`);
      }

      if (isAuthenticated) {
        // SECURITY: Use validated quantity
        const response = await cartApi.updateCartItem(productId, validatedQuantity);
        return response;
      }
      const guestCart = getGuestCart();
      const item = guestCart?.cart?.products?.find(
        (item) => item?.product?._id === productId
      );
      // SECURITY: Use validated quantity
      if (item) item.quantity = validatedQuantity;
      saveGuestCart(guestCart);
      return guestCart;
    },
    onSuccess: (apiResponse) => {
      queryClient.setQueryData(queryKey, apiResponse);
    },
    ...mutationOptions,
  });
  const removeCartItemMutation = useMutation({
    mutationFn: async (productId) => {
      if (isAuthenticated) {
        await cartApi.removeCartItem(productId);
        return { productId, isAuthenticated };
      }
      const guestCart = getGuestCart();

      if (
        guestCart &&
        guestCart.cart &&
        Array.isArray(guestCart.cart.products)
      ) {
        guestCart.cart.products = guestCart.cart.products.filter(
          (item) => item.product._id !== productId
        );
      }
      saveGuestCart(guestCart);
      return guestCart;
    },
    onSuccess: (result) => {
      if (result.isAuthenticated) {
        // Invalidate the cart query so it refetches from the server
        queryClient.invalidateQueries(queryKey);
      } else {
        // For guest users, just update the cache directly (or re-read from localStorage)
        queryClient.setQueryData(queryKey, result.guestCart);
      }
    },
    ...mutationOptions,
  });
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      if (isAuthenticated) {
        const response = await cartApi.clearCart();
        return response;
      }
      const emptyCart = { data: { cart: { products: [] } } };
      saveGuestCart(emptyCart);
      return emptyCart;
    },
    onSuccess: (data) => {
      logger.log("cart successfully!!! cleared:", data);
      queryClient.setQueryData(queryKey, data);
    },
    ...mutationOptions,
  });
  const syncCartMutation = useMutation({
    mutationFn: async () => {
      logger.log("Syncing guest cart to server...");
      const guestCart = getGuestCart();
      logger.log("GuestCart sync", guestCart);
      const products =
        guestCart?.data?.cart?.products || guestCart.cart.products || [];
      logger.log("Products to sync:", products);
      const results = await Promise.allSettled(
        products.map((item) =>
          cartApi.addToCart(item.product._id, item.quantity)
        )
      );

      const failedItems = results
        .map((result, index) => ({ ...result, item: products[index] }))
        .filter((result) => result.status === "rejected");

      const updatedGuestCart = {
        data: {
          ...guestCart?.data,
          cart: {
            ...guestCart?.data?.cart,
            products: failedItems.map((failed) => failed?.item),
          },
        },
      };

      saveGuestCart(updatedGuestCart);
      return {
        success: results?.length - failedItems.length,
        failed: failedItems.length,
      };
    },
    onSuccess: (result) => {
      logger.log("sync successfully!!!", result);
      queryClient.invalidateQueries({ queryKey });
    },
    ...mutationOptions,
  });
  // Wrapper function for addToCart that provides better error handling
  const addToCartWrapper = useCallback((params, options) => {
    logger.log('[useCartActions] addToCart called with:', params);
    return addToCartMutation.mutate(params, {
      ...options,
      onError: (error) => {
        logger.error('[useCartActions] addToCart error:', error);
        logger.error('[useCartActions] Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        if (options?.onError) {
          options.onError(error);
        }
      },
    });
  }, [addToCartMutation]);

  return {
    addToCart: addToCartWrapper,
    updateCartItem: updateCartItemMutation.mutate,
    removeCartItem: removeCartItemMutation.mutate,
    clearCart: clearCartMutation.mutate,
    syncCart: syncCartMutation.mutate,
    isAdding: addToCartMutation.isPending,
    isUpdating: updateCartItemMutation.isPending,
    isRemoving: removeCartItemMutation.isPending,
    isClearing: clearCartMutation.isPending,
    isSyncing: syncCartMutation.isPending,
    addToCartMutation,
    updateCartItemMutation,
    removeCartItemMutation,
  };
};

export const useAutoSyncCart = () => {
  const { isAuthenticated } = useAuth();
  const { syncCart } = useCartActions();
  const queryClient = useQueryClient();
  
  // FIX: Use ref to prevent infinite loops from nested syncCart calls
  const syncAttemptedRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate sync attempts
    if (syncAttemptedRef.current) {
      return;
    }

    if (isAuthenticated) {
      const guestCart = getGuestCart();
      const hasGuestItems = guestCart.cart?.products?.length > 0;
      if (hasGuestItems) {
        syncAttemptedRef.current = true;
        logger.log("Sycing guest cart items to server...");
        syncCart(undefined, {
          onSuccess: () => {
            // FIX: Remove nested syncCart call - it was causing infinite loops
            // After successful sync, clear guest cart and invalidate queries
            saveGuestCart({ cart: { products: [] } });
            queryClient.invalidateQueries(["cart", true]);
            // Reset ref after successful sync to allow future syncs if needed
            syncAttemptedRef.current = false;
          },
          onError: () => {
            // Reset ref on error to allow retry
            syncAttemptedRef.current = false;
          },
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // Removed syncCart and queryClient from deps - they're stable or handled via refs
  }, [isAuthenticated]);
};
