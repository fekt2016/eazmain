import api from './api';
import logger from '../utils/logger';

const authApi = {
  sendOtp: async (loginId) => {
    const response = await api.post("/users/send-otp", { loginId });
    return response;
  },

  verifyOtp: async (loginId, otp, password, redirectTo = '/') => {
    try {
      logger.log("[authApi] verifyOtp called with:", { loginId, otp: otp ? '***' : 'missing', password: password ? '***' : 'missing', redirectTo });
      const response = await api.post("/users/verify-otp", {
        loginId,
        otp,
        password,
        redirectTo,
      });
      logger.log("[authApi] verifyOtp response:", response);
      return response;
    } catch (error) {
      logger.error("[authApi] verifyOtp error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config,
      });
      throw error;
    }
  },

  register: async (registerData) => {
    const response = await api.post("/users/signup", registerData);
    return response;
  },
  emailVerification: async (email) => {
    const response = await api.post("/users/email-verification", { email });
    return response;
  },
  
  // ✅ New: Verify account with OTP (for signup verification)
  verifyAccount: async (email, phone, otp) => {
    const response = await api.post("/users/verify-account", { email, phone, otp });
    return response.data;
  },
  
  // ✅ New: Resend OTP
  resendOtp: async (email, phone) => {
    const response = await api.post("/users/resend-otp", { email, phone });
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/users/logout");
    return response;
  },

  getCurrentUser: async () => {
    const response = await api.get("/users/me");
    return response;
  },

  sendPasswordResetOtp: async (loginId) => {
    const response = await api.post("/users/forgot-password", { loginId });
    return response.data;
  },
  verifyPasswordResetOtp: async (loginId, otp) => {
    const response = await api.post("/users/verify-reset-otp", {
      loginId,
      otp,
    });
    return response.data;
  },

  resetPassword: async (loginId, newPassword, resetToken = null) => {
    const payload = { loginId, newPassword };
    if (resetToken) {
      payload.resetToken = resetToken;
    }
    const response = await api.post("/users/reset-password", payload);
    return response.data;
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
      logger.log("API getProfile error", err);
      throw err; // Important for React Query error handling
    }
  },
  updateProfile: async (profileData) => {
    const response = await api.patch("/users/updateMe", profileData);
    return response;
  },

  deactivateAccount: async () => {
    logger.log("deactivateAccount");
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
