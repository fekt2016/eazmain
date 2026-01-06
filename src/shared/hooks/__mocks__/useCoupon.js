/**
 * Manual mock for useCoupon hooks
 */
export const useApplyCoupon = jest.fn(() => ({
  mutate: jest.fn(),
  isPending: false,
  error: null,
}));


