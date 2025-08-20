import api from "./api";

const authApi = {
  sendOtp: async (loginId) => {
    const response = await api.post("/users/send-otp", { loginId });
    return response;
  },

  verifyOtp: async (loginId, otp, password) => {
    const response = api.post("/users/verify-otp", { loginId, otp, password });
    return response;
  },

  register: async (userData) => {
    const response = await api.post("/users/signup", userData);
    return response;
  },

  logout: async () => {
    const response = await api.post("/users/logout");
    return response;
  },

  getCurrentUser: async () => {
    const response = await api.get("/users/me");
    return response;
  },

  forgotPassword: async (email) => {
    const response = await api.post("/users/forgot-password", { email });
    return response;
  },

  resetPassword: async ({ token, password }) => {
    const response = await api.post(`/users/reset-password/${token}`, {
      password,
    });
    return response;
  },

  changePassword: async (passwords) => {
    const response = await api.post("/users/change-password", passwords);
    return response;
  },
  getProfile: async () => {
    try {
      const response = await api.get("/users/profile");
      return response; // Return only the data payload
    } catch (err) {
      console.log("API getProfile error", err);
      throw err; // Important for React Query error handling
    }
  },
  updateProfile: async (profileData) => {
    const response = await api.put("/users/profile", profileData);
    return response;
  },

  deactivateAccount: async () => {
    const response = await api.post("/users/deactivate");
    return response;
  },

  becomeSeller: async (sellerData) => {
    const response = await api.post("/users/become-seller", sellerData);
    return response;
  },
  getActiveSessions: async () => {
    const response = await api.get("/users/sessions");
    return response;
  },
  revokeSession: async (sessionId) => {
    const response = await api.delete(`/users/sessions/${sessionId}`);
    return response;
  },
  enableTwoFactor: async () => {
    const response = await api.post("/users/two-factor/enable");
    return response;
  },
  verifyTwoFactor: async (token) => {
    const response = await api.post("/users/two-factor/verify", { token });
    return response;
  },
  disableTwoFactor: async () => {
    const response = await api.post("/users/two-factor/disable");

    return response;
  },
  uploadAvatar: async (formData) => {
    const response = await api.post("/users/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  },
};
export default authApi;
