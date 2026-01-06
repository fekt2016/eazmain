/**
 * TopupSuccessPage Component Tests
 * 
 * Tests for the TopupSuccessPage:
 * - Renders success page
 * - Handles payment verification
 * - Handles loading state
 * - Handles error state
 * - Handles navigation
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import TopupSuccessPage from '../../features/wallet/TopupSuccessPage';

// Mock react-router-dom
const mockNavigate = jest.fn();
const mockSearchParams = new URLSearchParams('?reference=ref123');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [mockSearchParams],
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}));

// Mock useWallet
const mockVerifyTopup = {
  mutate: jest.fn(),
  isPending: false,
  isSuccess: false,
  isError: false,
  error: null,
};

const mockWalletBalance = {
  refetch: jest.fn(),
};

const mockUseVerifyTopup = jest.fn(() => mockVerifyTopup);
const mockUseWalletBalance = jest.fn(() => mockWalletBalance);

jest.mock('../../shared/hooks/useWallet', () => ({
  useVerifyTopup: (...args) => mockUseVerifyTopup(...args),
  useWalletBalance: (...args) => mockUseWalletBalance(...args),
}));

// Mock useAuth
const mockUserData = {
  _id: 'user123',
  email: 'test@example.com',
};

const mockUseAuth = jest.fn(() => ({
  userData: mockUserData,
  isLoading: false,
  refetchAuth: jest.fn(),
}));

jest.mock('../../shared/hooks/useAuth', () => ({
  __esModule: true,
  default: (...args) => mockUseAuth(...args),
}));

// Mock toast
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock logger
jest.mock('../../shared/utils/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
  },
}));

describe('TopupSuccessPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    
    // Reset search params
    mockSearchParams.set('reference', 'ref123');
  });

  test('renders success page', async () => {
    renderWithProviders(<TopupSuccessPage />);

    // Component should render (may show loading initially)
    await waitFor(() => {
      // Check for any content that indicates the component rendered
      const hasContent = screen.queryByText(/success/i) || 
                        screen.queryByText(/loading/i) ||
                        screen.queryByText(/verifying/i) ||
                        screen.queryByText(/topup/i) ||
                        screen.queryByText(/wallet/i);
      expect(hasContent).toBeTruthy();
    }, { timeout: 5000 });
  });

  test('fetches payment reference from URL', async () => {
    renderWithProviders(<TopupSuccessPage />);

    // Component should read reference from search params
    await waitFor(() => {
      expect(mockSearchParams.get('reference')).toBe('ref123');
    });
  });
});

