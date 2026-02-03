import api from "./api";

const permissionApi = {
  getPermissions: async () => api.get("/permission"),

  updateEmailPrefs: async (emailPrefs) => api.patch("/permission/email", emailPrefs),

  updateSMSPrefs: async (smsPrefs) => api.patch("/permission/sms", smsPrefs),

  updateLocationAccess: async (level) =>
    api.patch("/permission/location", { level }),

  updateDataSharing: async (newValue) =>
    api.patch("/permission/data-sharing", newValue),

  updateSocialSharing: async (socialMediaSharing) =>
    api.patch("/permission/social", { socialMediaSharing }),

  updateAccountVisibility: async (level) =>
    api.patch("/permission/visibility", { level }),

  requestDataDownload: async () => api.post("/permission/download-data"),

  scheduleAccountDeletion: async ({ password, reason }) =>
    api.post("/permission/request-deletion", { password, reason }),

  cancelAccountDeletion: async () => api.post("/permission/cancel-deletion"),
};

export default permissionApi;
