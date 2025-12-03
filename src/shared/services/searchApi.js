import api from './api';
import logger from '../utils/logger';

const searchApi = {
  searchProducts: async (searchTerm) => {
    const response = await api.get(
      `/search/query/${encodeURIComponent(searchTerm)}`
    );
    return response;
  },
  searchSuggestions: async (searchTerm) => {
    try {
      const response = await api.get(
        `/search/suggestions/${encodeURIComponent(searchTerm)}`
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
  searchResults: async (query) => {
    const response = await api.get(`/search/results`, { params: query });
    return response;
  },
};

export default searchApi;
