import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { orderService } from '../services/orderApi'; // Adjust the import path as necessary
import logger from '../utils/logger';

// import { useNavigate } from "react-router-dom";

export const getOrderStructure = (orderData) => {
  // Processing order data structure
  if (!orderData) return [];

  // Handle various response structures from backend
  // Backend returns: { status: 'success', data: { orders: [...] } }
  if (orderData?.data?.data?.orders) {
    return orderData.data.data.orders;
  }
  if (orderData?.data?.orders) {
    return orderData.data.orders;
  }
  // Fallback: if orders is at root level
  if (Array.isArray(orderData?.orders)) {
    return orderData.orders;
  }
  if (Array.isArray(orderData?.data)) {
    return orderData.data;
  }
  // Return empty array if no orders found
  return [];
};

/**
 * User-facing order status for display.
 * Backend uses status ('completed' when delivered) and currentStatus ('delivered').
 * Use this so delivered orders show "Delivered" even when status is still 'confirmed' in some flows.
 */
export const getOrderDisplayStatus = (order) => {
  const current = (order?.currentStatus || "").toLowerCase();
  const status = (order?.status || "").toLowerCase();
  if (current === "delivered" || status === "completed") {
    return { displayLabel: "Delivered", badgeStatus: "delivered" };
  }
  if (current === "cancelled" || status === "cancelled") {
    return { displayLabel: "Cancelled", badgeStatus: "cancelled" };
  }
  if (current === "out_for_delivery" || status === "partially_shipped") {
    return { displayLabel: "Shipped", badgeStatus: "shipped" };
  }
  const raw = current || status;
  if (!raw) return { displayLabel: "Pending", badgeStatus: "processing" };
  const label = raw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const badgeStatus =
    raw === "shipped" || raw === "out_for_delivery"
      ? "shipped"
      : raw === "cancelled"
        ? "cancelled"
        : "processing";
  return { displayLabel: label, badgeStatus };
};
export const useGetSellerOrder = (orderId) => {
  return useQuery({
    queryKey: ["sellerOrder", orderId],
    queryFn: async () => {
      if (!orderId) throw new Error("Order ID is required");

      const data = await orderService.getSellerOrderById(orderId);
      return data?.data?.order || null;
    },
    enabled: !!orderId,
    retry: (failureCount, error) => {
      // Don't retry on 404 or 403 errors
      if (
        error.message.includes("404") ||
        error.message.includes("403") ||
        error.message.includes("Order not found")
      ) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useGetSellerOrders = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["seller-orders"], // Add query key for caching
    queryFn: async () => {
      // Fixed property name (queryFn instead of queryfn)
      try {
        const response = await orderService.getSellersOrders();
        logger.log("Order fetch response:", response);

        // Check for valid response structure
        if (!response || !response.data) {
          throw new Error("Invalid server response structure");
        }

        return response;
      } catch (error) {
        // Log detailed error information
        logger.error("Order fetch error:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });

        // Throw meaningful error message
        throw new Error(
          error.response?.data?.message || "Failed to load orders"
        );
      }
    },
    onsuccess: (data) => {
      logger.log(data);
      queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
    },
    retry: 2, // Add retry mechanism
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    onError: (error) => {
      logger.error("Order fetch failed:", error.message);
    },
  });
};
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  // const navigate = useNavigate();
  return useMutation({
    queryKey: ["orders"],
    mutationFn: async (data) => {
      try {
        const response = await orderService.createOrder(data);
        logger.log("Order fetch response:", response);
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        return response;
      } catch (error) {
        logger.error("Order fetch error:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      logger.log("order created successfully!!!", data);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      
      // CRITICAL: Invalidate wallet balance if order was paid with credit balance
      // This ensures the UI updates immediately to show the deducted amount
      const order = data?.data?.order || data?.order || data?.data || data;
      const paymentMethod = order?.paymentMethod;
      const isWalletPayment = paymentMethod === 'credit_balance' || paymentMethod === 'wallet';
      
      if (isWalletPayment) {
        logger.log('[useCreateOrder] 💰 Wallet payment detected - invalidating wallet balance');
        queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] });
        queryClient.invalidateQueries({ queryKey: ['creditBalance'] });
        // Immediately refetch to update UI
        queryClient.refetchQueries({ queryKey: ['wallet', 'balance'] });
      }
      
      // CRITICAL: Invalidate product queries to refresh sold counts and stock
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product"] });
      // Invalidate all product-related queries
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey;
          return (
            (Array.isArray(key) && key[0] === 'products') ||
            (Array.isArray(key) && key[0] === 'product')
          );
        },
      });
    },
    onError: (error) => {
      logger.error("Order fetch failed:", error.message);
    },
  });
};

