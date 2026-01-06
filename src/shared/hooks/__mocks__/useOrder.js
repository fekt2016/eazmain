/**
 * Manual mock for useOrder hooks
 */
export const useCreateOrder = jest.fn(() => ({
  mutate: jest.fn(),
  isPending: false,
  error: null,
}));


