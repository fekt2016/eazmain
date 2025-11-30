import api from './api';

const neighborhoodService = {
  /**
   * Search neighborhoods (autocomplete)
   * GET /api/v1/neighborhoods/search?q=query&city=city
   */
  searchNeighborhoods: async (query, city = null) => {
    const params = new URLSearchParams({ q: query });
    if (city) params.append('city', city);
    const response = await api.get(`/neighborhoods/search?${params.toString()}`);
    return response.data;
  },

  /**
   * Get neighborhoods by city
   * GET /api/v1/neighborhoods/city/:city
   */
  getNeighborhoodsByCity: async (city) => {
    const response = await api.get(`/neighborhoods/city/${city}`);
    return response.data;
  },

  /**
   * Get single neighborhood
   * GET /api/v1/neighborhoods/:id
   */
  getNeighborhood: async (id) => {
    const response = await api.get(`/neighborhoods/${id}`);
    return response.data;
  },

  /**
   * Get all neighborhoods with filters
   * GET /api/v1/neighborhoods?city=city&zone=zone&isActive=true
   */
  getAllNeighborhoods: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.city) queryParams.append('city', params.city);
    if (params.zone) queryParams.append('zone', params.zone);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);

    const queryString = queryParams.toString();
    const url = `/neighborhoods${queryString ? `?${queryString}` : ''}`;
    const response = await api.get(url);
    return response.data;
  },
};

export default neighborhoodService;

