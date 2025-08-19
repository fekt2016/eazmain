import api from "./api";

const reviewApi = {
  getProductReviews: (productId) => api.get(`/product/${productId}/reviews`),
  get: (id) => api.get(`/review/${id}`),
  createReview: (data) => {
    console.log("api data", data);
    return api.post("/review", data);
  },
  update: (id, data) => api.put(`/review/${id}`, data),
  delete: (id) => api.delete(`/review/${id}`),
};

export default reviewApi;
