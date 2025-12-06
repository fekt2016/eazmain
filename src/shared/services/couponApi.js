// service/couponApi.js
import api from "./api";
import logger from '../utils/logger';

const couponApi = {
  getMyCoupons: async () => {
    const response = await api.get("/coupon/my-coupons");
    return response.data;
  },
  applyCoupon: async ({ couponCode, orderAmount, productIds = [], categoryIds = [], sellerIds = [] }) => {
    logger.log("api coupon data", { couponCode, orderAmount, productIds, categoryIds, sellerIds });
    const response = await api.post("/coupon/apply", {
      couponCode,
      orderAmount,
      productIds,
      categoryIds,
      sellerIds,
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
