/**
 * Manual mock for useWishlist hooks
 */
export const useToggleWishlist = jest.fn(() => ({
  toggleWishlist: jest.fn(),
  isAdding: false,
  isRemoving: false,
  isInWishlist: false,
  isLoading: false,
}));

export const useRemoveFromWishlist = jest.fn(() => ({
  mutate: jest.fn(),
  isPending: false,
}));


