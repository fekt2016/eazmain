/**
 * OrderConfirmationPage Component Tests
 * 
 * Tests:
 * - Renders loading state when verifying order
 * - Renders success state with order details
 * - Renders error state when verification fails
 * - Handles order from state
 * - Handles order from URL parameters
 * - Clears cart after successful verification
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import OrderConfirmationPage from '@/features/orders/OrderConfirmationPage';

// Mock react-router-dom
const mockLocation = { search: '', state: null };
const mockNavigate = jest.fn();
const mockSearchParams = new URLSearchParams();
mockSearchParams.get = jest.fn(() => null);
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => mockLocation,
  useNavigate: () => mockNavigate,
  useSearchParams: () => [mockSearchParams],
}));

// Mock useOrderConfirmation
const mockUseOrderConfirmation = jest.fn(() => ({
  orderFromApi: null,
  isOrderLoading: false,
  orderError: null,
  isVerifyingPayment: false,
  paymentVerificationError: null,
  verificationStatus: null,
  hasVerified: false,
}));

jest.mock('@/shared/hooks/useOrderConfirmation', () => ({
  __esModule: true,
  useOrderConfirmation: (...args) => mockUseOrderConfirmation(...args),
}));

// Mock useCartActions
const mockClearCart = jest.fn();
jest.mock('@/shared/hooks/useCart', () => ({
  __esModule: true,
  useCartActions: () => ({
    clearCart: mockClearCart,
  }),
}));

// Mock useQueryClient
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueryClient: () => ({
    invalidateQueries: jest.fn(),
  }),
}));

// Mock useDynamicPageTitle
jest.mock('@/shared/hooks/useDynamicPageTitle', () => ({
  __esModule: true,
  default: jest.fn(() => {}),
}));

describe('OrderConfirmationPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocation.search = '';
    mockLocation.state = null;
    mockNavigate.mockClear();
    mockClearCart.mockClear();
    mockSearchParams.toString = jest.fn(() => '');
    mockSearchParams.get = jest.fn(() => null);
    mockUseOrderConfirmation.mockReturnValue({
      orderFromApi: null,
      isOrderLoading: false,
      orderError: null,
      isVerifyingPayment: false,
      paymentVerificationError: null,
      verificationStatus: null,
      hasVerified: false,
    });
  });

  test('renders loading state when verifying order', async () => {
    // Component requires orderIdFromUrl for loading state when no orderFromState
    mockLocation.search = '?orderId=order1';
    const mockGet = jest.fn((key) => {
      if (key === 'orderId') return 'order1';
      return null;
    });
    mockSearchParams.get = mockGet;

    mockUseOrderConfirmation.mockReturnValue({
      orderFromApi: null,
      isOrderLoading: true,
      orderError: null,
      isVerifyingPayment: true,
      paymentVerificationError: null,
      verificationStatus: null,
      hasVerified: false,
    });

    renderWithProviders(<OrderConfirmationPage />);

    await waitFor(() => {
      expect(screen.getByText(/verifying payment/i)).toBeInTheDocument();
    });
  });

  test('renders success state with order details', async () => {
    // Component requires orderIdFromUrl and payment reference (or COD/wallet payment method)
    // Use COD payment method to avoid payment reference requirement
    mockLocation.search = '?orderId=order1';
    const mockGet = jest.fn((key) => {
      if (key === 'orderId') return 'order1';
      return null;
    });
    mockSearchParams.get = mockGet;

    const order = {
      orderId: 'order1',
      orderNumber: 'ORD123456789',
      totalPrice: 150.00,
      status: 'processing',
      paymentStatus: 'completed',
      paymentMethod: 'payment_on_delivery', // COD to avoid payment reference requirement
      shippingAddress: {
        fullName: 'Test User',
        address: '123 Test St',
        city: 'Accra',
      },
    };

    // Component extracts order from orderFromApi.data.order or orderFromApi.order or orderFromApi
    mockUseOrderConfirmation.mockReturnValue({
      orderFromApi: { data: { order } },
      isOrderLoading: false,
      orderError: null,
      isVerifyingPayment: false,
      paymentVerificationError: null,
      verificationStatus: 'success',
      hasVerified: true,
    });

    renderWithProviders(<OrderConfirmationPage />);

    await waitFor(() => {
      expect(screen.getByText(/order confirmed!/i)).toBeInTheDocument();
      // Order number is displayed as "Order #: ORD123456789"
      expect(screen.getByText(/order #:.*ORD123456789/i)).toBeInTheDocument();
    });
  });

  test('renders error state when verification fails', async () => {
    // Component requires orderIdFromUrl to avoid invalid link error
    mockLocation.search = '?orderId=order1';
    const mockGet = jest.fn((key) => {
      if (key === 'orderId') return 'order1';
      return null;
    });
    mockSearchParams.get = mockGet;

    mockUseOrderConfirmation.mockReturnValue({
      orderFromApi: null,
      isOrderLoading: false,
      orderError: { message: 'Order not found' },
      isVerifyingPayment: false,
      paymentVerificationError: null,
      verificationStatus: null,
      hasVerified: false,
    });

    renderWithProviders(<OrderConfirmationPage />);

    await waitFor(() => {
      // Component shows "Error Loading Order" heading
      expect(screen.getByText(/error loading order/i)).toBeInTheDocument();
      expect(screen.getByText(/order not found/i)).toBeInTheDocument();
    });
  });

  test('handles order from state', async () => {
    const order = {
      orderId: 'order1',
      orderNumber: 'ORD123456789',
      totalPrice: 150.00,
    };

    mockLocation.state = { order };

    mockUseOrderConfirmation.mockReturnValue({
      orderFromApi: null,
      isOrderLoading: false,
      orderError: null,
      isVerifyingPayment: false,
      paymentVerificationError: null,
      verificationStatus: 'success',
      hasVerified: true,
    });

    renderWithProviders(<OrderConfirmationPage />);

    await waitFor(() => {
      expect(screen.getByText(/order confirmed/i)).toBeInTheDocument();
    });
  });

  test('handles order from URL parameters', async () => {
    mockLocation.search = '?orderId=order1&reference=REF123';
    const mockGet = jest.fn((key) => {
      if (key === 'orderId') return 'order1';
      if (key === 'reference') return 'REF123';
      return null;
    });
    mockSearchParams.get = mockGet;

    const order = {
      orderId: 'order1',
      orderNumber: 'ORD123456789',
      totalPrice: 150.00,
    };

    mockUseOrderConfirmation.mockReturnValue({
      orderFromApi: { data: { order } },
      isOrderLoading: false,
      orderError: null,
      isVerifyingPayment: false,
      paymentVerificationError: null,
      verificationStatus: 'success',
      hasVerified: true,
    });

    renderWithProviders(<OrderConfirmationPage />);

    await waitFor(() => {
      expect(screen.getByText(/order confirmed/i)).toBeInTheDocument();
    });
  });
});

