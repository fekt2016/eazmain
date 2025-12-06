import api from './api';
import logger from '../utils/logger';

// SECURITY: Validate Paystack redirect URL to prevent open redirect attacks
const isValidPaystackUrl = (url) => {
  try {
    const parsed = new URL(url);
    // Only allow Paystack domains
    return parsed.hostname === 'paystack.com' || 
           parsed.hostname.endsWith('.paystack.com') ||
           parsed.hostname === 'checkout.paystack.com';
  } catch {
    return false;
  }
};

const paymentApi = {
  // SECURITY: Backend calculates payment amount - frontend should NOT send amount
  initializePaystack: async (orderId, email) => {
    try {
      // SECURITY: Do NOT send amount from frontend - backend calculates it from order
      const response = await api.post("/payment/initialize-paystack", {
        orderId,
        email,
        // amount is NOT sent - backend calculates from order total
      });
      
      // SECURITY: Validate redirect URL before returning
      const redirectUrl = response.data?.data?.authorization_url || response.data?.authorization_url;
      if (redirectUrl && !isValidPaystackUrl(redirectUrl)) {
        logger.error("[paymentApi] Invalid Paystack redirect URL:", redirectUrl);
        throw new Error('Invalid payment redirect URL. Please contact support.');
      }
      
      return response.data;
    } catch (error) {
      logger.error("[paymentApi] Payment initialization error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  },
};

export default paymentApi;
