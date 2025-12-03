import api from './api';
import logger from '../utils/logger';

export const orderService = {
  createOrder: async (data) => {
    const response = await api.post("/order", data);
    return response;
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
    console.log(id);
    try {
      const response = await api.get(`/order/seller-order/${id}`);
      return response.data;
    } catch (error) {
      logger.log("API Error - getSellerOrderById:", {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
      });
      throw new Error(error.response?.data?.message || "Failed to fetch order");
    }
  },
  getUserOrderById: async (id) => {
    logger.log("api order user id", id);
    try {
      const response = await api.get(`/order/get-user-order/${id}`);
      return response.data;
    } catch (error) {
      logger.log("API Error - getUserOrderById:", {
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
      logger.log("API Error - getUserOrderById:", {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
      });
      throw new Error(error.response?.data?.message || "Failed to fetch order");
    }
  },
  deleteOrder: async (id) => {
    logger.log("api", id);
    const response = await api.delete(`/order/${id}`);
    return response;
  },
  getOrderByTrackingNumber: async (trackingNumber) => {
    try {
      const response = await api.get(`/order/track/${trackingNumber}`);
      return response.data;
    } catch (error) {
      logger.error("Error fetching order by tracking number:", error);
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
};
