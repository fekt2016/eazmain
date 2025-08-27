// hooks/useApplyCoupon.js
import { useMutation } from "@tanstack/react-query";
import couponApi from "../service/couponApi";

export const useApplyCoupon = () => {
  return useMutation({
    mutationFn: async ({ couponCode, orderAmount }) => {
      const response = await couponApi.applyCoupon(couponCode, orderAmount);
      return response;
    },
  });
};
export const useApplyUserCoupon = () => {
  console.log("useApplyUserCoupon called");
  return useMutation({
    mutationFn: async (couponCode) => {
      console.log("Hook Applying coupon code:", couponCode);
      const response = await couponApi.applyUserCoupon(couponCode);
      return response;
    },
  });
};
