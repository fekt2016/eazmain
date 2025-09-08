import { useQuery } from "@tanstack/react-query";
import discountApi from "../service/discountApi";
export const UseGetDislayDiscount = () => {
  return useQuery({
    queryKey: ["discount"],
    queryFn: async () => {
      const response = await discountApi.getDisplayDiscount();
      return response;
    },
  });
};
