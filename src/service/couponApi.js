// service/couponApi.js
import api from "./api";

const couponApi = {
  applyCoupon: async (couponCode, orderAmount) => {
    console.log("api coupon data", { couponCode, orderAmount });
    const response = await api.post("/coupon/apply", {
      couponCode,
      orderAmount,
    });
    return response.data;
  },
};

export default couponApi;
