import { useQuery } from "@tanstack/react-query";
import discountApi from '../services/discountApi';
export const UseGetDislayDiscount = () => {
  return useQuery({
    queryKey: ["discount"],
    queryFn: async () => {
      const response = await discountApi.getDisplayDiscount();
      return response;
    },
  });
};
