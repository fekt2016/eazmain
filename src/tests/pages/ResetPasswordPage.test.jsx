/**
 * ResetPasswordPage Component Tests
 * 
 * Tests for the password reset with token flow:
 * - Renders reset password form correctly with token
 * - Shows error state when no token
 * - Validates password length (min 8 characters)
 * - Validates password match
 * - Handles successful password reset
 * - Shows success state
 * - Navigates to login on success
 * - Handles API errors gracefully
 * - Shows loading state during request
 * - Button disabled when fields empty
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import ResetPasswordPage from '@/features/auth/ResetPasswordPage';

// Mock all dependencies
const mockNavigate = jest.fn();
const mockSearchParams = new URLSearchParams();
const mockSetSearchParams = jest.fn();

const mockResetPasswordWithToken = {
  mutate: jest.fn(),
  isPending: false,
  error: null,
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [mockSearchParams, mockSetSearchParams],
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}));

jest.mock('@/shared/hooks/useAuth', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    resetPasswordWithToken: mockResetPasswordWithToken,
  })),
}));

jest.mock('react-toastify', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    warn: jest.fn(),
  },
}));

jest.mock('@/shared/utils/logger', () => ({
  __esModule: true,
  default: {
    debug: jest.fn(),
    error: jest.fn(),
    log: jest.fn(),
  },
}));

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    mockResetPasswordWithToken.mutate.mockClear();
    mockResetPasswordWithToken.isPending = false;
    mockResetPasswordWithToken.error = null;
    mockSearchParams.delete('token');
    
    // Reset useAuth mock
    const useAuth = require('@/shared/hooks/useAuth').default;
    useAuth.mockReturnValue({
      resetPasswordWithToken: mockResetPasswordWithToken,
    });
  });

  test('renders reset password form correctly with token', async () => {
    mockSearchParams.set('token', 'valid-reset-token-123');
    
    renderWithProviders(<ResetPasswordPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /set new password/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/new password/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset password/i })).toBeInTheDocument();
    });
  });

  test('shows error state when no token in URL', async () => {
    // No token set in searchParams
    
    renderWithProviders(<ResetPasswordPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /invalid reset link/i })).toBeInTheDocument();
      expect(screen.getByText(/this password reset link is invalid or has expired/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /request new reset link/i })).toBeInTheDocument();
    });
  });

  test('navigates to forgot-password when no token', async () => {
    // No token set
    
    renderWithProviders(<ResetPasswordPage />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/forgot-password');
    });
  });

  test('validates password minimum length', async () => {
    const user = userEvent.setup();
    mockSearchParams.set('token', 'valid-reset-token-123');
    
    renderWithProviders(<ResetPasswordPage />);

    const newPasswordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    await user.type(newPasswordInput, 'short');
    await user.type(confirmPasswordInput, 'short');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters long/i)).toBeInTheDocument();
      expect(mockResetPasswordWithToken.mutate).not.toHaveBeenCalled();
    });
  });

  test('validates password match', async () => {
    const user = userEvent.setup();
    mockSearchParams.set('token', 'valid-reset-token-123');
    
    renderWithProviders(<ResetPasswordPage />);

    const newPasswordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    await user.type(newPasswordInput, 'password123');
    await user.type(confirmPasswordInput, 'password456');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      expect(mockResetPasswordWithToken.mutate).not.toHaveBeenCalled();
    });
  });

  test('button is disabled when fields are empty', async () => {
    mockSearchParams.set('token', 'valid-reset-token-123');
    
    renderWithProviders(<ResetPasswordPage />);

    const submitButton = screen.getByRole('button', { name: /reset password/i });
    expect(submitButton).toBeDisabled();
  });

  test('handles successful password reset', async () => {
    const user = userEvent.setup();
    let onSuccessCallback;
    mockSearchParams.set('token', 'valid-reset-token-123');
    
    mockResetPasswordWithToken.mutate.mockImplementation((data, options) => {
      onSuccessCallback = options?.onSuccess;
      setTimeout(() => {
        if (onSuccessCallback) {
          onSuccessCallback({ status: 'success' });
        }
      }, 0);
    });

    renderWithProviders(<ResetPasswordPage />);

    const newPasswordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    await user.type(newPasswordInput, 'newpassword123');
    await user.type(confirmPasswordInput, 'newpassword123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockResetPasswordWithToken.mutate).toHaveBeenCalledWith(
        {
          token: 'valid-reset-token-123',
          newPassword: 'newpassword123',
          confirmPassword: 'newpassword123',
        },
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        })
      );
    });

    // Wait for success state
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /password reset successful/i })).toBeInTheDocument();
      // Check for the more specific message in the form section
      expect(screen.getByText(/your password has been successfully reset. you can now log in/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('shows success state with navigation button', async () => {
    const user = userEvent.setup();
    let onSuccessCallback;
    mockSearchParams.set('token', 'valid-reset-token-123');
    
    mockResetPasswordWithToken.mutate.mockImplementation((data, options) => {
      onSuccessCallback = options?.onSuccess;
      setTimeout(() => {
        if (onSuccessCallback) {
          onSuccessCallback({ status: 'success' });
        }
      }, 0);
    });

    renderWithProviders(<ResetPasswordPage />);

    const newPasswordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    await user.type(newPasswordInput, 'newpassword123');
    await user.type(confirmPasswordInput, 'newpassword123');
    await user.click(submitButton);

    // Wait for success state
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /password reset successful/i })).toBeInTheDocument();
    }, { timeout: 3000 });

    // Check for navigation button
    const loginButton = screen.getByRole('button', { name: /go to login/i });
    expect(loginButton).toBeInTheDocument();
    
    await user.click(loginButton);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('handles API errors gracefully', async () => {
    const user = userEvent.setup();
    mockSearchParams.set('token', 'valid-reset-token-123');
    const mockError = { message: 'Token expired or invalid' };
    mockResetPasswordWithToken.error = mockError;

    renderWithProviders(<ResetPasswordPage />);

    await waitFor(() => {
      expect(screen.getByText(/token expired or invalid/i)).toBeInTheDocument();
    });
  });

  test('shows loading state during request', async () => {
    const user = userEvent.setup();
    mockSearchParams.set('token', 'valid-reset-token-123');
    mockResetPasswordWithToken.isPending = true;

    renderWithProviders(<ResetPasswordPage />);

    const newPasswordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    
    await user.type(newPasswordInput, 'newpassword123');
    await user.type(confirmPasswordInput, 'newpassword123');
    
    // Button should be disabled when loading
    const submitButton = screen.getByRole('button', { disabled: true });
    expect(submitButton).toBeDisabled();
  });

  test('clears password error when user starts typing', async () => {
    const user = userEvent.setup();
    mockSearchParams.set('token', 'valid-reset-token-123');
    
    renderWithProviders(<ResetPasswordPage />);

    const newPasswordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const submitButton = screen.getByRole('button', { name: /reset password/i });

    // Trigger validation error
    await user.type(newPasswordInput, 'short');
    await user.type(confirmPasswordInput, 'short');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters long/i)).toBeInTheDocument();
    });

    // Start typing in new password field - should clear error
    await user.clear(newPasswordInput);
    await user.type(newPasswordInput, 'new');

    await waitFor(() => {
      expect(screen.queryByText(/password must be at least 8 characters long/i)).not.toBeInTheDocument();
    });
  });

  test('navigates to forgot-password when request new reset link clicked', async () => {
    // No token - shows error state
    renderWithProviders(<ResetPasswordPage />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /request new reset link/i })).toBeInTheDocument();
    });

    const requestButton = screen.getByRole('button', { name: /request new reset link/i });
    await userEvent.click(requestButton);

    expect(mockNavigate).toHaveBeenCalledWith('/forgot-password');
  });
});

