/**
 * LoginPage Component Tests
 * 
 * Tests:
 * - Renders login form with email and password fields
 * - Validates email format before submission
 * - Validates password is required
 * - Handles successful login
 * - Handles 2FA flow
 * - Handles login errors
 * - Sanitizes user input
 * - Redirects after successful login
 * - Handles OTP flow if needed
 */

import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import { toast as mockToast } from 'react-toastify';
import storage from '@/shared/utils/storage';
import LoginPage from '@/features/auth/loginPage';

// Mock react-router-dom
const mockNavigate = jest.fn();
const mockSearchParams = new URLSearchParams();
const mockSetSearchParams = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [mockSearchParams, mockSetSearchParams],
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}));

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
  },
}));

// Mock useAuth hook
const mockLoginMutation = jest.fn();
const mockVerify2FALoginMutation = jest.fn();
const mockSendOtpMutation = jest.fn();
const mockVerifyOtpMutation = jest.fn();

const mockUseAuth = jest.fn(() => ({
  login: {
    mutate: mockLoginMutation,
    isPending: false,
    error: null,
  },
  verify2FALogin: {
    mutate: mockVerify2FALoginMutation,
    isPending: false,
    error: null,
  },
  sendOtp: {
    mutate: mockSendOtpMutation,
    isPending: false,
    error: null,
  },
  verifyOtp: {
    mutate: mockVerifyOtpMutation,
    isPending: false,
    error: null,
  },
}));

jest.mock('@/shared/hooks/useAuth', () => ({
  __esModule: true,
  default: (...args) => mockUseAuth(...args),
}));

// Mock useMergeWishlists
const mockMergeWishlists = jest.fn();
jest.mock('@/shared/hooks/useWishlist', () => ({
  __esModule: true,
  useMergeWishlists: jest.fn(() => ({
    mutate: mockMergeWishlists,
  })),
}));

// Mock useCartActions
const mockSyncCart = jest.fn();
jest.mock('@/shared/hooks/useCart', () => ({
  __esModule: true,
  useCartActions: jest.fn(() => ({
    syncCart: mockSyncCart,
  })),
}));

// Mock storage
jest.mock('@/shared/utils/storage', () => ({
  __esModule: true,
  default: {
    getRedirect: jest.fn(() => null),
    setRedirect: jest.fn(),
    clearRedirect: jest.fn(),
    restoreCheckoutState: jest.fn(() => null),
    saveCheckoutState: jest.fn(),
  },
}));

