import { useMutation } from "@tanstack/react-query";
import analyticsApi from '../../shared/services/analyticsApi';
import logger from '../../shared/utils/logger';

export default function useAnalytics() {
  const recordProductView = useMutation({
    mutationFn: analyticsApi.recordProductView,
    onSuccess: (data) => {
      logger.log("Product view recorded successfully!!!", data);
    },
    onError: (error) => {
      logger.error("Product view recording failed:", error);
    },
  });

  return {
    recordProductView,
  };
}
