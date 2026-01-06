/**
 * Manual mock for useAuth hook
 */
export default jest.fn(() => ({
  isAuthenticated: true,
  isLoading: false,
  user: {
    _id: 'user123',
    email: 'test@example.com',
  },
  login: jest.fn(),
  logout: jest.fn(),
}));

