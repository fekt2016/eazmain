/**
 * Manual mock for productApi
 */
export const productService = {
  getAllProducts: jest.fn(() => Promise.resolve({ data: { results: [] } })),
  getProductById: jest.fn(() => Promise.resolve({ data: {} })),
};


