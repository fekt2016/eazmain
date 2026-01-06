/**
 * ForgotPasswordPage Component Tests
 * 
 * Tests for the unified email-only password reset flow:
 * - Renders forgot password form correctly
 * - Validates email input
 * - Handles password reset request
 * - Shows success state after submission
 * - Handles errors gracefully
 */

import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import ForgotPasswordPage from '@/features/auth/ForgotPasswordPage';

// Mock all dependencies
const mockNavigate = jest.fn();
const mockRequestPasswordReset = {
  mutate: jest.fn(),
  isPending: false,
  error: null,
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}));

jest.mock('@/shared/hooks/useAuth', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    requestPasswordReset: mockRequestPasswordReset,
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

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    mockRequestPasswordReset.mutate.mockClear();
    mockRequestPasswordReset.isPending = false;
    mockRequestPasswordReset.error = null;
    // Reset useAuth mock
    const useAuth = require('@/shared/hooks/useAuth').default;
    useAuth.mockReturnValue({
      requestPasswordReset: mockRequestPasswordReset,
    });
  });

  test('renders forgot password form correctly', async () => {
    renderWithProviders(<ForgotPasswordPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('your.email@example.com')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
      expect(screen.getByText(/enter your email address and we'll send you a link/i)).toBeInTheDocument();
    });
  });

  test('validates required fields (button disabled when empty)', async () => {
    renderWithProviders(<ForgotPasswordPage />);
    
    const submitButton = screen.getByRole('button', { name: /send reset link/i });
    expect(submitButton).toBeDisabled();
  });

  test('validates email format', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ForgotPasswordPage />);

    const emailInput = screen.getByPlaceholderText('your.email@example.com');
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockRequestPasswordReset.mutate).not.toHaveBeenCalled();
    });
  });

  test('handles password reset request successfully', async () => {
    const user = userEvent.setup();
    let onSuccessCallback;
    mockRequestPasswordReset.mutate.mockImplementation((email, options) => {
      onSuccessCallback = options?.onSuccess;
      // Call onSuccess asynchronously to simulate real behavior
      setTimeout(() => {
        if (onSuccessCallback) {
          onSuccessCallback({ status: 'success' });
        }
      }, 0);
    });

    renderWithProviders(<ForgotPasswordPage />);

    const emailInput = screen.getByPlaceholderText('your.email@example.com');
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockRequestPasswordReset.mutate).toHaveBeenCalledWith(
        'test@example.com',
        expect.objectContaining({
          onSuccess: expect.any(Function),
          onError: expect.any(Function),
        })
      );
    });

    // Should show success state - wait for "Email Sent" heading which is more specific
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /email sent/i })).toBeInTheDocument();
      expect(screen.getByText(/if an account exists with/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('shows success state with instructions', async () => {
    const user = userEvent.setup();
    let onSuccessCallback;
    mockRequestPasswordReset.mutate.mockImplementation((email, options) => {
      onSuccessCallback = options?.onSuccess;
      setTimeout(() => {
        if (onSuccessCallback) {
          onSuccessCallback({ status: 'success' });
        }
      }, 0);
    });

    renderWithProviders(<ForgotPasswordPage />);

    const emailInput = screen.getByPlaceholderText('your.email@example.com');
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    // Wait for success state - check for "Email Sent" heading
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /email sent/i })).toBeInTheDocument();
    }, { timeout: 3000 });

    // Check success state content
    expect(screen.getByText(/if an account exists with/i)).toBeInTheDocument();
    expect(screen.getByText(/what's next\?/i)).toBeInTheDocument();
    expect(screen.getByText(/check your email inbox \(and spam folder\)/i)).toBeInTheDocument();
    expect(screen.getByText(/click the reset link in the email/i)).toBeInTheDocument();
    expect(screen.getByText(/the link expires in 10 minutes/i)).toBeInTheDocument();
  });

  test('allows retry from success state', async () => {
    const user = userEvent.setup();
    let onSuccessCallback;
    mockRequestPasswordReset.mutate.mockImplementation((email, options) => {
      onSuccessCallback = options?.onSuccess;
      setTimeout(() => {
        if (onSuccessCallback) {
          onSuccessCallback({ status: 'success' });
        }
      }, 0);
    });

    renderWithProviders(<ForgotPasswordPage />);

    // Submit form
    const emailInput = screen.getByPlaceholderText('your.email@example.com');
    await user.type(emailInput, 'test@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    // Wait for success state
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /email sent/i })).toBeInTheDocument();
    }, { timeout: 3000 });

    // Click retry button
    const retryButton = screen.getByRole('button', { name: /didn't receive the email\? try again/i });
    await user.click(retryButton);

    // Should be back to form
    await waitFor(() => {
      expect(screen.getByPlaceholderText('your.email@example.com')).toBeInTheDocument();
    });
  });

  test('navigates to login from success state', async () => {
    const user = userEvent.setup();
    let onSuccessCallback;
    mockRequestPasswordReset.mutate.mockImplementation((email, options) => {
      onSuccessCallback = options?.onSuccess;
      setTimeout(() => {
        if (onSuccessCallback) {
          onSuccessCallback({ status: 'success' });
        }
      }, 0);
    });

    renderWithProviders(<ForgotPasswordPage />);

    // Submit form
    const emailInput = screen.getByPlaceholderText('your.email@example.com');
    await user.type(emailInput, 'test@example.com');
    await user.click(screen.getByRole('button', { name: /send reset link/i }));

    // Wait for success state
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /email sent/i })).toBeInTheDocument();
    }, { timeout: 3000 });

    // Click back to login button
    const backButton = screen.getByRole('button', { name: /back to login/i });
    await user.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('handles error gracefully', async () => {
    const mockError = { message: 'Network error' };
    mockRequestPasswordReset.error = mockError;

    renderWithProviders(<ForgotPasswordPage />);

    await waitFor(() => {
      // ErrorState component should display the error message
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  test('shows loading state during request', async () => {
    const user = userEvent.setup();
    mockRequestPasswordReset.isPending = true;

    renderWithProviders(<ForgotPasswordPage />);

    const emailInput = screen.getByPlaceholderText('your.email@example.com');
    
    await user.type(emailInput, 'test@example.com');
    
    // Button should be disabled when loading - find by loading state or disabled attribute
    const submitButton = screen.getByRole('button', { disabled: true });
    expect(submitButton).toBeDisabled();
  });

  test('normalizes email to lowercase', async () => {
    const user = userEvent.setup();
    mockRequestPasswordReset.mutate.mockImplementation((email, options) => {
      // Don't call onSuccess for this test - we just want to verify the email normalization
    });

    renderWithProviders(<ForgotPasswordPage />);

    const emailInput = screen.getByPlaceholderText('your.email@example.com');
    const submitButton = screen.getByRole('button', { name: /send reset link/i });

    await user.type(emailInput, 'TEST@EXAMPLE.COM');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockRequestPasswordReset.mutate).toHaveBeenCalledWith(
        'test@example.com',
        expect.any(Object)
      );
    });
  });
});
