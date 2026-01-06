/**
 * Manual mock for useCartValidation hook
 */
export const useValidateCart = jest.fn(() => ({
  mutate: jest.fn(),
  isPending: false,
}));


