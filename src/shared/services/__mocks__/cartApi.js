/**
 * Manual mock for cartApi
 */
export default {
  getCart: jest.fn(() => Promise.resolve({
    data: {
      status: 'success',
      data: {
        cart: {
          products: [],
        },
      },
    },
  })),
  addToCart: jest.fn(() => Promise.resolve({
    data: {
      status: 'success',
      data: {
        cart: {
          products: [],
        },
      },
    },
  })),
  updateCartItem: jest.fn(() => Promise.resolve({})),
  removeCartItem: jest.fn(() => Promise.resolve({})),
  clearCart: jest.fn(() => Promise.resolve({})),
};


