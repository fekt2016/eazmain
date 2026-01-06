/**
 * Manual mock for storage utility
 */
export default {
  getItem: jest.fn(() => null),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};


