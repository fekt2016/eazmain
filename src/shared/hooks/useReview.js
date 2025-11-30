import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import reviewApi from '../services/reviewApi';

export const useGetProductReviews = (productId, options = {}) => {
  return useQuery({
    queryKey: ["reviews", productId],
    queryFn: async () =>{const response =  await reviewApi.getProductReviews(productId)
      console.log("response", response);
      return response
    },
    enabled: options.enabled !== false && !!productId && productId !== 'undefined' && productId !== 'null',
    ...options,
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
    onSuccess: (data, variables) => {
      // Invalidate reviews for the specific product
      queryClient.invalidateQueries({ queryKey: ["reviews", variables.product] });
      // Invalidate product data to refresh ratings
      queryClient.invalidateQueries({ queryKey: ["products", variables.product] });
      // Also invalidate all reviews queries
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      console.log("Review created successfully!!!");
    },
    onError: (error) => {
      console.error("Review submission failed:", error);
      alert(`Review submission failed: ${error.message}`);
    },
  });
};
