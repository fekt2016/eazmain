import api from './api';

const searchApi = {
  searchProducts: async (searchTerm) => {
    const response = await api.get(
      `/search/query/${encodeURIComponent(searchTerm)}`
    );
    return response;
  },
  searchSuggestions: async (searchTerm) => {
    return await api.get(
      `/search/suggestions/${encodeURIComponent(searchTerm)}`
    );
  },
  searchResults: async (query) => {
    const response = await api.get(`/search/results`, { params: query });
    return response;
  },
};

export default searchApi;
