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

  register: async (registerData) => {
    const response = await api.post("/users/signup", registerData);
    return response;
  },
  emailVerification: async (email) => {
    const response = await api.post("/users/email-verification", { email });
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
    const response = await api.patch("/users/updatePassword", passwords);
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
    const response = await api.patch("/users/updateMe", profileData);
    return response;
  },

  deactivateAccount: async () => {
    console.log("deactivateAccount");
    const response = await api.delete("/users/deleteMe");
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

  uploadAvatar: async (formData) => {
    const response = await api.patch("/users/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response;
  },
};
export default authApi;
