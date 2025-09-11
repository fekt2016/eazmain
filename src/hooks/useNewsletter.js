import { useMutation } from "@tanstack/react-query";
import newsletterApi from "../service/newsletterApi";

export const useNewsletter = () => {
  return useMutation({
    mutationFn: async (email) => {
      const response = await newsletterApi.subscribe(email);
      return response;
    },
  });
};
