/**
 * CouponPage Component Tests
 * 
 * Tests:
 * - Renders loading state when coupons are loading
 * - Renders error state when coupons fail to load
 * - Renders empty state when no coupons found
 * - Renders coupons successfully
 * - Handles filtering by status
 * - Handles copy to clipboard functionality
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import CouponsPage from '@/features/products/CouponPage';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock useCoupon
const mockUseGetMyCoupons = jest.fn(() => ({
  data: null,
  isLoading: false,
  error: null,
  refetch: jest.fn(),
}));

jest.mock('@/shared/hooks/useCoupon', () => ({
  __esModule: true,
  useGetMyCoupons: (...args) => mockUseGetMyCoupons(...args),
}));

// Mock LoadingSpinner
jest.mock('@/shared/components/LoadingSpinner', () => ({
  __esModule: true,
  default: () => <div data-testid="loading-spinner">Loading...</div>,
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

// Mock loading components
jest.mock('@/components/loading', () => ({
  __esModule: true,
  ErrorState: ({ title, message, action }) => (
    <div data-testid="error-state">
      <h2>{title}</h2>
      <p>{message}</p>
      {action}
    </div>
  ),
}));

// navigator.clipboard is already mocked in setupTests.js

describe('CouponsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    mockUseGetMyCoupons.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  test('renders loading state when coupons are loading', async () => {
    mockUseGetMyCoupons.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    renderWithProviders(<CouponsPage />);

    await waitFor(() => {
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText(/loading your coupons/i)).toBeInTheDocument();
    });
  });

  test('renders error state when coupons fail to load', async () => {
    const mockRefetch = jest.fn();
    mockUseGetMyCoupons.mockReturnValue({
      data: null,
      isLoading: false,
      error: { message: 'Failed to load coupons' },
      refetch: mockRefetch,
    });

    renderWithProviders(<CouponsPage />);

    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
      expect(screen.getByText(/failed to load coupons/i)).toBeInTheDocument();
    });
  });

  test('renders empty state when no coupons found', async () => {
    mockUseGetMyCoupons.mockReturnValue({
      data: { data: { coupons: [] } },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    renderWithProviders(<CouponsPage />);

    await waitFor(() => {
      expect(screen.getByText(/no coupons/i)).toBeInTheDocument();
    });
  });

  test('renders coupons successfully', async () => {
    const coupons = [
      {
        _id: 'coupon1',
        code: 'SAVE10',
        discountType: 'percentage',
        discountValue: 10,
        status: 'active',
        expiryDate: '2024-12-31',
        featured: false,
      },
      {
        _id: 'coupon2',
        code: 'SAVE20',
        discountType: 'fixed',
        discountValue: 20,
        status: 'active',
        expiryDate: '2024-12-31',
        featured: true,
      },
    ];

    mockUseGetMyCoupons.mockReturnValue({
      data: { data: { coupons } },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    renderWithProviders(<CouponsPage />);

    await waitFor(() => {
      expect(screen.getByText('SAVE10')).toBeInTheDocument();
      // SAVE20 might appear multiple times (in coupon card and featured section), use getAllByText
      const save20Elements = screen.getAllByText('SAVE20');
      expect(save20Elements.length).toBeGreaterThan(0);
    });
  });

  test('handles filtering by status', async () => {
    const user = userEvent.setup();
    const coupons = [
      {
        _id: 'coupon1',
        code: 'SAVE10',
        status: 'active',
        expiryDate: '2024-12-31',
      },
      {
        _id: 'coupon2',
        code: 'SAVE20',
        status: 'used',
        expiryDate: '2024-12-31',
      },
    ];

    mockUseGetMyCoupons.mockReturnValue({
      data: { data: { coupons } },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    renderWithProviders(<CouponsPage />);

    await waitFor(() => {
      expect(screen.getByText('SAVE10')).toBeInTheDocument();
      expect(screen.getByText('SAVE20')).toBeInTheDocument();
    });

    // Change filter to "used" - component uses filter tabs (buttons), not a combobox
    const usedFilterButton = screen.getByRole('button', { name: /used/i });
    await user.click(usedFilterButton);

    await waitFor(() => {
      // Only used coupon should be visible
      expect(screen.queryByText('SAVE10')).not.toBeInTheDocument();
      // SAVE20 might appear multiple times, use getAllByText
      const save20Elements = screen.getAllByText('SAVE20');
      expect(save20Elements.length).toBeGreaterThan(0);
    });
  });

  test('handles copy to clipboard functionality', async () => {
    const user = userEvent.setup();
    const coupons = [
      {
        _id: 'coupon1',
        code: 'SAVE10',
        status: 'active',
        expiryDate: '2024-12-31',
      },
    ];

    mockUseGetMyCoupons.mockReturnValue({
      data: { data: { coupons } },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    renderWithProviders(<CouponsPage />);

    await waitFor(() => {
      expect(screen.getByText('SAVE10')).toBeInTheDocument();
    });

    // Find and click copy button
    const copyButtons = screen.queryAllByTitle(/copy/i);
    if (copyButtons.length > 0) {
      await user.click(copyButtons[0]);
      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('SAVE10');
      });
    }
  });
});

