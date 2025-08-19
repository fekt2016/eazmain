import api from "../service/api";

const addressApi = {
  getUserAddresses: async () => {
    try {
      const response = await api.get(`/address`);
      return response;
    } catch (error) {
      console.error("Error fetching user addresses:", error);
      throw error;
    }
  },
  getUserAddress: async (id) => {
    console.log("id", id);
    try {
      const response = await api.get(`/address/${id}`);
      return response;
    } catch (error) {
      console.error("Error fetching user addresses:", error);
      throw error;
    }
  },

  createUserAddress: async (addressData) => {
    console.log("api address data", addressData);
    try {
      const response = await api.post(`/address`, addressData);
      return response;
    } catch (error) {
      console.error("Error creating user address:", error);
      throw error;
    }
  },
  updateUserAddress: async (addressData) => {
    console.log("api address data", addressData);
    try {
      const response = await api.patch(
        `/address/${addressData.id}`,
        addressData
      );
      return response;
    } catch (error) {
      console.error("Error updating user address:", error);
      throw error;
    }
  },
  deleteUserAddress: async (addressId) => {
    try {
      const response = await api.delete(`/address/${addressId}`);
      return response;
    } catch (error) {
      console.error("Error deleting user address:", error);
      throw error;
    }
  },
};

export default addressApi;
