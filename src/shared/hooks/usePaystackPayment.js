import paymentApi from '../services/paymentApi';
import logger from '../utils/logger';

export const usePaystackPayment = () => {
  // SECURITY: Backend calculates payment amount - frontend should NOT send amount
  const initializePaystackPayment = async ({ orderId, email }) => {
    try {
      // SECURITY: Do NOT send amount - backend calculates it from order total
      const response = await paymentApi.initializePaystack(orderId, email);
      
      // SECURITY: Validate redirect URL before returning
      const redirectUrl = response.data?.data?.authorization_url || response.data?.authorization_url;
      if (!redirectUrl) {
        throw new Error('Invalid payment response: missing redirect URL');
      }
      
      logger.log("[usePaystackPayment] Payment initialized successfully");
      return { redirectTo: redirectUrl };
    } catch (error) {
      logger.error("[usePaystackPayment] Payment initialization error:", error);
      throw error;
    }
  };

  return { initializePaystackPayment };
};

