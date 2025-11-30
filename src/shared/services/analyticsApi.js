import api from "./api";

const analyticsApi = {
  recordProductView: async ({ productId, sessionId }) => {
    const response = await api.post(`/analytics/views`, {
      productId,
      sessionId,
    });
    return response.data;
  },
};

export default analyticsApi;
