import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import reviewApi from '../../shared/services/reviewApi';
import logger from '../../shared/utils/logger';

export const useGetProductReviews = (productId) => {
  return useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () => await reviewApi.getProductReviews(productId),
  });
};
export const useCreateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    queryKey: ["reviews"],
    mutationFn: async (data) => {
      const res = await reviewApi.createReview(data);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      logger.log("Review created successfully!!!");
    },
    onError: (error) => {
      logger.error("Review submission failed:", error);
      alert(`Review submission failed: ${error.message}`);
    },
  });
};