// Mock logger
jest.mock('@/shared/utils/logger', () => ({
  __esModule: true,
  default: {
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock GoogleLoginButton (uses useModal which requires ModalProvider)
jest.mock('@/features/auth/GoogleLoginButton', () => ({
  __esModule: true,
  default: () => <div data-testid="google-login-button">Google Sign In</div>,
}));

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    mockToast.success.mockClear();
    mockToast.error.mockClear();
    mockLoginMutation.mockClear();
    mockVerify2FALoginMutation.mockClear();
    mockSendOtpMutation.mockClear();
    mockVerifyOtpMutation.mockClear();
    mockMergeWishlists.mockClear();
    mockSyncCart.mockClear();
    mockSearchParams.toString = jest.fn(() => '');
    storage.getRedirect.mockReturnValue(null);
  });

  test('renders login form with email and password fields', () => {
    renderWithProviders(<LoginPage />);

    // Check for email input
    const emailInput = screen.getByLabelText(/email address/i);
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');

    // Check for password input (use placeholder to avoid multiple matches with "password" in labels)
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Check for submit button (use name to avoid multiple matches)
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    expect(submitButton).toBeInTheDocument();
  });

  test('validates email format before submission', async () => {
    const user = userEvent.setup();
    
    // Ensure button is enabled
    mockUseAuth.mockReturnValue({
      login: {
        mutate: mockLoginMutation,
        isPending: false,
        error: null,
      },
      verify2FALogin: {
        mutate: mockVerify2FALoginMutation,
        isPending: false,
        error: null,
      },
      sendOtp: {
        mutate: mockSendOtpMutation,
        isPending: false,
        error: null,
      },
      verifyOtp: {
        mutate: mockVerifyOtpMutation,
        isPending: false,
        error: null,
      },
    });

    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Enter invalid email (no @ symbol or invalid format)
    await user.clear(emailInput);
    await user.type(emailInput, 'invalid-email');
    await user.type(passwordInput, 'password123');
    
    // Get the form and submit it directly to bypass HTML5 validation
    const form = emailInput.closest('form');
    expect(form).toBeInTheDocument();
    
    // Submit form directly - this triggers submitHandler which validates email
    fireEvent.submit(form);

    // The validation uses setFieldErrors, not toast - check for error in DOM
    await waitFor(() => {
      expect(screen.getByText(/valid email|doesn't look like a valid email/i)).toBeInTheDocument();
    });

    // Should not call login mutation (validation prevents it)
    expect(mockLoginMutation).not.toHaveBeenCalled();
  });

  test('validates password is required', async () => {
    const user = userEvent.setup();
    
    // Ensure button is enabled
    mockUseAuth.mockReturnValue({
      login: {
        mutate: mockLoginMutation,
        isPending: false,
        error: null,
      },
      verify2FALogin: {
        mutate: mockVerify2FALoginMutation,
        isPending: false,
        error: null,
      },
      sendOtp: {
        mutate: mockSendOtpMutation,
        isPending: false,
        error: null,
      },
      verifyOtp: {
        mutate: mockVerifyOtpMutation,
        isPending: false,
        error: null,
      },
    });

    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Ensure button is enabled
    expect(submitButton).not.toBeDisabled();

    // Enter email but no password (clear password field)
    await user.clear(emailInput);
    await user.clear(passwordInput);
    await user.type(emailInput, 'test@example.com');
    // Don't type password - leave it empty (password field should be empty)
    
    // Verify password is empty
    expect(passwordInput.value).toBe('');

    // Get the form element and submit it directly
    const form = emailInput.closest('form');
    expect(form).toBeInTheDocument();
    
    // Submit the form directly - this will trigger the submitHandler
    fireEvent.submit(form, { bubbles: true, cancelable: true });

    // The validation uses setFieldErrors, not toast - check for error in DOM
    await waitFor(() => {
      expect(screen.getByText(/please enter your password/i)).toBeInTheDocument();
    });

    // Should not call login mutation (validation prevents it)
    expect(mockLoginMutation).not.toHaveBeenCalled();
  });

  test('calls login mutation with correct credentials', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Enter valid credentials
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // Should call login mutation with normalized email (lowercase, trimmed)
    await waitFor(() => {
      expect(mockLoginMutation).toHaveBeenCalledWith(
        { email: 'test@example.com', password: 'password123' },
        expect.any(Object)
      );
    });
  });

  test('handles successful login', async () => {
    const user = userEvent.setup();
    const mockUser = {
      id: 'user123',
      _id: 'user123',
      email: 'test@example.com',
      name: 'Test User',
    };

    // Mock successful login response - call onSuccess synchronously
    mockLoginMutation.mockImplementation((credentials, callbacks) => {
      // Use setTimeout to simulate async behavior but ensure it completes
      setTimeout(() => {
        callbacks.onSuccess({
          data: {
            status: 'success',
            user: mockUser,
          },
        });
      }, 0);
    });

    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.clear(emailInput);
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // Should call login mutation
    await waitFor(() => {
      expect(mockLoginMutation).toHaveBeenCalled();
    });

    // Wait for navigation after successful login
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    }, { timeout: 3000 });

    // Should sync cart
    expect(mockSyncCart).toHaveBeenCalled();
  });

  test('handles 2FA flow', async () => {
    const user = userEvent.setup({ delay: null });
    const mockLoginSessionId = 'session123';

    mockLoginMutation.mockImplementation((credentials, callbacks) => {
      setTimeout(() => {
        callbacks.onSuccess({
          data: {
            status: '2fa_required',
            requires2FA: true,
            loginSessionId: mockLoginSessionId,
          },
        });
      }, 0);
    });

    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    await user.click(submitButton);

    await waitFor(() => {
      const twoFactorTexts = screen.getAllByText(/two-factor authentication/i);
      expect(twoFactorTexts.length).toBeGreaterThan(0);
    }, { timeout: 5000 });

    const twoFactorInputs = screen.getAllByRole('textbox').filter(input =>
      input.id?.startsWith('2fa-')
    );
    expect(twoFactorInputs.length).toBeGreaterThanOrEqual(6);
  }, 15000);

  test('handles login errors', async () => {
    const user = userEvent.setup({ delay: null });
    const mockError = {
      message: 'Invalid email or password',
      response: {
        status: 401,
        data: { message: 'Invalid email or password' },
      },
    };

    mockLoginMutation.mockImplementation((_data, { onError }) => {
      setTimeout(() => onError?.(mockError), 0);
    });

    mockUseAuth.mockReturnValue({
      login: {
        mutate: mockLoginMutation,
        isPending: false,
        error: null,
      },
      verify2FALogin: {
        mutate: mockVerify2FALoginMutation,
        isPending: false,
        error: null,
      },
      sendOtp: {
        mutate: mockSendOtpMutation,
        isPending: false,
        error: null,
      },
      verifyOtp: {
        mutate: mockVerifyOtpMutation,
        isPending: false,
        error: null,
      },
    });

    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  }, 15000);

  test('sanitizes email input', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByLabelText(/email address/i);

    // Try to enter potentially dangerous content
    await user.type(emailInput, 'test<script>alert(1)</script>@example.com');

    // Email should be sanitized (script tags removed)
    expect(emailInput.value).not.toContain('<script>');
  });

  test('handles redirectTo parameter', async () => {
    const user = userEvent.setup();
    mockSearchParams.get = jest.fn((key) => {
      if (key === 'redirectTo') return '/checkout';
      return null;
    });

    const mockUser = {
      id: 'user123',
      _id: 'user123',
      email: 'test@example.com',
    };

    mockLoginMutation.mockImplementation((credentials, callbacks) => {
      setTimeout(() => {
        callbacks.onSuccess({
          data: {
            status: 'success',
            user: mockUser,
          },
        });
      }, 0);
    });

    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await user.clear(emailInput);
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // Should navigate to redirectTo path
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/checkout');
    }, { timeout: 3000 });
  });

  test('shows loading state during login', async () => {
    mockUseAuth.mockReturnValue({
      login: {
        mutate: mockLoginMutation,
        isPending: true,
        error: null,
      },
      verify2FALogin: {
        mutate: mockVerify2FALoginMutation,
        isPending: false,
        error: null,
      },
      sendOtp: {
        mutate: mockSendOtpMutation,
        isPending: false,
        error: null,
      },
      verifyOtp: {
        mutate: mockVerifyOtpMutation,
        isPending: false,
        error: null,
      },
    });

    renderWithProviders(<LoginPage />);

    // When loading, button shows spinner and is disabled - find submit button in form
    const emailInput = screen.getByLabelText(/email address/i);
    const submitButton = emailInput.closest('form')?.querySelector('button[type="submit"]');
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  test('renders forgot password link', () => {
    renderWithProviders(<LoginPage />);

    const forgotPasswordLink = screen.getByText(/forgot password/i);
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink.closest('a')).toHaveAttribute('href', '/forgot-password');
  });

  test('normalizes email to lowercase before submission', async () => {
    const user = userEvent.setup();
    
    // Ensure login is not pending so button is enabled
    mockUseAuth.mockReturnValue({
      login: {
        mutate: mockLoginMutation,
        isPending: false, // Button should be enabled
        error: null,
      },
      verify2FALogin: {
        mutate: mockVerify2FALoginMutation,
        isPending: false,
        error: null,
      },
      sendOtp: {
        mutate: mockSendOtpMutation,
        isPending: false,
        error: null,
      },
      verifyOtp: {
        mutate: mockVerifyOtpMutation,
        isPending: false,
        error: null,
      },
    });

    renderWithProviders(<LoginPage />);

    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    // Ensure button is enabled
    expect(submitButton).not.toBeDisabled();

    // Enter email with uppercase
    // The submitHandler normalizes: trimmedEmail = state.email.trim().toLowerCase()
    await user.clear(emailInput);
    await user.type(emailInput, 'TEST@EXAMPLE.COM');
    await user.type(passwordInput, 'password123');
    
    // Wait a moment for state to update
    await waitFor(() => {
      expect(emailInput.value).toBeTruthy();
    });

    await user.click(submitButton);

    // The submitHandler normalizes email before calling loginMutation
    // So it should call login with lowercase email
    await waitFor(() => {
      expect(mockLoginMutation).toHaveBeenCalled();
    }, { timeout: 2000 });

    // Check the actual call arguments - email should be normalized to lowercase
    const callArgs = mockLoginMutation.mock.calls[0];
    expect(callArgs[0].email).toBe('test@example.com'); // Normalized in submitHandler
    expect(callArgs[0].password).toBe('password123');
  });
});

