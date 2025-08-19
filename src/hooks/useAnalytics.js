import { useMutation } from "@tanstack/react-query";
import analyticsApi from "../service/analyticsApi";

export default function useAnalytics() {
  const recordProductView = useMutation({
    mutationFn: analyticsApi.recordProductView,
    onSuccess: (data) => {
      console.log("Product view recorded successfully!!!", data);
    },
    onError: (error) => {
      console.error("Product view recording failed:", error);
    },
  });

  return {
    recordProductView,
  };
}
