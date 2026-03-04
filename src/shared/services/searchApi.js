import api from './api';
import logger from '../utils/logger';

const searchApi = {
  searchProducts: async (searchTerm, options = {}) => {
    const response = await api.get(
      `/search/query/${encodeURIComponent(searchTerm)}`,
      options
    );
    return response;
  },
  searchSuggestions: async (searchTerm, options = {}) => {
    try {
      const response = await api.get(
        `/search/suggestions/${encodeURIComponent(searchTerm)}`,
        options
      );
      logger.log('[searchApi] searchSuggestions response:', response);
      logger.log('[searchApi] response.data:', response.data);
      // Return the data property from axios response
      // Backend returns: { success: true, data: [...] }
      // So response.data = { success: true, data: [...] }
      return response.data;
    } catch (error) {
      logger.error('[searchApi] searchSuggestions error:', error);
      throw error;
    }
  },
  searchResults: async (query, options = {}) => {
    const response = await api.get(`/search/results`, { params: query, ...options });
    return response;
  },
};

export default searchApi;
