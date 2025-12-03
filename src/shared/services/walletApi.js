import api from './api';

const walletApi = {
  // Get wallet balance
  getWalletBalance: async () => {
    const response = await api.get('/wallet/balance');
    return response.data;
  },

  // Get wallet transactions with pagination
  getWalletTransactions: async (params = {}) => {
    const { page = 1, limit = 10, type = null, sortBy = 'createdAt', sortOrder = 'desc' } = params;
    const response = await api.get('/wallet/transactions', {
      params: {
        page,
        limit,
        type,
        sortBy,
        sortOrder,
      },
    });
    return response.data;
  },

  // Initiate top-up
  initiateTopup: async (data) => {
    const response = await api.post('/wallet/topup', data);
    return response.data;
  },

  // Verify top-up
  verifyTopup: async (reference) => {
    const response = await api.post('/wallet/verify', { reference });
    return response.data;
  },
};

export default walletApi;

