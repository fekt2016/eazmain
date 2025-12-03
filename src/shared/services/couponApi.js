// service/couponApi.js
import api from "./api";
import logger from '../utils/logger';

const couponApi = {
  applyCoupon: async (couponCode, orderAmount) => {
    logger.log("api coupon data", { couponCode, orderAmount });
    const response = await api.post("/coupon/apply", {
      couponCode,
      orderAmount,
    });
    return response.data;
  },
  applyUserCoupon: async (couponCode) => {
    logger.log("api user coupon data", couponCode);
    const response = await api.post("/coupon/apply-user-coupon", {
      couponCode,
    });
    return response.data;
  },
};

export default couponApi;
