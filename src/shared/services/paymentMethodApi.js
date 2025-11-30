import api from "./api";

const paymentMethodApi = {
  getPaymentMethods: async () => {
    try {
      const response = await api.get("/paymentmethod");
      return response.data;
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      throw error;
    }
  },
  createPaymentMethod: async (paymentMethodData) => {
    try {
      const response = await api.post("/paymentmethod", paymentMethodData);
      return response.data;
    } catch (error) {
      console.error("Error creating payment method:", error);
      throw error;
    }
  },
  deletePaymentMethod: async (paymentMethodId) => {
    try {
      const response = await api.delete(`/paymentmethod/${paymentMethodId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting payment method:", error);
      throw error;
    }
  },
  updatePaymentMethod: async (paymentMethodId, paymentMethodData) => {
    try {
      const response = await api.patch(
        `/paymentmethod/${paymentMethodId}`,
        paymentMethodData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating payment method:", error);
      throw error;
    }
  },
  getPaymentMethod: async (paymentMethodId) => {
    try {
      const response = await api.get(`/paymentmethod/${paymentMethodId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching payment method:", error);
      throw error;
    }
  },
  getDefaultPaymentMethod: async () => {
    try {
      const response = await api.get("/paymentmethod/default");
      return response.data;
    } catch (error) {
      console.error("Error fetching default payment method:", error);
      throw error;
    }
  },
  setDefaultPaymentMethod: async (paymentMethodId) => {
    console.log(paymentMethodId);
    try {
      const response = await api.patch(
        `/paymentmethod/set-default/${paymentMethodId}`,
        {
          paymentMethodId,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error setting default payment method:", error);
      throw error;
    }
  },
};

export default paymentMethodApi;
