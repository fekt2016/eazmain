// src/hooks/useCart.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import cartApi from '../services/cartApi';
import useAuth from './useAuth';
import logger from '../utils/logger';
import { resolveDefaultSku } from '../utils/cartValidation';
import useAds from "./useAds";
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
  let products = null;
  for (const handler of structures) {
    const result = handler();
    if (Array.isArray(result)) {
      products = result;
      break;
    }
  }

  if (!products) {
    logger.warn("Unknown cart structure:", cartData);
    return [];
  }

  // CRITICAL: Normalize cart items - clean invalid variant data
  const normalizedProducts = products
    .map((item) => {
      if (!item.product) return null;

      const hasVariants = item.product?.variants && Array.isArray(item.product.variants) && item.product.variants.length > 0;
      // CRITICAL: Use sku field (standardized), with backward compatibility for variantSku
      let variantSku = item.sku || item.variantSku || null;

      // Clean up invalid variant data
      // Remove variant objects, stringified objects, and IDs
      if (item.variant) {
        // Check if variant is a stringified object (invalid)
        if (typeof item.variant === 'string' && (item.variant.startsWith('{') || item.variant.startsWith('['))) {
          logger.warn("Removing invalid stringified variant object from cart item:", {
            productId: item.product?._id,
            productName: item.product?.name,
            variant: item.variant.substring(0, 50) + '...',
          });
          item.variant = undefined;
        }
        // Check if variant is an object (invalid)
        else if (typeof item.variant === 'object' && item.variant !== null) {
          logger.warn("Removing invalid variant object from cart item:", {
            productId: item.product?._id,
            productName: item.product?.name,
          });
          item.variant = undefined;
        }
      }

      // Remove variantId (we only use variantSku)
      if (item.variantId) {
        item.variantId = undefined;
      }

      // Normalize variantSku
      if (!variantSku && hasVariants) {
        // Case 1: Single variant product - auto-assign SKU
        if (item.product.variants.length === 1) {
          const sku = item.product.variants[0].sku;
          if (sku) {
            variantSku = sku.trim().toUpperCase();
            item.sku = variantSku; // Standardized field name
            item.variantSku = variantSku; // Keep for backward compatibility
            logger.log("Auto-assigned SKU for single-variant product:", {
              productId: item.product._id,
              variantSku,
            });
          } else {
            // Invalid: variant has no SKU
            logger.error("Single variant product missing SKU:", {
              productId: item.product._id,
              productName: item.product.name,
            });
            return null; // Remove invalid item
          }
        } else {
          // Case 2: Multi-variant product without SKU - invalid, must be removed
          // This should NEVER happen now - items are validated before being added
          // Keep as safety net for legacy cart data only
          logger.debug('[cartValidation] Invalid cart item removed (legacy data):', {
            productId: item.product._id,
            productName: item.product.name,
            variantCount: item.product.variants.length,
          });
          return null; // Remove invalid item
        }
      } else if (variantSku) {
        // Normalize SKU format
        variantSku = variantSku.trim().toUpperCase();
        item.sku = variantSku; // Standardized field name
        item.variantSku = variantSku; // Keep for backward compatibility
        
        // Validate SKU exists in product variants
        if (hasVariants) {
          const skuExists = item.product.variants.some(
            (v) => v.sku && v.sku.trim().toUpperCase() === variantSku
          );
          if (!skuExists) {
            logger.error("Invalid SKU in cart item - removing:", {
              productId: item.product._id,
              productName: item.product.name,
              variantSku,
            });
            return null; // Remove invalid item
          }
        }
      }

      // Clean up: remove variant and variantId fields (we only use sku)
      delete item.variant;
      delete item.variantId;

      return item;
    })
    .filter((item) => item !== null); // Remove null items (invalid products)

  return normalizedProducts;
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
      if (!isAuthenticated) {
        // Normalize guest cart data - getCartStructure will clean invalid items
        const normalized = getCartStructure(data);
        
        // Always save normalized data to ensure clean cart
        const guestCart = getGuestCart();
        guestCart.cart.products = normalized;
        saveGuestCart(guestCart);
      }
    },
  });
};
export const useCartTotals = () => {
  const { data } = useGetCart();
  const products = getCartStructure(data);
  const { promotionDiscountMap } = useAds();

  const applyPromoDiscount = (product) => {
    if (!product) return 0;
    const basePrice = product?.defaultPrice || product?.price || 0;
    if (!basePrice) return 0;

    const promoKey = product.promotionKey || "";
    if (!promoKey) return basePrice;

    const discountPercent = promotionDiscountMap[promoKey] || 0;
    if (!discountPercent || discountPercent <= 0) return basePrice;

    const discounted = basePrice * (1 - discountPercent / 100);
    // Guard against negative prices
    return discounted > 0 ? discounted : 0;
  };

  return products.reduce(
    (acc, item) => {
      const quantity = item?.quantity || 0;
      const price = applyPromoDiscount(item?.product);
      acc.total += price * quantity;
      acc.count += quantity;
      return acc;
    },
    { total: 0, count: 0 }
  );
};

