import api from './api';

const unwrap = (response) => response?.data?.data || response?.data || {};

const tryEndpoints = async (requests) => {
  let lastError;
  for (const request of requests) {
    try {
      return await request();
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
};

const promoApi = {
  async getActivePromos(params = {}) {
    return tryEndpoints([
      async () => unwrap(await api.get('/promos/active', { params })),
      async () => unwrap(await api.get('/promos/public', { params })),
      async () => unwrap(await api.get('/promos', { params: { ...params, status: 'active' } })),
    ]);
  },

  async getPromoById(promoId) {
    return tryEndpoints([
      async () => unwrap(await api.get(`/promos/${promoId}`)),
      async () => unwrap(await api.get(`/offers/${promoId}`)),
    ]);
  },

  async getPromoProducts(promoId, params = {}) {
    return tryEndpoints([
      async () => unwrap(await api.get(`/promos/${promoId}/products`, { params })),
      async () => unwrap(await api.get('/product', { params: { ...params, promoId } })),
      async () => unwrap(await api.get('/product', { params: { ...params, promotionKey: promoId } })),
    ]);
  },
};

export default promoApi;
