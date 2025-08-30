import api from "./api";

const searchApi = {
  searchProducts: async (searchTerm) => {
    console.log("searchProducts called with searchTerm:", searchTerm);
    // Use route parameter instead of query parameter
    console;
    const response = await api.get(`/search/${encodeURIComponent(searchTerm)}`);
    console.log("searchProducts response:", response);
    return response;
  },
  searchSuggestions: (searchTerm) => {
    return api.get(`/search/suggestions/${encodeURIComponent(searchTerm)}`);
  },
};

export default searchApi;
