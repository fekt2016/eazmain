/**
 * Axios Mock for Tests
 * 
 * Prevents real network calls in tests
 * Mocks /products, /cart, /checkout endpoints
 */

const axios = jest.requireActual('axios');

const mockAxios = {
  ...axios,
  create: jest.fn(() => mockAxios),
  get: jest.fn((url) => {
    // Mock /products endpoint
    if (url.includes('/products')) {
      return Promise.resolve({
        data: {
          status: 'success',
          results: [
            {
              _id: 'product1',
              name: 'Test Product 1',
              price: 100,
              imageCover: 'https://example.com/image1.jpg',
            },
          ],
        },
      });
    }

    // Mock /cart endpoint
    if (url.includes('/cart')) {
      return Promise.resolve({
        data: {
          status: 'success',
          data: {
            cart: {
              products: [],
            },
          },
        },
      });
    }

    // Default response
    return Promise.resolve({ data: {} });
  }),
  post: jest.fn((url) => {
    // Mock /cart endpoint (add to cart)
    if (url.includes('/cart')) {
      return Promise.resolve({
        data: {
          status: 'success',
          data: {
            cart: {
              products: [],
            },
          },
        },
      });
    }

    // Mock /checkout endpoint
    if (url.includes('/checkout')) {
      return Promise.resolve({
        data: {
          status: 'success',
          data: {
            order: {
              _id: 'order123',
              orderNumber: 'ORD-123',
            },
          },
        },
      });
    }

    // Default response
    return Promise.resolve({ data: {} });
  }),
  patch: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
};

module.exports = mockAxios;


