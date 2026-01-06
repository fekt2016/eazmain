/**
 * Manual mock for useAnalytics hook
 */
export default jest.fn(() => ({
  recordProductView: {
    mutate: jest.fn(),
  },
}));


