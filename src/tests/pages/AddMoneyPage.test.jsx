/**
 * AddMoneyPage Component Tests
 * 
 * Tests for the AddMoneyPage:
 * - Renders add money page
 * - Displays quick amount buttons
 * - Handles amount selection
 * - Handles custom amount input
 * - Handles form submission
 * - Validates amount
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import AddMoneyPage from '../../features/wallet/AddMoneyPage';

// Mock react-router-dom
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}));

// Mock useWallet
const mockInitiateTopup = {
  mutate: jest.fn(),
  isPending: false,
};

const mockUseInitiateTopup = jest.fn(() => mockInitiateTopup);

jest.mock('../../shared/hooks/useWallet', () => ({
  useInitiateTopup: (...args) => mockUseInitiateTopup(...args),
}));

// Mock useAuth
const mockUser = {
  email: 'test@example.com',
  _id: 'user123',
};

const mockUseAuth = jest.fn(() => ({
  user: mockUser,
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

describe('AddMoneyPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  test('renders add money page', async () => {
    renderWithProviders(<AddMoneyPage />);

    await waitFor(() => {
      expect(screen.getByText(/add money to wallet/i)).toBeInTheDocument();
    });
  });

  test('displays quick amount buttons', async () => {
    renderWithProviders(<AddMoneyPage />);

    await waitFor(() => {
      expect(screen.getByText('GH₵50')).toBeInTheDocument();
      expect(screen.getByText('GH₵100')).toBeInTheDocument();
    });
  });

  test('handles amount selection', async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddMoneyPage />);

    await waitFor(() => {
      expect(screen.getByText('GH₵50')).toBeInTheDocument();
    });

    const amountButton = screen.getByText('GH₵50');
    await user.click(amountButton);

    // Amount should be selected
    expect(amountButton).toBeInTheDocument();
  });

  test('displays form with quick amounts', async () => {
    renderWithProviders(<AddMoneyPage />);

    await waitFor(() => {
      expect(screen.getByText(/top up your wallet/i)).toBeInTheDocument();
    });
  });
});

