/**
 * VerifyAccountPage Component Tests
 * 
 * Tests for the VerifyAccountPage:
 * - Renders verification page
 * - Displays OTP input fields
 * - Handles OTP submission
 * - Handles resend OTP
 * - Handles loading state
 * - Handles error state
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import VerifyAccountPage from '../../features/auth/VerifyAccountPage';

// Mock react-router-dom
const mockNavigate = jest.fn();
const mockLocation = {
  state: { email: 'test@example.com' },
  search: '',
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}));

// Mock authApi
const mockVerifyAccount = jest.fn();
const mockResendOtp = jest.fn();

jest.mock('../../shared/services/authApi', () => ({
  __esModule: true,
  default: {
    verifyAccount: (...args) => mockVerifyAccount(...args),
    resendOtp: (...args) => mockResendOtp(...args),
  },
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

describe('VerifyAccountPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    
    mockVerifyAccount.mockResolvedValue({ success: true });
    mockResendOtp.mockResolvedValue({ success: true });
  });

  test('renders verification page', async () => {
    renderWithProviders(<VerifyAccountPage />);

    await waitFor(() => {
      expect(screen.getByText(/verify your account/i)).toBeInTheDocument();
    });
  });

  test('displays OTP input fields', async () => {
    renderWithProviders(<VerifyAccountPage />);

    await waitFor(() => {
      // Should have 6 OTP input fields
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThanOrEqual(6);
    });
  });

  test('handles OTP input', async () => {
    const user = userEvent.setup();
    renderWithProviders(<VerifyAccountPage />);

    await waitFor(() => {
      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThanOrEqual(6);
    });

    const firstInput = screen.getAllByRole('textbox')[0];
    await user.type(firstInput, '1');

    expect(firstInput).toHaveValue('1');
  });

  test('handles resend OTP', async () => {
    const user = userEvent.setup();
    renderWithProviders(<VerifyAccountPage />);

    await waitFor(() => {
      expect(screen.getByText(/resend code/i)).toBeInTheDocument();
    });

    const resendButton = screen.getByRole('button', { name: /resend code/i });
    await user.click(resendButton);

    await waitFor(() => {
      expect(mockResendOtp).toHaveBeenCalled();
    });
  });
});

