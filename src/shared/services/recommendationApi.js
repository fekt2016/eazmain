import api from './api';

const recommendationService = {
  // Get related products
  getRelatedProducts: async (productId, limit = 10) => {
    const response = await api.get(`/recommendations/products/${productId}/related`, {
      params: { limit },
    });
    return response.data;
  },

  // Get also bought products
  getAlsoBought: async (productId, limit = 10) => {
    const response = await api.get(`/recommendations/products/${productId}/also-bought`, {
      params: { limit },
    });
    return response.data;
  },

  // Get AI similar products
  getAISimilar: async (productId, limit = 10) => {
    const response = await api.get(`/recommendations/products/${productId}/ai-similar`, {
      params: { limit },
    });
    return response.data;
  },

  // Get personalized recommendations
  getPersonalized: async (userId, limit = 10) => {
    const response = await api.get(`/recommendations/users/${userId}/personalized`, {
      params: { limit },
    });
    return response.data;
  },

  // Get recently viewed
  getRecentlyViewed: async (userId, limit = 10) => {
    const response = await api.get(`/recommendations/users/${userId}/recently-viewed`, {
      params: { limit },
    });
    return response.data;
  },

  // Get trending products
  getTrending: async (limit = 10) => {
    const response = await api.get('/recommendations/products/trending', {
      params: { limit },
    });
    return response.data;
  },

  // Track user activity
  trackActivity: async (productId, action, metadata = {}) => {
    const response = await api.post('/recommendations/track', {
      productId,
      action,
      metadata,
    });
    return response.data;
  },
};

export default recommendationService;

