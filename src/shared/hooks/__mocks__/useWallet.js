/**
 * Manual mock for useWallet hooks
 */
export const useWalletBalance = jest.fn(() => ({
  data: {
    data: {
      wallet: {
        balance: 150,
        availableBalance: 150,
        holdAmount: 0,
      },
    },
  },
  isLoading: false,
}));


