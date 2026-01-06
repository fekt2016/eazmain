/**
 * Manual mock for useProduct hook
 */
export default jest.fn(() => ({
  getProducts: {
    data: {
      results: [
        {
          _id: '1',
          name: 'Test Product 1',
          price: 100,
          imageCover: 'https://example.com/image1.jpg',
          featured: true,
        },
        {
          _id: '2',
          name: 'Test Product 2',
          price: 200,
          imageCover: 'https://example.com/image2.jpg',
          promoted: true,
        },
      ],
    },
    isLoading: false,
  },
  useGetProductById: jest.fn(() => ({
    data: null,
    isLoading: false,
  })),
}));


