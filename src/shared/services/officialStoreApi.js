import api from './api';
import logger from '../utils/logger';

export const officialStoreService = {
  // Get all Official Store products (public endpoint)
  getOfficialStoreProducts: async () => {
    try {
      // Use public endpoint for homepage display
      const response = await api.get('/product/eazshop');
      return response.data;
    } catch (error) {
      logger.error('Error fetching Official Store products:', error);
      // Return empty array on error to prevent homepage crash
      return { data: { products: [] }, results: 0 };
    }
  },

  // Get Official Store orders (for admin)
  getOfficialStoreOrders: async () => {
    try {
      const response = await api.get('/eazshop/orders');
      return response.data;
    } catch (error) {
      logger.error('Error fetching Official Store orders:', error);
      throw error;
    }
  },

  // Get Official Store shipping fees
  getOfficialStoreShippingFees: async () => {
    try {
      const response = await api.get('/eazshop/shipping-fees');
      return response.data;
    } catch (error) {
      logger.error('Error fetching Official Store shipping fees:', error);
      throw error;
    }
  },

  // Update Official Store shipping fees (admin only)
  updateOfficialStoreShippingFees: async (fees) => {
    try {
      const response = await api.patch('/eazshop/shipping-fees', fees);
      return response.data;
    } catch (error) {
      logger.error('Error updating Official Store shipping fees:', error);
      throw error;
    }
  },

  // Get pickup centers
  getPickupCenters: async (city) => {
    try {
      const params = city ? { city } : {};
      const response = await api.get('/eazshop/pickup-centers', { params });
      return response.data;
    } catch (error) {
      logger.error('Error fetching pickup centers:', error);
      throw error;
    }
  },
};