export const useGetUserOrders = () => {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const data = await orderService.getUserOrders();
      return data;
    },
  });
};
export const useGetUserOrderById = (id) => {
  return useQuery({
    queryKey: ["order", id], // Include id in queryKey for unique caching
    queryFn: async () => {
      if (!id) {
        logger.log("[useGetUserOrderById] No ID provided, returning null");
        return null;
      }
      logger.log("[useGetUserOrderById] Fetching order with ID:", id);
      const response = await orderService.getUserOrderById(id);
      logger.log("[useGetUserOrderById] API Response structure:", {
        hasData: !!response?.data,
        hasOrder: !!response?.data?.order,
        hasStatus: !!response?.status,
        keys: response ? Object.keys(response) : null,
        dataKeys: response?.data ? Object.keys(response.data) : null,
      });
      // Backend returns: { status: 'success', data: { order: {...} } }
      // Return the full response.data which contains { status, data: { order } }
      return response.data || response; // Return just the data
    },
    enabled: !!id, // Only run query when id is available
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    refetchOnMount: false, // Only refetch when explicitly invalidated
    refetchOnReconnect: false, // Prevent refetch on reconnect
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const response = await orderService.deleteOrder(id);
      return response;
    },
    onSuccess: (response) => {
      const message =
        response?.data?.message ||
        response?.message ||
        "Order updated successfully";

      logger.log("[useDeleteOrder] Success:", message);

      queryClient.invalidateQueries({ queryKey: ["order"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (error) => {
      const backendMessage =
        error?.response?.data?.message || error?.message || "Failed to update order";

      logger.error("[useDeleteOrder] Error:", backendMessage, error);
    },
  });
};

export const useUpdateOrderAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, addressId }) => {
      const response = await orderService.updateOrderAddress({ orderId, addressId });
      return response;
    },
    onSuccess: (data, variables) => {
      logger.log("Order address updated successfully");
      queryClient.invalidateQueries({ queryKey: ["order", variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useUpdateOrderAddressAndRecalculate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, addressId, shippingType }) => {
      const response = await orderService.updateOrderAddressAndRecalculate({
        orderId,
        addressId,
        shippingType,
      });
      return response;
    },
    onSuccess: (data, variables) => {
      logger.log("Order address and shipping recalculated");
      queryClient.invalidateQueries({ queryKey: ["order", variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const usePayShippingDifference = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId) => {
      const response = await orderService.payShippingDifference(orderId);
      return response;
    },
    onSuccess: (data, variables) => {
      logger.log("Shipping difference payment initialized");
      queryClient.invalidateQueries({ queryKey: ["order", variables] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useRequestRefund = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, data }) => {
      const response = await orderService.requestRefund(orderId, data);
      return response;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["order", variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["refundStatus", variables.orderId] });
    },
  });
};

export const useGetRefundStatus = (orderId) => {
  return useQuery({
    queryKey: ["refundStatus", orderId],
    queryFn: async () => {
      if (!orderId) return null;
      const response = await orderService.getRefundStatus(orderId);
      return response.data;
    },
    enabled: !!orderId,
    staleTime: 1000 * 60, // 1 minute
  });
};
