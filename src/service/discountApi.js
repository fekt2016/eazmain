import api from "./api";

const discountApi = {
  getDisplayDiscount: async () => {
    const response = await api.get("/discount");
    return response.data;
  },
};

export default discountApi;
