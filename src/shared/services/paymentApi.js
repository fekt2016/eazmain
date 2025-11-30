import api from './api';

const paymentApi = {
  initializePaystack: async (orderId, amount, email) => {
    const response = await api.post('/payment/paystack/initialize', {
      orderId,
      amount,
      email,
    });
    return response;
  },
  verifyPaystackPayment: async (reference, orderId) => {
    const response = await api.get('/payment/paystack/verify', {
      params: {
        reference,
        ...(orderId && { orderId }),
      },
    });
    return response;
  },
};

export default paymentApi;

