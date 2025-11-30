import api from './api';

/**
 * Shipping Calculation API Service
 * Handles shipping fee calculations
 */
const shippingCalculationService = {
  /**
   * Calculate shipping fee
   * POST /api/v1/shipping/calculate
   * @param {Object} params - Calculation parameters
   * @param {Number} params.weight - Total weight in kg
   * @param {String} params.shippingType - 'same_day' or 'standard'
   * @param {String} params.zone - Zone ID ('A', 'B', or 'C')
   * @param {String} params.orderTime - ISO date string
   * @param {Array} params.items - Cart items (optional, for weight calculation)
   * @param {String} params.buyerCity - Buyer's city (optional, for zone detection)
   * @returns {Promise<Object>} Shipping calculation result
   */
  calculateShipping: async ({ weight, shippingType, zone, orderTime, items, buyerCity }) => {
    const response = await api.post('/shipping/calculate', {
      weight,
      shippingType,
      zone,
      orderTime: orderTime || new Date().toISOString(),
      items,
      buyerCity,
    });
    return response.data;
  },

  /**
   * Get all shipping options for a location
   * GET /api/v1/shipping/options
   * @param {Object} params - Query parameters
   * @param {String} params.city - Buyer's city
   * @param {Number} params.weight - Total weight in kg
   * @param {Array} params.items - Cart items (optional)
   * @returns {Promise<Object>} Shipping options with fees
   */
  getShippingOptions: async ({ city, weight, items }) => {
    const params = {};
    if (city) params.city = city;
    if (weight) params.weight = weight;
    if (items) params.items = JSON.stringify(items);
    
    const response = await api.get('/shipping/options', { params });
    return response.data;
  },
};

export default shippingCalculationService;

