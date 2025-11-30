import paymentApi from '../services/paymentApi';

export const usePaystackPayment = () => {
  const initializePaystackPayment = async ({ orderId, amount, email }) => {
    const response = await paymentApi.initializePaystack(orderId, amount, email);
    return { redirectTo: response.data.data.authorization_url };
  };

  return { initializePaystackPayment };
};

