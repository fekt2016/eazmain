/**
 * Manual mock for categoryApi
 */
export const categoryService = {
  getAllCategories: jest.fn(() => Promise.resolve({ data: { results: [] } })),
};


