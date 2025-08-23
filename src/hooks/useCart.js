// src/hooks/useCart.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import cartApi from "../service/cartApi";
import useAuth from "./useAuth";
import { useEffect } from "react";
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
  console.warn("Unknown cart structure:", cartData);
  return [];
};

// Helper to save guest cart to localStorage

const saveGuestCart = (cartData) => {
  console.log("Saving guest cart:", cartData);
  try {
    localStorage.setItem("guestCart", JSON.stringify(cartData));
  } catch (error) {
    console.error("Failed to save guest cart", error);
  }
};
const getGuestCart = () => {
  try {
    const guestCart = localStorage.getItem("guestCart");
    return guestCart ? JSON.parse(guestCart) : { cart: { products: [] } };
  } catch (error) {
    console.error("Error parsing guest cart, resetting", error);
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
          console.error("Failed to fetch cart:", error);
          return { data: { cart: { products: [] } } };
        }
      }
      return getGuestCart();
    },
    onSuccess: (data) => {
      console.log("success data:", data);
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
      const productId = product?.id;
      if (isAuthenticated) {
        const response = await cartApi.addToCart(productId, quantity, variant);
        return response;
      }
      const guestCart = getGuestCart();

      const products = guestCart?.cart?.products || [];
      const existingItem = products?.find(
        (item) => item.product._id === productId
      );
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        products.push({
          _id: `guest-${Date.now()}-${productId}`,
          product: {
            _id: productId,
            name: product?.name,
            defaultPrice: product?.defaultPrice,
            imageCover: product?.imageCover,
          },
          quantity,
        });
      }

      saveGuestCart(guestCart);
      return guestCart;
    },
    onSuccess: (apiResponse) => {
      queryClient.setQueryData(queryKey, apiResponse);
    },
    ...mutationOptions,
  });
  const updateCartItemMutation = useMutation({
    mutationFn: async (data) => {
      const { itemId: productId, quantity } = data;

      if (isAuthenticated) {
        const response = await cartApi.updateCartItem(productId, quantity);
        return response;
      }
      const guestCart = getGuestCart();
      const item = guestCart?.cart?.products?.find(
        (item) => item?.product?._id === productId
      );
      if (item) item.quantity = quantity;
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
      console.log("cart successfully!!! cleared:", data);
      queryClient.setQueryData(queryKey, data);
    },
    ...mutationOptions,
  });
  const syncCartMutation = useMutation({
    mutationFn: async () => {
      console.log("Syncing guest cart to server...");
      const guestCart = getGuestCart();
      console.log("GuestCart sync", guestCart);
      const products =
        guestCart?.data?.cart?.products || guestCart.cart.products || [];
      console.log("Products to sync:", products);
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
      console.log("sync successfully!!!", result);
      queryClient.invalidateQueries({ queryKey });
    },
    ...mutationOptions,
  });
  return {
    addToCart: addToCartMutation.mutate,
    updateCartItem: updateCartItemMutation.mutate,
    removeCartItem: removeCartItemMutation.mutate,
    clearCart: clearCartMutation.mutate,
    syncCart: syncCartMutation.mutate,
    isAdding: addToCartMutation.isLoading,
    isUpdating: updateCartItemMutation.isLoading,
    isRemoving: removeCartItemMutation.isLoading,
    isClearing: clearCartMutation.isLoading,
    isSyncing: syncCartMutation.isLoading,
  };
};

export const useAutoSyncCart = () => {
  const { isAuthenticated } = useAuth();
  const { syncCart } = useCartActions();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isAuthenticated) {
      const guestCart = getGuestCart();
      const hasGuestItems = guestCart.cart?.products?.length > 0;
      if (hasGuestItems) {
        console.log("Sycing guest cart items to server...");
        syncCart(undefined, {
          onSuccess: () => {
            if (isAuthenticated) {
              const guestCart = getGuestCart();
              const hasGuestItems = guestCart.cart?.products?.length > 0;
              if (hasGuestItems) {
                console.log("Sycing guest cart items to server...");
                syncCart(undefined, {
                  onSuccess: () => {
                    saveGuestCart({ cart: { products: [] } });
                    queryClient.invalidateQueries(["cart", true]);
                  },
                });
              }
            }
          },
        });
      }
    }
  }, [isAuthenticated, syncCart, queryClient]);
};
