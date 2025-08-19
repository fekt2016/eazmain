import api from "../service/api";

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
      console.log("API Error - getSellerOrderById:", {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
      });
      throw new Error(error.response?.data?.message || "Failed to fetch order");
    }
  },
  getUserOrderById: async (id) => {
    console.log(id);
    try {
      const response = await api.get(`/order/get-user-order/${id}`);
      return response.data;
    } catch (error) {
      console.log("API Error - getUserOrderById:", {
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
      console.log("API Error - getUserOrderById:", {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
      });
      throw new Error(error.response?.data?.message || "Failed to fetch order");
    }
  },
  deleteOrder: async (id) => {
    console.log("api", id);
    const response = await api.delete(`/order/${id}`);
    return response;
  },
};
