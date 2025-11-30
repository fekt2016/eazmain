import api from "./api";

const notificationApi = {
  getUserSettings: async () => {
    const response = await api.get("/notification-settings");
    return response.data.data;
  },
  updateSettings: async (settings) => {
    const response = await api.patch("/notification-settings", settings);
    return response;
  },
  resetToDefaults: async () => {
    const response = await api.patch("/notification-settings/reset");
    return response;
  },
};

export default notificationApi;
