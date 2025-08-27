import { useQuery } from "@tanstack/react-query";
import creditBalanceApi from "../service/creditbalanceApi";

export const useCreditBalance = () => {
  return useQuery({
    queryKey: ["creditbalance"],
    queryFn: async () => {
      const response = await creditBalanceApi.getCreditBalance();
      return response;
    },
  });
};
