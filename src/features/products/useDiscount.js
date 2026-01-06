import { useQuery } from "@tanstack/react-query";
import discountApi from '../../shared/services/discountApi';

export const useGetDisplayDiscount = () => {
  return useQuery({
    queryKey: ["discount"],
    queryFn: async () => {
      const response = await discountApi.getDisplayDiscount();
      return response;
    },
  });
};
