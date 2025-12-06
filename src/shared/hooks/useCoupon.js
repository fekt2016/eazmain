// hooks/useCoupon.js
import { useQuery, useMutation } from "@tanstack/react-query";
import couponApi from '../services/couponApi';
import logger from '../utils/logger';

export const useGetMyCoupons = () => {
  return useQuery({
    queryKey: ['myCoupons'],
    queryFn: () => couponApi.getMyCoupons(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useApplyCoupon = () => {
  return useMutation({
    mutationFn: async ({ couponCode, orderAmount, productIds, categoryIds, sellerIds }) => {
      const response = await couponApi.applyCoupon({ 
        couponCode, 
        orderAmount, 
        productIds, 
        categoryIds, 
        sellerIds 
      });
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
