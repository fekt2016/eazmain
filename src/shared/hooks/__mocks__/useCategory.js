/**
 * Manual mock for useCategory hook
 */
export default jest.fn(() => ({
  getCategories: {
    data: {
      results: [
        {
          _id: 'cat1',
          name: 'Electronics',
          image: 'https://example.com/cat1.jpg',
        },
        {
          _id: 'cat2',
          name: 'Clothing',
          image: 'https://example.com/cat2.jpg',
        },
      ],
    },
    isLoading: false,
    isError: false,
  },
}));


