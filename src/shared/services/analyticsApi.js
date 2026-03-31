import api from "./api";

const analyticsApi = {
  recordProductView: async ({ productId, sessionId }) => {
    const response = await api.post(`/analytics/views`, {
      productId,
      sessionId,
    });
    return response.data;
  },
  recordScreenView: async ({ screen, sessionId }) => {
    const response = await api.post('/analytics/screen-views', {
      screen,
      sessionId,
    });
    return response.data;
  },
};

export default analyticsApi;
