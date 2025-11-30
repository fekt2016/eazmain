import api from './api';

const shippingService = {
  // Get active pickup centers
  getPickupCenters: async (city = null) => {
    const params = city ? { city } : {};
    const response = await api.get('/shipping/pickup-centers', { params });
    return response.data;
  },

  // Calculate shipping quote
  calculateShippingQuote: async (buyerCity, items, method = 'dispatch', pickupCenterId = null, deliverySpeed = 'standard') => {
    console.log("🌐 [shippingApi] calculateShippingQuote called with:", {
      buyerCity,
      itemsCount: items?.length,
      items: items,
      method,
      pickupCenterId,
      deliverySpeed,
    });
    
    console.log("🌐 [shippingApi] Making POST request to /shipping/quote...");
    const response = await api.post('/shipping/quote', {
      buyerCity,
      items,
      method,
      pickupCenterId,
      deliverySpeed, // Add delivery speed parameter
    });
    
    console.log("🌐 [shippingApi] Response received:", response);
    console.log("🌐 [shippingApi] response.data:", response.data);
    console.log("🌐 [shippingApi] Returning response.data");
    
    return response.data;
  },

  /**
   * Calculate shipping fee based on neighborhood
   * POST /api/v1/shipping/calc-shipping
   * 
   * @param {Object} data - { neighborhoodId, neighborhoodName, city, weight, shippingType }
   * @returns {Promise} Shipping calculation result
   */
  calcShipping: async (data) => {
    const response = await api.post('/shipping/calc-shipping', data);
    return response.data;
  },

  /**
   * Get shipping options for all types based on neighborhood
   * POST /api/v1/shipping/shipping-options
   * 
   * @param {Object} data - { neighborhoodId, neighborhoodName, city, weight }
   * @returns {Promise} Shipping options for standard, same_day, express
   */
  getShippingOptions: async (data) => {
    const response = await api.post('/shipping/shipping-options', data);
    return response.data;
  },
};

export default shippingService;

