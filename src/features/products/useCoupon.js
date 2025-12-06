// hooks/useApplyCoupon.js
import { useMutation } from "@tanstack/react-query";
import couponApi from '../../shared/services/couponApi';
import logger from '../../shared/utils/logger';

export const useApplyCoupon = () => {
  return useMutation({
    mutationFn: async ({ couponCode, orderAmount }) => {
      const response = await couponApi.applyCoupon(couponCode, orderAmount);
      return response;
    },
  });
};
export const useApplyUserCoupon = () => {
  logger.log("useApplyUserCoupon called");
  return useMutation({
    mutationFn: async (couponCode) => {
      logger.log("Hook Applying coupon code:", couponCode);
      const response = await couponApi.applyUserCoupon(couponCode);
      return response;
    },
  });
};
