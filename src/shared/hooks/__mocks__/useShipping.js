/**
 * Manual mock for useShipping hooks
 */
export const useGetPickupCenters = jest.fn(() => ({
  data: [],
  isLoading: false,
}));

export const useCalculateShippingQuote = jest.fn(() => ({
  mutate: jest.fn(),
  isPending: false,
}));


