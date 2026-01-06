/**
 * Manual mock for useCart hooks
 */
export const useCartActions = jest.fn(() => ({
  addToCart: jest.fn(),
  updateCartItem: jest.fn(),
  removeCartItem: jest.fn(),
  clearCart: jest.fn(),
  isAdding: false,
}));

export const useGetCart = jest.fn(() => ({
  data: {
    data: {
      cart: {
        products: [
          {
            _id: 'item1',
            product: {
              _id: 'product1',
              name: 'Test Product',
              price: 100,
            },
            quantity: 2,
          },
        ],
      },
    },
  },
  isLoading: false,
}));

export const useCartTotals = jest.fn(() => ({
  total: 200, // Order total
  subTotal: 200,
}));

export const getCartStructure = jest.fn((data) => data);

