/**
 * WishlistPage Component Tests
 * 
 * Tests:
 * - Renders loading state when wishlist is loading
 * - Renders error state when wishlist fetch fails
 * - Renders empty state when wishlist has no items
 * - Renders wishlist with single product
 * - Renders wishlist with multiple products
 * - Handles different wishlist data structures
 * - Handles wishlist items with populated product objects
 * - User interactions (remove from wishlist)
 * - Accessibility assertions
 * - Data integrity checks
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import WishlistPage from '@/features/wishlist/WishlistPage';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}));

// Create a mock function that can be overridden in tests
const mockUseWishlist = jest.fn(() => ({
  data: null,
  isLoading: false,
  error: null,
}));

const mockRemoveFromWishlist = jest.fn(() => Promise.resolve());
const mockUseRemoveFromWishlist = jest.fn(() => ({
  mutate: mockRemoveFromWishlist,
  isPending: false,
}));

jest.mock('@/shared/hooks/useWishlist', () => ({
  __esModule: true,
  useWishlist: (...args) => mockUseWishlist(...args),
  useRemoveFromWishlist: (...args) => mockUseRemoveFromWishlist(...args),
}));

// Mock useDynamicPageTitle
jest.mock('@/shared/hooks/useDynamicPageTitle', () => ({
  __esModule: true,
  default: jest.fn(() => {}),
}));

// Mock ProductCard component with interactive remove button
// The mock simulates the real ProductCard's remove functionality
// Note: The mock accesses useRemoveFromWishlist hook which is also mocked
jest.mock('@/shared/components/ProductCard', () => {
  const React = require('react');
  
  return {
    __esModule: true,
    default: function MockProductCard({ product, showWishlistButton, showRemoveButton }) {
      // Access the mocked hook - this will use our mockUseRemoveFromWishlist
      const { useRemoveFromWishlist } = require('@/shared/hooks/useWishlist');
      const { mutate: removeWishlist } = useRemoveFromWishlist();
      
      return (
        <div data-testid={`product-card-${product._id}`}>
          <div data-testid="product-name">{product.name}</div>
          <div data-testid="product-price">GH₵{product.price}</div>
          <div data-testid="show-wishlist-button">{String(showWishlistButton)}</div>
          <div data-testid="show-remove-button">{String(showRemoveButton)}</div>
          {showRemoveButton && (
            <button
              data-testid={`remove-button-${product._id}`}
              aria-label="Remove product"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                removeWishlist(product._id);
              }}
            >
              Remove
            </button>
          )}
        </div>
      );
    },
  };
});

// Mock seoConfig
jest.mock('@/shared/config/seoConfig', () => ({
  __esModule: true,
  default: {
    wishlist: {
      title: 'My Wishlist - EazShop',
      description: 'View and manage your saved products',
      keywords: 'wishlist, saved products',
      image: 'https://example.com/image.jpg',
      type: 'website',
      canonical: 'https://example.com/wishlist',
    },
  },
}));

// Mock LoadingState component
jest.mock('@/components/loading', () => ({
  __esModule: true,
  LoadingState: ({ message }) => (
    <div data-testid="loading-state">
      <div>{message}</div>
    </div>
  ),
}));

/**
 * Test Factories
 * Shared factories for creating test data
 */

/**
 * Creates a test product with default values
 * @param {Object} overrides - Properties to override
 * @returns {Object} Product object
 */
const createTestProduct = (overrides = {}) => ({
  _id: 'product1',
  name: 'Test Product',
  price: 100,
  defaultPrice: 100,
  imageCover: 'https://example.com/image.jpg',
  stock: 10,
  ...overrides,
});

/**
 * Creates a wishlist data structure
 * @param {Array} products - Array of products
 * @returns {Object} Wishlist data structure
 */
const createWishlistData = (products = []) => ({
  data: {
    data: {
      wishlist: {
        products,
      },
    },
  },
  isLoading: false,
  error: null,
});

