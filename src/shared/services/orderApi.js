import api from './api';
import logger from '../utils/logger';

export const orderService = {
  // Platform tax rates from admin platform settings (for checkout)
  getTaxRates: async () => {
    try {
      const response = await api.get("/order/tax-rates");
      return response.data;
    } catch (error) {
      logger.error("API Error - getTaxRates:", {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
      });
      throw new Error(error.response?.data?.message || "Failed to fetch tax rates");
    }
  },

  // Validate cart and get backend-calculated totals
  validateCart: async (cartData) => {
    try {
      const response = await api.post("/order/validate-cart", cartData);
      return response.data;
    } catch (error) {
      logger.error("API Error - validateCart:", {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
      });
      throw new Error(error.response?.data?.message || "Failed to validate cart");
    }
  },

  createOrder: async (data) => {
    try {
      const response = await api.post("/order", data);
      return response;
    } catch (error) {
      logger.error("API Error - createOrder:", {
        url: error.config?.url,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      // Surface backend validation message so UI / console shows the real reason
      throw new Error(error.response?.data?.message || "Failed to create order");
    }
  },
  getAllOrders: async () => {
    const response = await api.get("/order");
    return response;
  },
  getSellersOrders: async () => {
    const response = await api.get("/order/get-seller-orders");
    return response;
  },
  getSellerOrderById: async (id) => {
    try {
      const response = await api.get(`/order/seller-order/${id}`);
      return response.data;
    } catch (error) {
      logger.error("API Error - getSellerOrderById:", {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
      });
      throw new Error(error.response?.data?.message || "Failed to fetch order");
    }
  },
  getUserOrderById: async (id) => {
    logger.debug("api order user id", id);
    try {
      const response = await api.get(`/order/get-user-order/${id}`);
      return response.data;
    } catch (error) {
      logger.error("API Error - getUserOrderById:", {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
      });
      throw new Error(error.response?.data?.message || "Failed to fetch order");
    }
  },
  getUserOrders: async () => {
    try {
      const response = await api.get(`/order/get-user-orders`);
      return response.data;
    } catch (error) {
      logger.error("API Error - getUserOrderById:", {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
      });
      throw new Error(error.response?.data?.message || "Failed to fetch order");
    }
  },
  deleteOrder: async (id) => {
    logger.debug("api", id);
    const response = await api.delete(`/order/${id}`);
    return response;
  },
  getOrderByTrackingNumber: async (trackingNumber) => {
    try {
      // FIX: Ensure tracking number is properly encoded and path is correct
      const encodedTrackingNumber = encodeURIComponent(trackingNumber);
      const response = await api.get(`/order/track/${encodedTrackingNumber}`);
      return response.data;
    } catch (error) {
      logger.error("Error fetching order by tracking number:", {
        trackingNumber,
        error: error.message,
        code: error.code,
        response: error.response?.data,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
      });
      
      // Provide more helpful error messages
      if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
        const networkError = new Error('Unable to connect to the server. Please ensure the backend server is running.');
        networkError.code = 'ERR_NETWORK';
        networkError.isNetworkError = true;
        throw networkError;
      }
      
      throw error;
    }
  },
  updateOrderAddress: async ({ orderId, addressId }) => {
    const response = await api.patch(`/order/${orderId}/shipping-address`, {
      addressId,
    });
    return response.data;
  },
  updateOrderAddressAndRecalculate: async ({ orderId, addressId, shippingType }) => {
    const response = await api.patch(`/order/${orderId}/update-address`, {
      addressId,
      shippingType,
    });
    return response.data;
  },
  payShippingDifference: async (orderId) => {
    const response = await api.post(`/order/${orderId}/pay-shipping-difference`);
    return response.data;
  },
  requestRefund: async (orderId, data) => {
    const response = await api.post(`/order/${orderId}/request-refund`, data);
    return response.data;
  },
  getRefundStatus: async (orderId) => {
    const response = await api.get(`/order/${orderId}/refund-status`);
    return response.data;
  },
  getRefundById: async (orderId, refundId) => {
    try {
      const response = await api.get(`/order/${orderId}/refunds/${refundId}`);
      return response.data;
    } catch (error) {
      logger.error("API Error - getRefundById:", {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
      });
      throw new Error(error.response?.data?.message || "Failed to fetch refund");
    }
  },
  selectReturnShippingMethod: async (orderId, refundId, returnShippingMethod) => {
    try {
      const response = await api.patch(`/order/${orderId}/refunds/${refundId}/select-return-shipping`, {
        returnShippingMethod,
      });
      return response.data;
    } catch (error) {
      logger.error("API Error - selectReturnShippingMethod:", {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
      });
      throw new Error(error.response?.data?.message || "Failed to select return shipping method");
    }
  },
};
