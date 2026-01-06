import api from './api';
import logger from '../utils/logger';

const addressApi = {
  getUserAddresses: async () => {
    try {
      const response = await api.get(`/address`);
      return response;
    } catch (error) {
      logger.error("Error fetching user addresses:", error);
      throw error;
    }
  },
  getUserAddress: async () => {
    try {
      const response = await api.get(`/address`);
      logger.log("address response", response);
      return response;
    } catch (error) {
      logger.error("Error fetching user addresses:", error);
      throw error;
    }
  },

  createUserAddress: async (addressData) => {
    logger.log("api address data", addressData);
    try {
      const response = await api.post(`/address`, addressData);
      return response;
    } catch (error) {
      logger.error("Error creating user address:", error);
      throw error;
    }
  },
  updateUserAddress: async (addressData) => {
    logger.log("api address data", addressData);
    try {
      // Extract id and data from the addressData object
      const { id, data, ...rest } = addressData;
      const addressId = id || addressData.id;
      // Send only the address fields (data property or rest of the object)
      const body = data || rest;
      
      const response = await api.patch(
        `/address/${addressId}`,
        body
      );
      return response;
    } catch (error) {
      logger.error("Error updating user address:", error);
      throw error;
    }
  },
  deleteUserAddress: async (addressId) => {
    try {
      const response = await api.delete(`/address/${addressId}`);
      return response;
    } catch (error) {
      logger.error("Error deleting user address:", error);
      throw error;
    }
  },
  setDefaultAddress: async (addressId) => {
    try {
      const response = await api.patch(`/address/${addressId}/set-default`);
      return response;
    } catch (error) {
      logger.error("Error setting default address:", error);
      throw error;
    }
  },
  lookupDigitalAddress: async (digitalAddress) => {
    try {
      const response = await api.post(`/address/lookup-digital`, {
        digitalAddress,
      });
      return response.data;
    } catch (error) {
      logger.error("Error looking up digital address:", error);
      throw error;
    }
  },
  createAddressWithZone: async (addressData) => {
    try {
      const response = await api.post(`/address/create`, addressData);
      return response.data;
    } catch (error) {
      logger.error("Error creating address with zone:", error);
      throw error;
    }
  },
};

export default addressApi;
