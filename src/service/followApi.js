import api from "./api";

const followApi = {
  followSeller: async (sellerId) => {
    console.log("[API] Following seller:", sellerId);
    try {
      const response = await api.post(`/follow/${sellerId}`);
      console.log("[API] Follow success:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "[API] Follow error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  unfollowSeller: async (sellerId) => {
    console.log("[API] Unfollowing seller:", sellerId);
    try {
      const response = await api.delete(`/follow/${sellerId}`);
      console.log("[API] Unfollow success:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "[API] Unfollow error:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
  getFollowedShops: async () => {
    try {
      const response = await api.get("/follow");
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to get followed shops"
      );
    }
  },
  getSellerFollowers: async (sellerId) => {
    console.log("[API] Getting seller followers:", sellerId);
    try {
      const response = await api.get(`/follow/${sellerId}/followers`);
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Failed to get seller followers"
      );
    }
  },
  getFollowStatus: async (sellerId) => {
    try {
      const response = await api.get(`/follow/status/${sellerId}`);
      console.log("[API] Follow status:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "[API] Follow status error:",
        error.response?.data || error.message
      );
      throw new Error(
        error.response?.data?.message || "Failed to get follow status"
      );
    }
  },
};

export default followApi;