export const useCartActions = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated, logout, userData } = useAuth();

  const queryKey = getCartQueryKey(isAuthenticated);

  const mutationOptions = {
    onError: (error) => {
      if (error.response?.status === 401) {
        logout();
      } else if (error.response?.status === 403) {
        // 403 means user is authenticated but doesn't have the right role
        logger.error('[useCart] Permission denied - user role may not be "user"', {
          userRole: userData?.role,
          requiredRole: 'user',
        });
      }
    },
  };
  const addToCartMutation = useMutation({
    mutationFn: async ({ product, quantity, variantSku }) => {
      logger.log("cart mutation", product, quantity, variantSku);
      // Support both id and _id for product identifier
      const productId = product?.id || product?._id;
      
      if (!productId) {
        logger.error("Product ID not found:", product);
        throw new Error("Product ID is required");
      }

      // CRITICAL: HARD LOG to debug SKU issues
      logger.log("[CART_REDUCER_ADD]", {
        productId,
        variantSku,
        quantity,
        productName: product?.name,
        hasVariants: product?.variants?.length > 0,
        variants: product?.variants?.map(v => ({
          id: v._id,
          sku: v.sku,
          status: v.status,
        })) || [],
      });
      
      // CRITICAL: Determine variant count
      const hasVariants = product?.variants && Array.isArray(product.variants) && product.variants.length > 0;
      const variantCount = hasVariants ? product.variants.length : 0;
      
      // STEP 1: Attempt default SKU resolution for multi-variant products
      let finalSku = variantSku;
      if (variantCount > 1 && (!finalSku || typeof finalSku !== 'string' || !finalSku.trim())) {
        // Try to resolve default SKU before blocking
        finalSku = resolveDefaultSku(product);
        if (finalSku) {
          logger.log('[useCart] ✅ Auto-resolved default SKU for multi-variant product:', {
            productId,
            productName: product?.name,
            resolvedSku: finalSku,
            variantCount,
          });
        }
      }
      
      // STEP 2: HARD GUARD - Block multi-variant products without SKU
      if (variantCount > 1 && (!finalSku || typeof finalSku !== 'string' || !finalSku.trim())) {
        // DEV ASSERTION
        if ((typeof __DEV__ !== 'undefined' && __DEV__) || process.env.NODE_ENV !== 'production') {
          logger.warn('[useCart] 🚫 DEV ASSERT: Multi-variant item without SKU blocked', {
            productId,
            productName: product?.name,
            variantCount,
            originalVariantSku: variantSku,
            resolvedSku: finalSku,
          });
        }
        
        logger.error('[useCart] ❌ SKU_REQUIRED: Multi-variant product missing SKU', {
          productId,
          productName: product?.name,
          variantCount,
          originalVariantSku: variantSku,
        });
        
        // Return structured error (never throw, never silently continue)
        const error = new Error("Please select a variant before adding to cart");
        error.code = 'SKU_REQUIRED';
        error.productId = productId;
        error.productName = product?.name;
        error.variantCount = variantCount;
        throw error;
      }
      
      // STEP 3: Normalize and validate SKU
      if (finalSku) {
        finalSku = finalSku.trim().toUpperCase();
        
        // Validate SKU exists in product variants
        if (hasVariants) {
          const skuExists = product.variants.some(
            (v) => v.sku && v.sku.trim().toUpperCase() === finalSku
          );
          if (!skuExists) {
            logger.error('[useCart] ❌ Invalid SKU for product:', { 
              productId, 
              productName: product?.name, 
              sku: finalSku,
              availableSkus: product.variants.map(v => v.sku).filter(Boolean),
            });
            throw new Error("Invalid variant SKU");
          }
        }
      } else if (variantCount === 0) {
        // No variants - ensure variantSku is not provided
        finalSku = undefined;
      } else if (variantCount === 1) {
        // Single variant - auto-assign SKU if missing
        if (!finalSku) {
          finalSku = resolveDefaultSku(product);
          if (finalSku) {
            logger.log('[useCart] ✅ Auto-assigned SKU for single-variant product:', {
              productId,
              sku: finalSku,
            });
          }
        }
      }
      
      // Use finalSku for the rest of the function
      variantSku = finalSku;

      if (isAuthenticated) {
        // SECURITY: Check user role before making cart request
        // Cart endpoints require 'user' role (buyer account)
        if (userData?.role && userData.role !== 'user') {
          const error = new Error(
            `You cannot add items to cart with a ${userData.role} account. Please log in with a buyer account to add items to cart.`
          );
          error.code = 'INVALID_ROLE';
          error.userRole = userData.role;
          error.requiredRole = 'user';
          throw error;
        }
        
        // Backend still expects variantId for now, but we'll send SKU via variantSku field
        // Extract variantId for backward compatibility with backend API
        let variantId = null;
        if (variantSku && Array.isArray(product?.variants)) {
          const found = product.variants.find((v) => v.sku && v.sku.toUpperCase() === variantSku);
          if (found?._id) {
            variantId = found._id.toString ? found._id.toString() : String(found._id);
          }
        }
        
        logger.log('[addToCart] Calling API with:', { productId, quantity, variantId, variantSku });
        const response = await cartApi.addToCart(productId, quantity, variantId);
        logger.log('[addToCart] API response:', response);
        logger.log('[addToCart] API response.data:', response.data);
        
        return response.data;
      }
      
      // Guest cart - store ONLY sku string, never variant objects or IDs
      const guestCart = getGuestCart();
      const products = guestCart?.cart?.products || [];
      
      // CRITICAL: Merge ONLY when productId + sku match (SKU-scoped quantity)
      const existingItem = products?.find(
        (item) => {
          const itemProductId = item.product?._id || item.product?.id;
          const itemSku = item.sku || item.variantSku || null; // Backward compatibility
          return itemProductId === productId && itemSku === variantSku;
        }
      );
      
      if (existingItem) {
        // Merge: Add quantity to existing SKU
        existingItem.quantity += quantity;
      } else {
        // New item: Create separate cart line for this SKU
        // CRITICAL: Normalize cart item shape - only store required fields
        const normalizedItem = {
          _id: `guest-${Date.now()}-${productId}-${variantSku || 'no-sku'}`,
          productId: productId, // Store productId separately for easier access
          product: {
            _id: productId,
            id: productId,
            name: product?.name,
            defaultPrice: product?.defaultPrice || product?.price,
            imageCover: product?.imageCover || product?.image,
            variants: product?.variants || [], // Include variants for validation
          },
          quantity,
          variantCount: variantCount, // Store variant count for validation
        };
        
        // Only add SKU if it exists (multi-variant products MUST have SKU)
        if (variantSku) {
          normalizedItem.sku = variantSku; // Standardized field name
          normalizedItem.variantSku = variantSku; // Keep for backward compatibility
        }
        
        products.push(normalizedItem);
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
      
      // Provide user-friendly error messages based on error type
      let errorMessage = 'Failed to add item to cart';
      
      if (error.code === 'INVALID_ROLE') {
        errorMessage = error.message || `You cannot add items to cart with a ${error.userRole} account. Please log in with a buyer account.`;
      } else if (error.code === 'FORBIDDEN' || error.status === 403) {
        errorMessage = error.message || "You don't have permission to add items to cart. Please ensure you're logged in as a buyer account.";
      } else if (error.code === 'UNAUTHORIZED' || error.status === 401) {
        errorMessage = error.message || 'Please log in to add items to your cart.';
      } else if (error.response?.status === 403) {
        errorMessage = error.response?.data?.message || "You don't have permission to add items to cart. Please ensure you're logged in as a buyer account.";
      } else if (error.response?.status === 401) {
        errorMessage = error.response?.data?.message || 'Please log in to add items to your cart.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Show error notification
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 4000, // Increased timeout for longer error messages
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
        // cartApi.clearCart() returns: { status: 'success', data: { cart: { products: [] } } }
        // We need to return: { data: { cart: { products: [] } } } to match getCartStructure expectations
        if (response?.data?.cart) {
          // Return the data part wrapped in data object
          return { data: response.data };
        }
        // Fallback: return empty cart structure
        return { 
          data: { 
            cart: { 
              products: [] 
            } 
          } 
        };
      }
      const emptyCart = { data: { cart: { products: [] } } };
      saveGuestCart(emptyCart);
      return emptyCart;
    },
    onSuccess: (data) => {
      logger.log("cart successfully!!! cleared:", data);
      // Normalize the data structure to match what getCartStructure expects
      const normalizedData = data?.data?.cart 
        ? data 
        : { data: { cart: { products: [] } } };
      queryClient.setQueryData(queryKey, normalizedData);
      // Invalidate queries to ensure UI refreshes
      queryClient.invalidateQueries(queryKey);
      // NOTE: Toast notification removed per user request
    },
    onError: (error) => {
      logger.error('Clear cart error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to clear cart';
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
      if (mutationOptions.onError) {
        mutationOptions.onError(error);
      }
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
        products.map((item) => {
          // Extract variantId from variantSku for backend API (backward compatibility)
          let variantId = null;
          if (item.variantSku && Array.isArray(item.product?.variants)) {
            const found = item.product.variants.find(
              (v) => v.sku && v.sku.toUpperCase() === item.variantSku.toUpperCase()
            );
            if (found?._id) {
              variantId = found._id.toString ? found._id.toString() : String(found._id);
            }
          }
          // Backward compatibility: If variantSku missing, try to extract from variant
          else if (item.variant) {
            if (typeof item.variant === 'string') {
              variantId = item.variant;
            } else if (typeof item.variant === 'object' && item.variant !== null) {
              variantId = item.variant._id || item.variant.id || null;
              if (variantId) {
                variantId = variantId.toString ? variantId.toString() : String(variantId);
              }
            }
          }
          return cartApi.addToCart(item.product._id, item.quantity, variantId);
        })
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