describe('WishlistPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRemoveFromWishlist.mockClear();
    mockUseWishlist.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });
  });

  test('renders loading state when wishlist is loading', async () => {
    mockUseWishlist.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    renderWithProviders(<WishlistPage />);

    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
      expect(screen.getByText('Loading your wishlist...')).toBeInTheDocument();
    });
  });

  test('renders error state when wishlist fetch fails', async () => {
    const errorMessage = 'Failed to load wishlist';
    mockUseWishlist.mockReturnValue({
      data: null,
      isLoading: false,
      error: { message: errorMessage },
    });

    renderWithProviders(<WishlistPage />);

    await waitFor(() => {
      // Check for error icon (⚠️)
      expect(screen.getByText('⚠️')).toBeInTheDocument();
      // Check for error title
      expect(screen.getByText('Error loading wishlist')).toBeInTheDocument();
      // Check for error message
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      // Check for Continue Shopping link
      const continueShoppingLink = screen.getByRole('link', { name: /continue shopping/i });
      expect(continueShoppingLink).toBeInTheDocument();
      expect(continueShoppingLink).toHaveAttribute('href', '/');
    });
  });

  test('renders empty state when wishlist has no items', async () => {
    mockUseWishlist.mockReturnValue({
      data: {
        data: {
          wishlist: {
            products: [],
          },
        },
      },
      isLoading: false,
      error: null,
    });

    renderWithProviders(<WishlistPage />);

    await waitFor(() => {
      // Check for empty icon (❤️)
      expect(screen.getByText('❤️')).toBeInTheDocument();
      // Check for empty title
      expect(screen.getByText('Your wishlist is empty')).toBeInTheDocument();
      // Check for empty message
      expect(screen.getByText(/Save items you love by clicking the heart icon/i)).toBeInTheDocument();
      // Check for Continue Shopping link
      const continueShoppingLink = screen.getByRole('link', { name: /continue shopping/i });
      expect(continueShoppingLink).toBeInTheDocument();
      expect(continueShoppingLink).toHaveAttribute('href', '/');
      // Check for item count (0 items)
      expect(screen.getByText(/0 items saved for later/i)).toBeInTheDocument();
    });
  });

  test('renders wishlist with one product', async () => {
    const product = createTestProduct();
    mockUseWishlist.mockReturnValue(createWishlistData([product]));

    renderWithProviders(<WishlistPage />);

    await waitFor(() => {
      // Check for page title
      expect(screen.getByText('Your Wishlist')).toBeInTheDocument();
      // Check for singular item count
      expect(screen.getByText(/1 item saved for later/i)).toBeInTheDocument();
      // Check for ProductCard
      expect(screen.getByTestId('product-card-product1')).toBeInTheDocument();
      // Check ProductCard props
      expect(screen.getByTestId('show-wishlist-button')).toHaveTextContent('false');
      expect(screen.getByTestId('show-remove-button')).toHaveTextContent('true');
      // Check for Continue Shopping link
      const continueShoppingLink = screen.getByRole('link', { name: /continue shopping/i });
      expect(continueShoppingLink).toBeInTheDocument();
    });
  });

  test('renders wishlist with multiple products', async () => {
    const products = [
      createTestProduct({ _id: 'product1', name: 'Test Product 1', price: 100 }),
      createTestProduct({ _id: 'product2', name: 'Test Product 2', price: 150 }),
      createTestProduct({ _id: 'product3', name: 'Test Product 3', price: 200 }),
    ];

    mockUseWishlist.mockReturnValue(createWishlistData(products));

    renderWithProviders(<WishlistPage />);

    await waitFor(() => {
      // Check for plural item count
      expect(screen.getByText(/3 items saved for later/i)).toBeInTheDocument();
      // Check for all ProductCards
      expect(screen.getByTestId('product-card-product1')).toBeInTheDocument();
      expect(screen.getByTestId('product-card-product2')).toBeInTheDocument();
      expect(screen.getByTestId('product-card-product3')).toBeInTheDocument();
      // Check product names are displayed
      expect(screen.getByText('Test Product 1')).toBeInTheDocument();
      expect(screen.getByText('Test Product 2')).toBeInTheDocument();
      expect(screen.getByText('Test Product 3')).toBeInTheDocument();
    });
  });

  test('handles different wishlist data structures - data.products format', async () => {
    const product = createTestProduct();

    // Test with data.data.products structure (alternative format)
    mockUseWishlist.mockReturnValue({
      data: {
        data: {
          products: [product], // Different structure
        },
      },
      isLoading: false,
      error: null,
    });

    renderWithProviders(<WishlistPage />);

    await waitFor(() => {
      // Product should still be extracted and displayed
      expect(screen.getByTestId('product-card-product1')).toBeInTheDocument();
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });
  });

  test('handles wishlist items with populated product objects', async () => {
    const product = createTestProduct();

    // Test with populated product structure (item.product is an object)
    mockUseWishlist.mockReturnValue({
      data: {
        data: {
          wishlist: {
            products: [
              {
                product: product, // Product is nested in item.product
                addedAt: '2024-01-01T00:00:00.000Z',
              },
            ],
          },
        },
      },
      isLoading: false,
      error: null,
    });

    renderWithProviders(<WishlistPage />);

    await waitFor(() => {
      // Product should be extracted from nested structure
      expect(screen.getByTestId('product-card-product1')).toBeInTheDocument();
      expect(screen.getByText('Test Product')).toBeInTheDocument();
      expect(screen.getByText(/1 item saved for later/i)).toBeInTheDocument();
    });
  });

  // ============================================
  // USER INTERACTION TESTS
  // ============================================

  test('removes item from wishlist when remove button is clicked', async () => {
    const user = userEvent.setup();
    const product = createTestProduct();
    mockUseWishlist.mockReturnValue(createWishlistData([product]));

    renderWithProviders(<WishlistPage />);

    await waitFor(() => {
      expect(screen.getByTestId('product-card-product1')).toBeInTheDocument();
    });

    const removeButton = screen.getByRole('button', { name: /remove product/i });
    expect(removeButton).toBeInTheDocument();

    await user.click(removeButton);

    expect(mockRemoveFromWishlist).toHaveBeenCalledWith(product._id);
    expect(mockRemoveFromWishlist).toHaveBeenCalledTimes(1);
  });

  test('removes correct product when multiple products are present', async () => {
    const user = userEvent.setup();
    const products = [
      createTestProduct({ _id: 'product1', name: 'Product 1' }),
      createTestProduct({ _id: 'product2', name: 'Product 2' }),
      createTestProduct({ _id: 'product3', name: 'Product 3' }),
    ];
    mockUseWishlist.mockReturnValue(createWishlistData(products));

    renderWithProviders(<WishlistPage />);

    await waitFor(() => {
      expect(screen.getByTestId('product-card-product2')).toBeInTheDocument();
    });

    const removeButton = screen.getByTestId('remove-button-product2');
    await user.click(removeButton);

    expect(mockRemoveFromWishlist).toHaveBeenCalledWith('product2');
    expect(mockRemoveFromWishlist).not.toHaveBeenCalledWith('product1');
    expect(mockRemoveFromWishlist).not.toHaveBeenCalledWith('product3');
  });

  // ============================================
  // ACCESSIBILITY TESTS
  // ============================================

  test('has proper heading hierarchy and landmarks', async () => {
    const product = createTestProduct();
    mockUseWishlist.mockReturnValue(createWishlistData([product]));

    renderWithProviders(<WishlistPage />);

    await waitFor(() => {
      const heading = screen.getByRole('heading', { name: /your wishlist/i });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H1');
    });
  });

  test('remove buttons have proper accessibility attributes', async () => {
    const product = createTestProduct();
    mockUseWishlist.mockReturnValue(createWishlistData([product]));

    renderWithProviders(<WishlistPage />);

    await waitFor(() => {
      const removeButton = screen.getByRole('button', { name: /remove product/i });
      expect(removeButton).toBeInTheDocument();
      expect(removeButton).toHaveAttribute('aria-label', 'Remove product');
    });
  });

  test('navigation links are accessible', async () => {
    const product = createTestProduct();
    mockUseWishlist.mockReturnValue(createWishlistData([product]));

    renderWithProviders(<WishlistPage />);

    await waitFor(() => {
      const continueShoppingLink = screen.getByRole('link', { name: /continue shopping/i });
      expect(continueShoppingLink).toBeInTheDocument();
      expect(continueShoppingLink).toHaveAttribute('href', '/');
    });
  });

  test('empty state has accessible structure', async () => {
    mockUseWishlist.mockReturnValue(createWishlistData([]));

    renderWithProviders(<WishlistPage />);

    await waitFor(() => {
      const heading = screen.getByRole('heading', { name: /your wishlist is empty/i });
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe('H2');
    });
  });

  // ============================================
  // DATA INTEGRITY TESTS
  // ============================================

  test('displays correct product count for single item', async () => {
    const product = createTestProduct();
    mockUseWishlist.mockReturnValue(createWishlistData([product]));

    renderWithProviders(<WishlistPage />);

    await waitFor(() => {
      expect(screen.getByText(/1 item saved for later/i)).toBeInTheDocument();
      // Verify it's not showing 0 or 2 items
      expect(screen.queryByText(/0 items saved for later/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/2 items saved for later/i)).not.toBeInTheDocument();
    });
  });

  test('displays correct product count for multiple items', async () => {
    const products = [
      createTestProduct({ _id: 'product1' }),
      createTestProduct({ _id: 'product2' }),
      createTestProduct({ _id: 'product3' }),
    ];
    mockUseWishlist.mockReturnValue(createWishlistData(products));

    renderWithProviders(<WishlistPage />);

    await waitFor(() => {
      expect(screen.getByText(/3 items saved for later/i)).toBeInTheDocument();
    });
  });

  test('displays correct product information', async () => {
    const product = createTestProduct({
      _id: 'product123',
      name: 'Special Product',
      price: 299.99,
    });
    mockUseWishlist.mockReturnValue(createWishlistData([product]));

    renderWithProviders(<WishlistPage />);

    await waitFor(() => {
      expect(screen.getByText('Special Product')).toBeInTheDocument();
      expect(screen.getByText('GH₵299.99')).toBeInTheDocument();
      expect(screen.getByTestId('product-card-product123')).toBeInTheDocument();
    });
  });

  test('filters out null or undefined products', async () => {
    mockUseWishlist.mockReturnValue({
      data: {
        data: {
          wishlist: {
            products: [
              createTestProduct({ _id: 'product1' }),
              null,
              undefined,
              createTestProduct({ _id: 'product2' }),
            ],
          },
        },
      },
      isLoading: false,
      error: null,
    });

    renderWithProviders(<WishlistPage />);

    await waitFor(() => {
      // Should only show valid products
      expect(screen.getByTestId('product-card-product1')).toBeInTheDocument();
      expect(screen.getByTestId('product-card-product2')).toBeInTheDocument();
      expect(screen.getByText(/2 items saved for later/i)).toBeInTheDocument();
    });
  });

  // ============================================
  // SNAPSHOT TEST
  // ============================================

  test('matches snapshot for wishlist with products', async () => {
    const products = [
      createTestProduct({ _id: 'product1', name: 'Product 1' }),
      createTestProduct({ _id: 'product2', name: 'Product 2' }),
    ];
    mockUseWishlist.mockReturnValue(createWishlistData(products));

    const { container } = renderWithProviders(<WishlistPage />);

    await waitFor(() => {
      expect(screen.getByTestId('product-card-product1')).toBeInTheDocument();
    });

    // Snapshot the structure (excluding dynamic content like timestamps)
    expect(container.firstChild).toMatchSnapshot();
  });
});

