/**
 * Manual mock for useAddress hooks
 */
export const useGetUserAddress = jest.fn(() => ({
  data: {
    results: [
      {
        _id: 'addr1',
        streetAddress: '123 Test St',
        city: 'Accra',
        isDefault: true,
      },
    ],
  },
  isLoading: false,
}));

export const useCreateAddress = jest.fn(() => ({
  mutate: jest.fn(),
  isPending: false,
  error: null,
}));


