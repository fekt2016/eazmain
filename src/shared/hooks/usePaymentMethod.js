import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import paymentMethodApi from '../services/paymentMethodApi';
import logger from '../utils/logger';

export const useCreatePaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentMethodData) => {
      const response = await paymentMethodApi.createPaymentMethod(
        paymentMethodData
      );
      return response;
    },
    onSuccess: (data) => {
      logger.log("payment method created successfully!!!", data);
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
    },
  });
};

export const useGetPaymentMethod = (paymentMethodId) => {
  return useQuery({
    queryKey: ["paymentMethod", paymentMethodId],
    queryFn: async () => {
      const response = await paymentMethodApi.getPaymentMethod(paymentMethodId);
      return response;
    },
    enabled: !!paymentMethodId, // Only run if paymentMethodId exists
  });
};

export const useGetPaymentMethods = () => {
  return useQuery({
    queryKey: ["paymentMethods"],
    queryFn: async () => {
      const response = await paymentMethodApi.getPaymentMethods();
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
};

export const useUpdatePaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const response = await paymentMethodApi.updatePaymentMethod(id, data);
      return response;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
      queryClient.invalidateQueries({
        queryKey: ["paymentMethod", variables.id],
      });
    },
  });
};

export const useDeletePaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentMethodId) => {
      const response = await paymentMethodApi.deletePaymentMethod(
        paymentMethodId
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
    },
  });
};

export const useSetDefaultPaymentMethod = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentMethodId) => {
      const response = await paymentMethodApi.setDefaultPaymentMethod(
        paymentMethodId
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
    },
  });
};

export const useGetDefaultPaymentMethod = () => {
  return useQuery({
    queryKey: ["defaultPaymentMethod"],
    queryFn: async () => {
      const response = await paymentMethodApi.getDefaultPaymentMethod();
      return response;
    },
  });
};

export const useGetPaymentMethodsByUserId = () => {
  return useQuery({
    queryKey: ["paymentMethodsByUserId"],
    queryFn: async () => {
      const response = await paymentMethodApi.getPaymentMethodsByUserId();
      return response;
    },
  });
};

export const useGetPaymentMethodsBySellerId = () => {
  return useQuery({
    queryKey: ["paymentMethodsBySellerId"],
    queryFn: async () => {
      const response = await paymentMethodApi.getPaymentMethodsBySellerId();
      return response;
    },
  });
};

export const useGetPaymentMethodsByBuyerId = () => {
  return useQuery({
    queryKey: ["paymentMethodsByBuyerId"],
    queryFn: async () => {
      const response = await paymentMethodApi.getPaymentMethodsByBuyerId();
      return response;
    },
  });
};
