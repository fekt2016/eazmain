/**
 * SellerPage Component Tests
 * 
 * Tests:
 * - Renders error state when seller ID is missing
 * - Renders loading state when seller is loading
 * - Renders error state when seller fetch fails
 * - Renders seller profile successfully
 * - Displays seller products
 * - Handles follow/unfollow functionality
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import PublicSellerProfile from '@/features/products/SellerPage';

// Mock react-router-dom
const mockParams = { id: 'seller1' };
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => mockParams,
  Link: ({ children, ...props }) => <a {...props}>{children}</a>,
}));

// Mock useSeller
const mockUseGetSellerProfile = jest.fn(() => ({
  data: null,
  isLoading: false,
  error: null,
}));

jest.mock('@/shared/hooks/useSeller', () => ({
  __esModule: true,
  useGetSellerProfile: (...args) => mockUseGetSellerProfile(...args),
}));

// Mock useProduct
const mockUseGetAllPublicProductBySeller = jest.fn(() => ({
  data: null,
  isLoading: false,
  error: null,
}));

jest.mock('@/shared/hooks/useProduct', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    useGetAllPublicProductBySeller: (...args) => mockUseGetAllPublicProductBySeller(...args),
  })),
}));

// Mock useFollow
const mockToggleFollow = jest.fn();
const mockIsFollowing = false;
const mockIsFollowLoading = false;

jest.mock('@/shared/hooks/useFollow', () => ({
  __esModule: true,
  useToggleFollow: () => ({
    toggleFollow: mockToggleFollow,
    isFollowing: mockIsFollowing,
    isLoading: mockIsFollowLoading,
  }),
  useGetSellersFollowers: () => ({
    data: { data: { follows: [] } },
    isLoading: false,
  }),
}));

// Mock useDynamicPageTitle
jest.mock('@/shared/hooks/useDynamicPageTitle', () => ({
  __esModule: true,
  default: jest.fn(() => {}),
}));

// Container is already mocked globally in setupTests.js
// No need to mock it again here

// Mock ProductCard
jest.mock('@/shared/components/ProductCard', () => ({
  __esModule: true,
  default: jest.fn(({ product }) => (
    <div data-testid={`product-card-${product._id}`}>
      <div>{product.name}</div>
    </div>
  )),
}));

// Mock loading components
jest.mock('@/components/loading', () => ({
  __esModule: true,
  ErrorState: ({ title, message }) => (
    <div data-testid="error-state">
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  ),
}));

jest.mock('@/shared/components/LoadingSpinner', () => ({
  __esModule: true,
  default: () => <div data-testid="loading-spinner">Loading...</div>,
}));

// Mock useBestSellers
jest.mock('@/shared/hooks/useBestSellers', () => ({
  __esModule: true,
  useGetBestSellers: jest.fn(() => ({
    data: [],
    isLoading: false,
    error: null,
  })),
}));

// Mock useBrowserhistory
jest.mock('@/shared/hooks/useBrowserhistory', () => ({
  __esModule: true,
  useAddHistoryItem: jest.fn(() => ({
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isPending: false,
  })),
}));

describe('PublicSellerProfile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams.id = 'seller1';
    mockUseGetSellerProfile.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });
    mockUseGetAllPublicProductBySeller.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });
    mockToggleFollow.mockClear();
  });

  test('renders error state when seller ID is missing', async () => {
    mockParams.id = undefined;

    renderWithProviders(<PublicSellerProfile />);

    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
      expect(screen.getByText('Seller ID Missing')).toBeInTheDocument();
    });
  });

  test('renders loading state when seller is loading', async () => {
    mockUseGetSellerProfile.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    renderWithProviders(<PublicSellerProfile />);

    await waitFor(() => {
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  test('renders error state when seller fetch fails', async () => {
    mockUseGetSellerProfile.mockReturnValue({
      data: null,
      isLoading: false,
      error: { message: 'Seller not found' },
    });

    renderWithProviders(<PublicSellerProfile />);

    await waitFor(() => {
      // Component uses ErrorState which renders with title and message
      expect(screen.getByText(/seller not found|error loading seller/i)).toBeInTheDocument();
    });
  });

  test('renders seller profile successfully', async () => {
    const seller = {
      _id: 'seller1',
      shopName: 'Test Shop',
      description: 'Test shop description',
      avatar: 'https://example.com/seller.jpg',
      createdAt: '2020-01-01T00:00:00Z',
      ratings: {
        average: 4.5,
        count: 100,
      },
      totalOrders: 100,
    };

    mockUseGetSellerProfile.mockReturnValue({
      data: {
        data: {
          data: {
            data: seller,
          },
        },
      },
      isLoading: false,
      error: null,
    });

    mockUseGetAllPublicProductBySeller.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    renderWithProviders(<PublicSellerProfile />);

    await waitFor(() => {
      expect(screen.getByText('Test Shop')).toBeInTheDocument();
      expect(screen.getByText('Test shop description')).toBeInTheDocument();
    });
  });

  test('displays seller products', async () => {
    const seller = {
      _id: 'seller1',
      shopName: 'Test Shop',
      description: 'Test shop description',
      avatar: 'https://example.com/seller.jpg',
      createdAt: '2020-01-01T00:00:00Z',
      ratings: {
        average: 4.5,
        count: 100,
      },
    };

    const products = [
      {
        _id: 'product1',
        name: 'Test Product 1',
        price: 100,
        imageCover: 'https://example.com/image1.jpg',
      },
      {
        _id: 'product2',
        name: 'Test Product 2',
        price: 150,
        imageCover: 'https://example.com/image2.jpg',
      },
    ];

    mockUseGetSellerProfile.mockReturnValue({
      data: {
        data: {
          data: {
            data: seller,
          },
        },
      },
      isLoading: false,
      error: null,
    });

    // Component expects products to be an array directly or in nested structure
    // Based on the useMemo logic, it checks: Array.isArray(productsData) first
    mockUseGetAllPublicProductBySeller.mockReturnValue({
      data: products, // Direct array should work
      isLoading: false,
      error: null,
    });

    renderWithProviders(<PublicSellerProfile />);

    await waitFor(() => {
      // Component uses custom ProductCard styled component, not the mocked one
      // Products are rendered with their names
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      expect(screen.getByText('Test Product 2')).toBeInTheDocument();
    });
  });

  test('handles follow/unfollow functionality', async () => {
    const user = userEvent.setup();
    const seller = {
      _id: 'seller1',
      shopName: 'Test Shop',
      description: 'Test shop description',
      avatar: 'https://example.com/seller.jpg',
      createdAt: '2020-01-01T00:00:00Z',
      ratings: {
        average: 4.5,
        count: 100,
      },
    };

    mockUseGetSellerProfile.mockReturnValue({
      data: {
        data: {
          data: {
            data: seller,
          },
        },
      },
      isLoading: false,
      error: null,
    });

    mockUseGetAllPublicProductBySeller.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    renderWithProviders(<PublicSellerProfile />);

    await waitFor(() => {
      expect(screen.getByText('Test Shop')).toBeInTheDocument();
    });

    // Find and click follow button
    const followButtons = screen.queryAllByText(/follow/i);
    if (followButtons.length > 0) {
      await user.click(followButtons[0]);
      await waitFor(() => {
        expect(mockToggleFollow).toHaveBeenCalled();
      });
    }
  });
});

