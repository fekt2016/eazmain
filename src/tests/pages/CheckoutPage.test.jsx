/**
 * CheckoutPage Component Tests
 * 
 * Tests:
 * - Renders Paystack payment option (mobile_money)
 * - Renders Account Balance payment option
 * - Disables Account Balance when balance < order total
 * - Enables Account Balance when balance >= order total
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import CheckoutPage from '@/features/orders/CheckoutPage';

// Mock all shared hooks with safe defaults
jest.mock('@/shared/hooks/useAuth', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    isAuthenticated: true,
    isLoading: false,
    user: { _id: 'user123', email: 'test@example.com' },
    login: jest.fn(),
    logout: jest.fn(),
  })),
}));

jest.mock('@/shared/hooks/useAddress', () => ({
  __esModule: true,
  useGetUserAddress: jest.fn(() => ({
    data: {
      results: [{
        _id: 'addr1',
        streetAddress: '123 Test St',
        city: 'Accra',
        isDefault: true,
      }],
    },
    isLoading: false,
  })),
  useCreateAddress: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
    error: null,
  })),
}));

jest.mock('@/shared/hooks/useCart', () => ({
  __esModule: true,
  useGetCart: jest.fn(() => ({
    data: {
      data: {
        cart: {
          products: [{
            _id: 'item1',
            product: { _id: 'product1', name: 'Test Product', price: 100 },
            quantity: 2,
          }],
        },
      },
    },
    isLoading: false,
  })),
  useCartActions: jest.fn(() => ({
    clearCart: jest.fn(),
    addToCart: jest.fn(),
    updateCartItem: jest.fn(),
    removeCartItem: jest.fn(),
  })),
  useCartTotals: jest.fn(() => ({
    total: 200,
    subTotal: 200,
    shipping: 0,
    discount: 0,
  })),
  getCartStructure: jest.fn((data) => {
    // Extract products from various possible structures
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data?.data?.cart?.products) return data.data.cart.products;
    if (data?.cart?.products) return data.cart.products;
    if (data?.products) return data.products;
    if (data?.data?.products) return data.data.products;
    return [];
  }),
}));

jest.mock('@/shared/hooks/useWallet', () => ({
  __esModule: true,
  useWalletBalance: jest.fn(() => ({
    data: {
      data: {
        wallet: {
          balance: 150,
          availableBalance: 150,
          holdAmount: 0,
        },
      },
    },
    isLoading: false,
  })),
}));

jest.mock('@/shared/hooks/useOrder', () => ({
  __esModule: true,
  useCreateOrder: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
    error: null,
  })),
}));

jest.mock('@/shared/hooks/useCoupon', () => ({
  __esModule: true,
  useApplyCoupon: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
    error: null,
  })),
}));

jest.mock('@/shared/hooks/usePaystackPayment', () => ({
  __esModule: true,
  usePaystackPayment: jest.fn(() => ({
    initializePaystackPayment: jest.fn(),
  })),
}));

jest.mock('@/shared/hooks/useShipping', () => ({
  __esModule: true,
  useGetPickupCenters: jest.fn(() => ({
    data: [],
    isLoading: false,
  })),
  useCalculateShippingQuote: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
  })),
}));

jest.mock('@/shared/hooks/useCartValidation', () => ({
  __esModule: true,
  useValidateCart: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
  })),
}));

jest.mock('@/shared/hooks/useDynamicPageTitle', () => ({
  __esModule: true,
  default: jest.fn(() => {}),
}));

// Mock ShippingOptions component
jest.mock('@/features/orders/ShippingOptions', () => {
  return function ShippingOptions() {
    return <div data-testid="shipping-options">Shipping Options</div>;
  };
});

describe('CheckoutPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders Paystack payment option (mobile_money)', async () => {
    const { container } = renderWithProviders(<CheckoutPage />);

    await waitFor(() => {
      // Find by id since radio buttons don't have proper labels
      const mobileMoneyRadio = container.querySelector('#payment-mobile');
      expect(mobileMoneyRadio).toBeInTheDocument();
      expect(mobileMoneyRadio).toHaveAttribute('type', 'radio');
      // Check for the specific description text
      expect(screen.getByText(/Pay via MTN Mobile Money, Vodafone Cash/i)).toBeInTheDocument();
    });
  });

  test('renders Account Balance payment option', async () => {
    renderWithProviders(<CheckoutPage />);

    await waitFor(() => {
      expect(screen.getByText(/Account Balance/i)).toBeInTheDocument();
      expect(screen.getByText(/Pay using your account credit balance/i)).toBeInTheDocument();
    });
  });

  test('disables Account Balance when balance < order total', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<CheckoutPage />);

    await waitFor(() => {
      // Verify the Account Balance text is present
      expect(screen.getByText(/Account Balance/i)).toBeInTheDocument();
    });

    // First, select the Account Balance payment method
    // The component only disables it when paymentMethod === "credit_balance"
    const accountBalanceRadio = container.querySelector('#payment-credit-balance');
    await user.click(accountBalanceRadio);

    // Now check that it becomes disabled when balance is insufficient
    await waitFor(() => {
      const radio = container.querySelector('#payment-credit-balance');
      expect(radio).toBeInTheDocument();
      expect(radio).toHaveAttribute('type', 'radio');
      // With balance 150 < total 200, it should be disabled
      expect(radio).toBeDisabled();
    });
  });

  test('enables Account Balance when balance >= order total', async () => {
    // Mock wallet with sufficient balance
    const { useWalletBalance } = require('@/shared/hooks/useWallet');
    useWalletBalance.mockReturnValueOnce({
      data: {
        data: {
          wallet: {
            balance: 250, // More than order total (200)
            availableBalance: 250,
            holdAmount: 0,
          },
        },
      },
      isLoading: false,
    });

    const { container } = renderWithProviders(<CheckoutPage />);

    await waitFor(() => {
      const accountBalanceRadio = container.querySelector('#payment-credit-balance');
      expect(accountBalanceRadio).toBeInTheDocument();
      expect(accountBalanceRadio).not.toBeDisabled();
      expect(screen.getByText(/Account Balance/i)).toBeInTheDocument();
    });
  });

  test('shows current balance and order total when Account Balance is selected', async () => {
    // Mock sufficient balance
    const { useWalletBalance } = require('@/shared/hooks/useWallet');
    useWalletBalance.mockReturnValueOnce({
      data: {
        data: {
          wallet: {
            balance: 250,
            availableBalance: 250,
            holdAmount: 0,
          },
        },
      },
      isLoading: false,
    });

    const user = userEvent.setup();
    const { container } = renderWithProviders(<CheckoutPage />);

    await waitFor(() => {
      const accountBalanceRadio = container.querySelector('#payment-credit-balance');
      expect(accountBalanceRadio).not.toBeDisabled();
    });

    // Click Account Balance option
    const accountBalanceRadio = container.querySelector('#payment-credit-balance');
    await user.click(accountBalanceRadio);

    await waitFor(() => {
      expect(screen.getByText(/Current Balance:/i)).toBeInTheDocument();
      expect(screen.getByText(/Order Total:/i)).toBeInTheDocument();
    });
  });
});

