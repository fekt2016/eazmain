import api from "./api";

const permissionApi = {
  getPermissions: async () => {
    const response = await api.get("/permission");

    return response;
  },
  updateEmailPrefs: async (emailPrefs) => {
    const response = await api.patch("/permission/email", emailPrefs);

    return response;
  },
  updateSMSPrefs: async (smsPrefs) => {
    const response = await api.patch("/permission/sms", smsPrefs);
    return response;
  },
  updateLocationAccess: async (level) => {
    // Send as object with level property
    const response = await api.patch("/permission/location", { level });
    return response;
  },
  updateDataSharing: async (newValue) => {
    const response = await api.patch("/permission/data-sharing", newValue);
    return response;
  },
  updateSocialSharing: async (socialMediaSharing) => {
    // Send with correct property name: socialMediaSharing
    const response = await api.patch("/permission/social", {
      socialMediaSharing,
    });
    return response;
  },
  updateAccountVisibility: async (level) => {
    const response = await api.patch("/permission/visibility", { level });
    return response;
  },
  requestDataDownload: async () => {
    const response = await api.post("/permission/download-data");
    return response;
  },
  scheduleAccountDeletion: async ({ password, reason }) => {
    const response = await api.post("/permission/request-deletion", {
      password,
      reason,
    });
    return response;
  },
};

export default permissionApi;
