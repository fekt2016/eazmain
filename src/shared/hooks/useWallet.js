import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import walletApi from '../services/walletApi';

/**
 * Hook to get wallet balance
 */
export const useWalletBalance = () => {
  return useQuery({
    queryKey: ['wallet', 'balance'],
    queryFn: async () => {
      const response = await walletApi.getWalletBalance();
      return response;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 2,
  });
};

/**
 * Hook to get wallet transactions
 */
export const useWalletTransactions = (options = {}) => {
  const { page = 1, limit = 10, type = null, sortBy = 'createdAt', sortOrder = 'desc', enabled = true } = options;

  return useQuery({
    queryKey: ['wallet', 'transactions', page, limit, type, sortBy, sortOrder],
    queryFn: async () => {
      const response = await walletApi.getWalletTransactions({
        page,
        limit,
        type,
        sortBy,
        sortOrder,
      });
      return response;
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to initiate wallet top-up
 */
export const useInitiateTopup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ amount, email }) => {
      return await walletApi.initiateTopup({ amount, email });
    },
    onSuccess: () => {
      // Invalidate balance query after top-up
      queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] });
    },
  });
};

/**
 * Hook to verify top-up payment
 */
export const useVerifyTopup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reference) => {
      return await walletApi.verifyTopup(reference);
    },
    onSuccess: () => {
      // Invalidate balance and transactions after verification
      queryClient.invalidateQueries({ queryKey: ['wallet', 'balance'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'transactions'] });
    },
  });
};

// Keep old hook for backward compatibility
export const useCreditBalance = useWalletBalance;

