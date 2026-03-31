import api from './api';

const testimonialApi = {
  getPublicTestimonials: async (params = {}) => {
    const response = await api.get('/seller/testimonials/public', { params });
    return response.data;
  },
};

export default testimonialApi;
