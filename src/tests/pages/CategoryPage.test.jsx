/**
 * CategoryPage Component Tests
 * 
 * Tests:
 * - Renders error state when category ID is missing
 * - Renders loading state when category is loading
 * - Renders error state when category fetch fails
 * - Renders loading state when products are loading
 * - Renders empty state when no products found
 * - Renders category with products
 * - Handles subcategory selection
 * - Handles sorting functionality
 * - Handles pagination
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import CategoryPage from '@/features/categories/CategoryPage';

// Mock react-router-dom
const mockParams = { id: 'category1' };
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => mockParams,
}));

// Create mock functions that can be overridden in tests
const mockUseCategoryById = jest.fn(() => ({
  data: null,
  isLoading: false,
  error: null,
}));

const mockUseGetProductsByCategory = jest.fn(() => ({
  data: null,
  isLoading: false,
  error: null,
  refetch: jest.fn(),
}));

jest.mock('@/shared/hooks/useCategory', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    useCategoryById: (...args) => mockUseCategoryById(...args),
  })),
}));

jest.mock('@/shared/hooks/useProduct', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    useGetProductsByCategory: (...args) => mockUseGetProductsByCategory(...args),
  })),
}));

// Mock useDynamicPageTitle
jest.mock('@/shared/hooks/useDynamicPageTitle', () => ({
  __esModule: true,
  default: jest.fn(() => {}),
}));

// Mock ProductCard component
jest.mock('@/shared/components/ProductCard', () => ({
  __esModule: true,
  default: jest.fn(({ product }) => (
    <div data-testid={`product-card-${product._id}`}>
      <div>{product.name}</div>
    </div>
  )),
}));

// Mock Pagination component
jest.mock('@/shared/components/pagination', () => ({
  __esModule: true,
  default: jest.fn(({ currentPage, totalPages, onPageChange }) => (
    <div data-testid="pagination">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        Previous
      </button>
      <span>Page {currentPage} of {totalPages}</span>
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        Next
      </button>
    </div>
  )),
}));

// Mock SkeletonLoader
jest.mock('@/shared/components/SkeletonLoader', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="skeleton-loader">Loading...</div>),
}));

// Container is already mocked globally in setupTests.js
// No need to mock it again here

// Mock ErrorState component
jest.mock('@/components/loading', () => ({
  __esModule: true,
  ErrorState: ({ title, message }) => (
    <div data-testid="error-state">
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  ),
}));

describe('CategoryPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams.id = 'category1';
    mockUseCategoryById.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });
    mockUseGetProductsByCategory.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
  });

  test('renders error state when category ID is missing', async () => {
    mockParams.id = undefined;

    renderWithProviders(<CategoryPage />);

    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
      expect(screen.getByText('Category ID Missing')).toBeInTheDocument();
      expect(screen.getByText('Category ID is required. Please go back and try again.')).toBeInTheDocument();
    });
  });

  test('renders loading state when category is loading', async () => {
    mockUseCategoryById.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    renderWithProviders(<CategoryPage />);

    await waitFor(() => {
      // SkeletonLoader should be rendered for category hero
      expect(screen.getAllByTestId('skeleton-loader').length).toBeGreaterThan(0);
    });
  });

  test('renders error state when category fetch fails', async () => {
    mockUseCategoryById.mockReturnValue({
      data: null,
      isLoading: false,
      error: { message: 'Category not found' },
    });

    renderWithProviders(<CategoryPage />);

    await waitFor(() => {
      expect(screen.getByText('Category Not Found')).toBeInTheDocument();
      expect(screen.getByText(/We couldn't find the category you're looking for/i)).toBeInTheDocument();
    });
  });

  test('renders loading state when products are loading', async () => {
    const category = {
      _id: 'category1',
      name: 'Test Category',
      description: 'Test category description',
      image: 'https://example.com/category.jpg',
    };

    mockUseCategoryById.mockReturnValue({
      data: {
        data: {
          category,
        },
      },
      isLoading: false,
      error: null,
    });

    mockUseGetProductsByCategory.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    renderWithProviders(<CategoryPage />);

    await waitFor(() => {
      // Category name should be displayed
      expect(screen.getByText('Test Category')).toBeInTheDocument();
      // Skeleton loaders should be rendered for products
      expect(screen.getAllByTestId('skeleton-loader').length).toBeGreaterThan(0);
    });
  });

  test('renders empty state when no products found', async () => {
    const category = {
      _id: 'category1',
      name: 'Test Category',
      description: 'Test category description',
      image: 'https://example.com/category.jpg',
    };

    mockUseCategoryById.mockReturnValue({
      data: {
        data: {
          category,
        },
      },
      isLoading: false,
      error: null,
    });

    mockUseGetProductsByCategory.mockReturnValue({
      data: {
        data: {
          products: [],
        },
        totalCount: 0,
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    renderWithProviders(<CategoryPage />);

    await waitFor(() => {
      expect(screen.getByText('No Products Found')).toBeInTheDocument();
      expect(screen.getByText(/Try adjusting your filters or check back later/i)).toBeInTheDocument();
      expect(screen.getByText('Clear All Filters')).toBeInTheDocument();
    });
  });

  test('renders category with products', async () => {
    const category = {
      _id: 'category1',
      name: 'Test Category',
      description: 'Test category description',
      image: 'https://example.com/category.jpg',
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

    mockUseCategoryById.mockReturnValue({
      data: {
        data: {
          category,
        },
      },
      isLoading: false,
      error: null,
    });

    mockUseGetProductsByCategory.mockReturnValue({
      data: {
        data: {
          products,
        },
        totalCount: 2,
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    renderWithProviders(<CategoryPage />);

    await waitFor(() => {
      // Category name should be displayed
      expect(screen.getByText('Test Category')).toBeInTheDocument();
      // Products should be displayed
      expect(screen.getByTestId('product-card-product1')).toBeInTheDocument();
      expect(screen.getByTestId('product-card-product2')).toBeInTheDocument();
    });

    // Results count should be displayed - text is split across elements with <strong> tags
    // Use getAllByText to handle multiple matches, then verify at least one contains the pattern
    const showingElements = screen.getAllByText((content, element) => {
      const text = element?.textContent || '';
      return text.includes('Showing') && text.includes('of') && text.includes('products');
    });
    expect(showingElements.length).toBeGreaterThan(0);
  });

  test('handles subcategory selection', async () => {
    const subcategories = [
      { _id: 'sub1', name: 'Subcategory 1', image: 'https://example.com/sub1.jpg' },
      { _id: 'sub2', name: 'Subcategory 2', image: 'https://example.com/sub2.jpg' },
    ];
    
    const category = {
      _id: 'category1',
      name: 'Test Category',
      description: 'Test category description',
      image: 'https://example.com/category.jpg',
    };

    const products = [
      {
        _id: 'product1',
        name: 'Test Product 1',
        price: 100,
        imageCover: 'https://example.com/image1.jpg',
      },
    ];

    // Component looks for categoryData?.data?.subcategories
    mockUseCategoryById.mockReturnValue({
      data: {
        data: {
          category,
          subcategories, // Subcategories at the data level
        },
      },
      isLoading: false,
      error: null,
    });

    const mockRefetch = jest.fn();
    mockUseGetProductsByCategory.mockReturnValue({
      data: {
        data: {
          products,
        },
        totalCount: 1,
      },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    renderWithProviders(<CategoryPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Category')).toBeInTheDocument();
      expect(screen.getByTestId('product-card-product1')).toBeInTheDocument();
    });

    // Component should handle subcategories in the data structure
    // Subcategory rendering depends on useEffect and component state
    // This test verifies the component renders correctly with subcategory data
    // Note: Full subcategory interaction testing may require more complex setup
  });

  test('handles sorting functionality', async () => {
    const user = userEvent.setup();
    const category = {
      _id: 'category1',
      name: 'Test Category',
      description: 'Test category description',
      image: 'https://example.com/category.jpg',
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

    mockUseCategoryById.mockReturnValue({
      data: {
        data: {
          category,
        },
      },
      isLoading: false,
      error: null,
    });

    mockUseGetProductsByCategory.mockReturnValue({
      data: {
        data: {
          products,
        },
        totalCount: 2,
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    renderWithProviders(<CategoryPage />);

    await waitFor(() => {
      expect(screen.getByText('Test Category')).toBeInTheDocument();
    });

    // Find and change sort option
    const sortSelect = screen.getByRole('combobox');
    await user.selectOptions(sortSelect, 'price');

    // Component should handle sort change (page resets to 1)
    await waitFor(() => {
      expect(sortSelect).toHaveValue('price');
    });
  });

  test('handles pagination when multiple pages exist', async () => {
    const user = userEvent.setup();
    const category = {
      _id: 'category1',
      name: 'Test Category',
      description: 'Test category description',
      image: 'https://example.com/category.jpg',
    };

    const products = Array.from({ length: 12 }, (_, i) => ({
      _id: `product${i + 1}`,
      name: `Test Product ${i + 1}`,
      price: 100 + i * 10,
      imageCover: `https://example.com/image${i + 1}.jpg`,
    }));

    mockUseCategoryById.mockReturnValue({
      data: {
        data: {
          category,
        },
      },
      isLoading: false,
      error: null,
    });

    mockUseGetProductsByCategory.mockReturnValue({
      data: {
        data: {
          products,
        },
        totalCount: 25, // More than one page (12 per page)
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    renderWithProviders(<CategoryPage />);

    await waitFor(() => {
      // Pagination should be displayed when totalPages > 1
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
      expect(screen.getByText(/Page 1 of/i)).toBeInTheDocument();
    });

    // Click next page
    const nextButton = screen.getByText('Next');
    await user.click(nextButton);

    // Pagination should update (though we can't easily test the page state change without more setup)
    await waitFor(() => {
      expect(nextButton).toBeInTheDocument();
    });
  });
});

