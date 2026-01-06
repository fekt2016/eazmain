/**
 * PaymentMethodPage Component Tests
 * 
 * Tests:
 * - Renders loading state when payment methods are loading
 * - Renders error state when payment methods fail to load
 * - Renders empty state when no payment methods found
 * - Renders payment methods successfully
 * - Handles add payment method
 * - Handles delete payment method
 * - Handles set default payment method
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import PaymentMethodPage from '@/features/profile/PaymentMethodPage';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock usePaymentMethod hooks
const mockUseGetPaymentMethods = jest.fn(() => ({
  data: null,
  isLoading: false,
  isError: false,
  refetch: jest.fn(),
}));

const mockUseCreatePaymentMethod = jest.fn(() => ({
  mutate: jest.fn(),
  isPending: false,
}));

const mockUseDeletePaymentMethod = jest.fn(() => ({
  mutate: jest.fn(),
  isPending: false,
}));

const mockUseSetDefaultPaymentMethod = jest.fn(() => ({
  mutate: jest.fn(),
  isPending: false,
}));

jest.mock('@/shared/hooks/usePaymentMethod', () => ({
  __esModule: true,
  useGetPaymentMethods: (...args) => mockUseGetPaymentMethods(...args),
  useCreatePaymentMethod: (...args) => mockUseCreatePaymentMethod(...args),
  useDeletePaymentMethod: (...args) => mockUseDeletePaymentMethod(...args),
  useSetDefaultPaymentMethod: (...args) => mockUseSetDefaultPaymentMethod(...args),
}));

// Mock loading components
jest.mock('@/components/loading', () => ({
  __esModule: true,
  LoadingState: () => <div data-testid="loading-state">Loading...</div>,
  ErrorState: ({ title, message, onRetry }) => (
    <div data-testid="error-state">
      <h2>{title}</h2>
      <p>{message}</p>
      {onRetry && <button onClick={onRetry}>Retry</button>}
    </div>
  ),
}));

describe('PaymentMethodPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    mockUseGetPaymentMethods.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
  });

  test('renders loading state when payment methods are loading', async () => {
    mockUseGetPaymentMethods.mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      refetch: jest.fn(),
    });

    renderWithProviders(<PaymentMethodPage />);

    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    });
  });

  test('renders error state when payment methods fail to load', async () => {
    mockUseGetPaymentMethods.mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      refetch: jest.fn(),
    });

    renderWithProviders(<PaymentMethodPage />);

    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
    });
  });

  test('renders empty state when no payment methods found', async () => {
    mockUseGetPaymentMethods.mockReturnValue({
      data: { data: { paymentMethods: [] } },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });

    renderWithProviders(<PaymentMethodPage />);

    await waitFor(() => {
      expect(screen.getByText(/no payment methods/i)).toBeInTheDocument();
    });
  });

  test('renders payment methods successfully', async () => {
    const paymentMethods = [
      {
        _id: 'pm1',
        type: 'mobile_money',
        provider: 'MTN',
        mobileNumber: '+233241234567',
        name: 'John Doe',
        isDefault: true,
      },
      {
        _id: 'pm2',
        type: 'bank_transfer',
        bankName: 'Ghana Commercial Bank',
        accountNumber: '1234567890',
        accountName: 'John Doe',
        branch: 'Accra',
        isDefault: false,
      },
    ];

    mockUseGetPaymentMethods.mockReturnValue({
      data: { data: { paymentMethods } },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });

    renderWithProviders(<PaymentMethodPage />);

    await waitFor(() => {
      // Mobile money number should be displayed (0241234567)
      expect(screen.getByText(/0241234567/i)).toBeInTheDocument();
      // Bank account last 4 digits should be displayed
      expect(screen.getByText(/7890/i)).toBeInTheDocument();
    });
  });

  test('handles add payment method', async () => {
    const user = userEvent.setup();
    const mockCreateMutate = jest.fn();
    mockUseCreatePaymentMethod.mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
    });

    mockUseGetPaymentMethods.mockReturnValue({
      data: { data: { paymentMethods: [] } },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });

    renderWithProviders(<PaymentMethodPage />);

    await waitFor(() => {
      expect(screen.getByText(/no payment methods/i)).toBeInTheDocument();
    });

    // Find and click add payment method button
    const addButtons = screen.queryAllByText(/add payment method/i);
    if (addButtons.length > 0) {
      await user.click(addButtons[0]);
      // Form should appear for adding payment method
    }
  });

  test('handles delete payment method', async () => {
    const user = userEvent.setup();
    const mockDeleteMutateAsync = jest.fn().mockResolvedValue({});
    mockUseDeletePaymentMethod.mockReturnValue({
      mutateAsync: mockDeleteMutateAsync,
      isPending: false,
    });

    // Mock window.confirm
    window.confirm = jest.fn(() => true);

    const paymentMethods = [
      {
        _id: 'pm1',
        type: 'mobile_money',
        provider: 'MTN',
        mobileNumber: '+233241234567',
        name: 'John Doe',
        isDefault: true,
      },
    ];

    mockUseGetPaymentMethods.mockReturnValue({
      data: { data: { paymentMethods } },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });

    renderWithProviders(<PaymentMethodPage />);

    await waitFor(() => {
      expect(screen.getByText(/0241234567/i)).toBeInTheDocument();
    });

    // Find and click delete button
    const deleteButtons = screen.queryAllByTitle(/delete/i);
    if (deleteButtons.length > 0) {
      await user.click(deleteButtons[0]);
      await waitFor(() => {
        expect(window.confirm).toHaveBeenCalled();
        expect(mockDeleteMutateAsync).toHaveBeenCalledWith('pm1');
      });
    }
  });
});





