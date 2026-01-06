/**
 * ReviewPage Component Tests
 * 
 * Tests:
 * - Renders error state when product ID is missing
 * - Renders loading state when reviews are loading
 * - Renders empty state when no reviews found
 * - Renders reviews successfully
 * - Filters reviews by current user
 * - Displays review statistics
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import CustomerReviewPage from '@/features/products/ReviewPage';

// Mock react-router-dom
const mockParams = { id: 'product1' };
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => mockParams,
}));

// Mock useReview
const mockUseGetProductReviews = jest.fn(() => ({
  data: null,
  isLoading: false,
  error: null,
}));

jest.mock('@/shared/hooks/useReview', () => ({
  __esModule: true,
  useGetProductReviews: (...args) => mockUseGetProductReviews(...args),
}));

// Mock useAuth
const mockUserData = {
  user: {
    id: 'user1',
    _id: 'user1',
    name: 'Test User',
  },
};

jest.mock('@/shared/hooks/useAuth', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    userData: mockUserData,
  })),
}));

// Container is already mocked globally in setupTests.js
// No need to mock it again here

// Mock loading components
jest.mock('@/components/loading', () => ({
  __esModule: true,
  LoadingState: () => <div data-testid="loading-state">Loading...</div>,
  ErrorState: ({ title, message }) => (
    <div data-testid="error-state">
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  ),
}));

describe('CustomerReviewPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams.id = 'product1';
    mockUseGetProductReviews.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });
  });

  test('renders error state when product ID is missing', async () => {
    mockParams.id = undefined;

    renderWithProviders(<CustomerReviewPage />);

    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
      expect(screen.getByText('Product ID Missing')).toBeInTheDocument();
    });
  });

  test('renders loading state when reviews are loading', async () => {
    mockUseGetProductReviews.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    renderWithProviders(<CustomerReviewPage />);

    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    });
  });

  test('renders empty state when no reviews found', async () => {
    mockUseGetProductReviews.mockReturnValue({
      data: {
        data: {
          data: {
            reviews: [],
          },
        },
      },
      isLoading: false,
      error: null,
    });

    renderWithProviders(<CustomerReviewPage />);

    await waitFor(() => {
      // Empty state should be displayed
      expect(screen.getByText(/no reviews/i)).toBeInTheDocument();
    });
  });

  test('renders reviews successfully', async () => {
    const reviews = [
      {
        _id: 'review1',
        user: { _id: 'user1', name: 'Test User' },
        rating: 5,
        title: 'Great Product',
        comment: 'Great product!',
        reviewDate: '2024-01-15T10:00:00Z',
        orderDate: '2024-01-10T10:00:00Z',
        product: {
          _id: 'product1',
          name: 'Test Product 1',
          image: 'https://example.com/image1.jpg',
        },
      },
      {
        _id: 'review2',
        user: { _id: 'user1', name: 'Test User' },
        rating: 4,
        title: 'Good Quality',
        comment: 'Good quality',
        reviewDate: '2024-01-16T10:00:00Z',
        orderDate: '2024-01-11T10:00:00Z',
        product: {
          _id: 'product2',
          name: 'Test Product 2',
          image: 'https://example.com/image2.jpg',
        },
      },
    ];

    mockUseGetProductReviews.mockReturnValue({
      data: {
        data: {
          data: {
            reviews,
          },
        },
      },
      isLoading: false,
      error: null,
    });

    renderWithProviders(<CustomerReviewPage />);

    await waitFor(() => {
      // Reviews should be displayed (filtered to current user's reviews)
      expect(screen.getByText('Great product!')).toBeInTheDocument();
      expect(screen.getByText('Good quality')).toBeInTheDocument();
    });
  });

  test('filters reviews by current user', async () => {
    const reviews = [
      {
        _id: 'review1',
        user: { _id: 'user1', name: 'Test User' },
        rating: 5,
        title: 'My Review',
        comment: 'My review',
        reviewDate: '2024-01-15T10:00:00Z',
        orderDate: '2024-01-10T10:00:00Z',
        product: {
          _id: 'product1',
          name: 'Test Product 1',
          image: 'https://example.com/image1.jpg',
        },
      },
      {
        _id: 'review2',
        user: { _id: 'user2', name: 'Another User' },
        rating: 4,
        title: 'Other Review',
        comment: 'Other review',
        reviewDate: '2024-01-16T10:00:00Z',
        orderDate: '2024-01-11T10:00:00Z',
        product: {
          _id: 'product2',
          name: 'Test Product 2',
          image: 'https://example.com/image2.jpg',
        },
      },
    ];

    mockUseGetProductReviews.mockReturnValue({
      data: {
        data: {
          data: {
            reviews,
          },
        },
      },
      isLoading: false,
      error: null,
    });

    renderWithProviders(<CustomerReviewPage />);

    await waitFor(() => {
      // Only user's reviews should be displayed
      expect(screen.getByText('My review')).toBeInTheDocument();
      expect(screen.queryByText('Other review')).not.toBeInTheDocument();
    });
  });

  test('displays review statistics', async () => {
    const reviews = [
      {
        _id: 'review1',
        user: { _id: 'user1', name: 'Test User' },
        rating: 5,
        title: 'Great Product',
        comment: 'Great product!',
        reviewDate: '2024-01-15T10:00:00Z',
        orderDate: '2024-01-10T10:00:00Z',
        product: {
          _id: 'product1',
          name: 'Test Product 1',
          image: 'https://example.com/image1.jpg',
        },
      },
      {
        _id: 'review2',
        user: { _id: 'user1', name: 'Test User' },
        rating: 4,
        title: 'Good Quality',
        comment: 'Good quality',
        reviewDate: '2024-01-16T10:00:00Z',
        orderDate: '2024-01-11T10:00:00Z',
        product: {
          _id: 'product2',
          name: 'Test Product 2',
          image: 'https://example.com/image2.jpg',
        },
      },
    ];

    mockUseGetProductReviews.mockReturnValue({
      data: {
        data: {
          data: {
            reviews,
          },
        },
      },
      isLoading: false,
      error: null,
    });

    renderWithProviders(<CustomerReviewPage />);

    await waitFor(() => {
      // Review statistics should be displayed
      expect(screen.getByText(/average rating/i)).toBeInTheDocument();
      expect(screen.getByText(/total reviews/i)).toBeInTheDocument();
    });
  });
});

