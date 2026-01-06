/**
 * SearchResult Component Tests
 * 
 * Tests:
 * - Renders loading state when search is loading
 * - Renders empty state when no results found
 * - Renders search results successfully
 * - Handles filter functionality
 * - Handles sorting functionality
 * - Handles pagination
 * - Handles URL query parameters
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import SearchResultsPage from '@/features/search/SearchResult';

// Mock react-router-dom
const mockLocation = { search: '?q=test' };
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => mockLocation,
  useNavigate: () => mockNavigate,
}));

// Mock useSearchResults
const mockUseSearchResults = jest.fn(() => ({
  data: null,
  isLoading: false,
  error: null,
}));

jest.mock('@/shared/hooks/useSearch', () => ({
  __esModule: true,
  useSearchResults: (...args) => mockUseSearchResults(...args),
}));

// Mock useDynamicPageTitle
jest.mock('@/shared/hooks/useDynamicPageTitle', () => ({
  __esModule: true,
  default: jest.fn(() => {}),
}));

// Mock ProductCard
jest.mock('@/shared/components/ProductCard', () => ({
  __esModule: true,
  default: jest.fn(({ product }) => (
    <div data-testid={`product-card-${product._id}`}>
      <div>{product.name}</div>
    </div>
  )),
}));

// Container is already mocked globally in setupTests.js
// No need to mock it again here

// Mock loading components
jest.mock('@/components/loading', () => ({
  __esModule: true,
  LoadingState: () => <div data-testid="loading-state">Loading...</div>,
  SkeletonGrid: () => <div data-testid="skeleton-grid">Loading...</div>,
  ErrorState: ({ title, message, 'data-testid': testId }) => (
    <div data-testid={testId || 'error-state'}>
      <div>{title}</div>
      <div>{message}</div>
    </div>
  ),
}));

// Mock search utilities - use actual implementation but make it testable
jest.mock('@/shared/utils/searchUtils.jsx', () => {
  const actual = jest.requireActual('@/shared/utils/searchUtils.jsx');
  return {
    __esModule: true,
    ...actual,
  };
});

describe('SearchResultsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocation.search = '?q=test';
    mockNavigate.mockClear();
    // Reset mock to default implementation (can be overridden in tests)
    mockUseSearchResults.mockImplementation(() => ({
      data: null,
      isLoading: false,
      error: null,
    }));
  });

  test('renders loading state when search is loading', async () => {
    mockUseSearchResults.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    renderWithProviders(<SearchResultsPage />);

    await waitFor(() => {
      // Component now uses explicit loading state with data-testid
      expect(screen.getByTestId('search-loading-grid')).toBeInTheDocument();
      expect(screen.getByTestId('search-title')).toBeInTheDocument();
    });
  });

  test('renders error state when search fails', async () => {
    const errorMessage = 'Failed to load search results';
    mockUseSearchResults.mockReturnValue({
      data: null,
      isLoading: false,
      error: { message: errorMessage },
    });

    renderWithProviders(<SearchResultsPage />);

    await waitFor(() => {
      // Use stable data-testid selector for error state
      expect(screen.getByTestId('search-error-state')).toBeInTheDocument();
      expect(screen.getByText(/error loading search results/i)).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      // Verify header still shows
      expect(screen.getByTestId('search-title')).toBeInTheDocument();
      // Verify no product cards are rendered
      expect(screen.queryByTestId('search-products-grid')).not.toBeInTheDocument();
      // Verify no pagination
      expect(screen.queryByTestId('search-pagination')).not.toBeInTheDocument();
      // Verify no empty state
      expect(screen.queryByTestId('search-empty-state')).not.toBeInTheDocument();
    });
  });

  test('renders empty state when no results found', async () => {
    // Component now uses explicit showEmptyState variable
    mockUseSearchResults.mockReturnValue({
      data: {
        data: [], // Empty products array triggers empty state
        totalProducts: 0,
        currentPage: 1,
        totalPages: 1,
      },
      isLoading: false,
      error: null,
    });

    renderWithProviders(<SearchResultsPage />);

    await waitFor(() => {
      // Use stable data-testid selector
      expect(screen.getByTestId('search-empty-state')).toBeInTheDocument();
      expect(screen.getByText(/no results found/i)).toBeInTheDocument();
      // Verify header still shows
      expect(screen.getByTestId('search-title')).toBeInTheDocument();
      // Verify no product cards are rendered
      expect(screen.queryByTestId('search-products-grid')).not.toBeInTheDocument();
      // Verify no pagination (decoupled from empty state)
      expect(screen.queryByTestId('search-pagination')).not.toBeInTheDocument();
    });
  });

  test('renders search results successfully', async () => {
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

    // Component's useMemo: products = data.data || []
    // So data structure should be: { data: { data: products, ... } }
    mockUseSearchResults.mockReturnValue({
      data: {
        data: products, // Component extracts: data.data || []
        totalProducts: 2,
        currentPage: 1,
        totalPages: 1,
        pagination: {
          page: 1,
          limit: 20,
          total: 2,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
          visiblePages: [],
          showEllipsisStart: false,
          showEllipsisEnd: false,
        },
      },
      isLoading: false,
      error: null,
    });

    renderWithProviders(<SearchResultsPage />);

    await waitFor(() => {
      // Use stable data-testid selectors
      expect(screen.getByTestId('search-title')).toBeInTheDocument();
      expect(screen.getByTestId('search-result-count')).toBeInTheDocument();
      // Component checks: showProductsGrid = !isLoading && hasProducts && !error
      // hasProducts = productsArray.length > 0
      expect(screen.getByTestId('search-products-grid')).toBeInTheDocument();
      // Verify products are rendered
      expect(screen.getByTestId('product-card-product1')).toBeInTheDocument();
      expect(screen.getByTestId('product-card-product2')).toBeInTheDocument();
      // Verify result count text
      const resultCount = screen.getByTestId('search-result-count');
      expect(resultCount.textContent).toMatch(/showing/i);
      expect(resultCount.textContent).toMatch(/2/);
      expect(resultCount.textContent).toMatch(/items/i);
      // Verify no pagination when totalPages === 1 (hasPagination = totalPagesValue > 1)
      expect(screen.queryByTestId('search-pagination')).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('handles filter functionality', async () => {
    const user = userEvent.setup();
    const products = [
      {
        _id: 'product1',
        name: 'Test Product 1',
        price: 100,
        imageCover: 'https://example.com/image1.jpg',
      },
    ];

    mockUseSearchResults.mockReturnValue({
      data: {
        data: products,
        totalProducts: 1,
        currentPage: 1,
        totalPages: 1,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
          visiblePages: [],
          showEllipsisStart: false,
          showEllipsisEnd: false,
        },
      },
      isLoading: false,
      error: null,
    });

    renderWithProviders(<SearchResultsPage />);

    await waitFor(() => {
      // Verify products grid is rendered using stable selector
      // Component checks: showProductsGrid = !isLoading && hasProducts && !error
      expect(screen.getByTestId('search-products-grid')).toBeInTheDocument();
      expect(screen.getByTestId('product-card-product1')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Click filter button - use role and accessible name
    const filterButton = screen.getByRole('button', { name: /filters/i });
    await user.click(filterButton);

    // Filter sidebar should appear
    await waitFor(() => {
      const filterHeader = screen.getByRole('heading', { name: /filters/i });
      expect(filterHeader).toBeInTheDocument();
    });
  });

  test('handles sorting functionality', async () => {
    const user = userEvent.setup();
    const products = [
      {
        _id: 'product1',
        name: 'Test Product 1',
        price: 100,
        imageCover: 'https://example.com/image1.jpg',
      },
    ];

    mockUseSearchResults.mockReturnValue({
      data: {
        data: products,
        totalProducts: 1,
        currentPage: 1,
        totalPages: 1,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
          visiblePages: [],
          showEllipsisStart: false,
          showEllipsisEnd: false,
        },
      },
      isLoading: false,
      error: null,
    });

    renderWithProviders(<SearchResultsPage />);

    await waitFor(() => {
      expect(screen.getByText(/results for/i)).toBeInTheDocument();
    });

    // Find and change sort option
    const sortSelect = screen.getByRole('combobox');
    await user.selectOptions(sortSelect, 'price-low');

    await waitFor(() => {
      expect(sortSelect).toHaveValue('price-low');
    });
  });

  test('handles pagination when multiple pages exist', async () => {
    // Ensure search query is set so the hook is enabled
    mockLocation.search = '?q=test';
    
    // CRITICAL: Products must exist for pagination test to work
    // Component extracts: productData?.data || productData, then data.data for products
    // Structure: { data: { data: products[], totalProducts, currentPage, totalPages } }
    const products = Array.from({ length: 10 }, (_, i) => ({
      _id: `product${i + 1}`,
      name: `Test Product ${i + 1}`,
      price: 100 + i * 10,
      imageCover: `https://example.com/image${i + 1}.jpg`,
    }));

    // Override beforeEach mock with pagination scenario
    // Backend now provides pagination metadata including visiblePages
    // Component checks: hasProducts = productsArray.length > 0, hasPagination = totalPages > 1
    mockUseSearchResults.mockReturnValue({
      data: {
        data: products, // Component extracts: productData.data.data for products array
        totalProducts: 25,
        currentPage: 1,
        totalPages: 3, // Must be > 1 for hasPagination === true
        pagination: {
          page: 1,
          limit: 20,
          total: 25,
          totalPages: 3,
          hasNext: true,
          hasPrev: false,
          visiblePages: [1, 2, 3], // Backend-provided visible pages
          showEllipsisStart: false,
          showEllipsisEnd: false,
        },
      },
      isLoading: false,
      error: null,
    });

    renderWithProviders(<SearchResultsPage />);

    await waitFor(() => {
      // Verify products grid is rendered (decoupled from pagination)
      // Component requires hasProducts === true for products grid to render
      expect(screen.getByTestId('search-products-grid')).toBeInTheDocument();
      expect(screen.getByTestId('product-card-product1')).toBeInTheDocument();
      expect(screen.getByTestId('product-card-product10')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Verify pagination is rendered independently (decoupled from products)
    // Component requires hasPagination === true (totalPages > 1) for pagination to render
    await waitFor(() => {
      // Use stable data-testid selector
      expect(screen.getByTestId('search-pagination')).toBeInTheDocument();
      expect(screen.getByTestId('pagination-prev')).toBeInTheDocument();
      expect(screen.getByTestId('pagination-next')).toBeInTheDocument();
      expect(screen.getByTestId('pagination-numbers')).toBeInTheDocument();
      // Verify page numbers are rendered
      expect(screen.getByTestId('pagination-page-1')).toBeInTheDocument();
    });

    // Verify result count
    const resultCount = screen.getByTestId('search-result-count');
    expect(resultCount.textContent).toMatch(/showing/i);
    expect(resultCount.textContent).toMatch(/10/);
    expect(resultCount.textContent).toMatch(/25/);
    expect(resultCount.textContent).toMatch(/items/i);
  });

  test('handles URL query parameters correctly', async () => {
    mockLocation.search = '?q=laptop&category=Electronics&minPrice=100&maxPrice=500';

    // URL params apply filters, which may result in empty results
    // Backend provides pagination metadata even for empty results
    mockUseSearchResults.mockReturnValue({
      data: {
        data: [], // Empty results when filters are applied
        totalProducts: 0,
        currentPage: 1,
        totalPages: 1,
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
          visiblePages: [],
          showEllipsisStart: false,
          showEllipsisEnd: false,
        },
      },
      isLoading: false,
      error: null,
    });

    renderWithProviders(<SearchResultsPage />);

    await waitFor(() => {
      // Use stable data-testid selectors
      expect(screen.getByTestId('search-title')).toBeInTheDocument();
      // Verify search query from URL appears in header
      const searchTitle = screen.getByTestId('search-title');
      expect(searchTitle.textContent).toMatch(/laptop/i);
      // Verify component handles empty state (decoupled from pagination)
      expect(screen.getByTestId('search-empty-state')).toBeInTheDocument();
      expect(screen.getByText(/no results found/i)).toBeInTheDocument();
      // Verify no product cards are rendered
      expect(screen.queryByTestId('search-products-grid')).not.toBeInTheDocument();
      // Verify no pagination (decoupled from empty state)
      expect(screen.queryByTestId('search-pagination')).not.toBeInTheDocument();
    });
  });

  test('renders pagination with ellipsis when many pages exist', async () => {
    mockLocation.search = '?q=test&page=5';
    
    const products = Array.from({ length: 20 }, (_, i) => ({
      _id: `product${i + 1}`,
      name: `Test Product ${i + 1}`,
      price: 100 + i * 10,
      imageCover: `https://example.com/image${i + 1}.jpg`,
    }));

    // Backend provides pagination with ellipsis for many pages
    mockUseSearchResults.mockReturnValue({
      data: {
        data: products,
        totalProducts: 200,
        currentPage: 5,
        totalPages: 10,
        pagination: {
          page: 5,
          limit: 20,
          total: 200,
          totalPages: 10,
          hasNext: true,
          hasPrev: true,
          visiblePages: [1, 'ellipsis-start', 3, 4, 5, 6, 7, 'ellipsis-end', 10], // Backend-provided with ellipsis
          showEllipsisStart: true,
          showEllipsisEnd: true,
        },
      },
      isLoading: false,
      error: null,
    });

    renderWithProviders(<SearchResultsPage />);

    await waitFor(() => {
      // Verify pagination is rendered
      expect(screen.getByTestId('search-pagination')).toBeInTheDocument();
      
      // Verify ellipsis are rendered
      const ellipsis = screen.getAllByTestId('pagination-ellipsis');
      expect(ellipsis.length).toBeGreaterThan(0);
      
      // Verify page numbers are rendered (excluding ellipsis)
      expect(screen.getByTestId('pagination-page-1')).toBeInTheDocument();
      expect(screen.getByTestId('pagination-page-5')).toBeInTheDocument();
      expect(screen.getByTestId('pagination-page-10')).toBeInTheDocument();
      
      // Verify current page is active
      const currentPage = screen.getByTestId('pagination-page-5');
      expect(currentPage).toHaveAttribute('aria-current', 'page');
    });
  });

  test('handles pagination navigation - next button', async () => {
    const user = userEvent.setup();
    mockLocation.search = '?q=test&page=1';
    
    const products = Array.from({ length: 20 }, (_, i) => ({
      _id: `product${i + 1}`,
      name: `Test Product ${i + 1}`,
      price: 100 + i * 10,
      imageCover: `https://example.com/image${i + 1}.jpg`,
    }));

    mockUseSearchResults.mockReturnValue({
      data: {
        data: products,
        totalProducts: 60,
        currentPage: 1,
        totalPages: 3,
        pagination: {
          page: 1,
          limit: 20,
          total: 60,
          totalPages: 3,
          hasNext: true,
          hasPrev: false,
          visiblePages: [1, 2, 3],
          showEllipsisStart: false,
          showEllipsisEnd: false,
        },
      },
      isLoading: false,
      error: null,
    });

    renderWithProviders(<SearchResultsPage />);

    await waitFor(() => {
      // Component checks: showPagination = !isLoading && hasPagination && !error
      // hasPagination = totalPagesValue > 1 (3 > 1 = true)
      expect(screen.getByTestId('search-pagination')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Click next button
    const nextButton = screen.getByTestId('pagination-next');
    expect(nextButton).not.toBeDisabled();
    await user.click(nextButton);

    // Verify navigation was called with page 2
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining('page=2'),
        { replace: true }
      );
    });
  });

  test('handles pagination navigation - previous button', async () => {
    const user = userEvent.setup();
    mockLocation.search = '?q=test&page=2';
    
    const products = Array.from({ length: 20 }, (_, i) => ({
      _id: `product${i + 1}`,
      name: `Test Product ${i + 1}`,
      price: 100 + i * 10,
      imageCover: `https://example.com/image${i + 1}.jpg`,
    }));

    mockUseSearchResults.mockReturnValue({
      data: {
        data: products,
        totalProducts: 60,
        currentPage: 2,
        totalPages: 3,
        pagination: {
          page: 2,
          limit: 20,
          total: 60,
          totalPages: 3,
          hasNext: true,
          hasPrev: true,
          visiblePages: [1, 2, 3],
          showEllipsisStart: false,
          showEllipsisEnd: false,
        },
      },
      isLoading: false,
      error: null,
    });

    renderWithProviders(<SearchResultsPage />);

    await waitFor(() => {
      // Component checks: showPagination = !isLoading && hasPagination && !error
      expect(screen.getByTestId('search-pagination')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Click previous button
    const prevButton = screen.getByTestId('pagination-prev');
    expect(prevButton).not.toBeDisabled();
    await user.click(prevButton);

    // Verify navigation was called (page 1 is omitted from URL as it's the default)
    await waitFor(() => {
      // buildSearchUrl omits page=1 since it's the default, so URL should be /search?q=test
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining('/search?q=test'),
        { replace: true }
      );
      // Verify page=1 is NOT in the URL (since it's the default)
      const navigateCalls = mockNavigate.mock.calls;
      const lastCall = navigateCalls[navigateCalls.length - 1];
      expect(lastCall[0]).not.toContain('page=1');
    });
  });

  test('handles pagination navigation - clicking page number', async () => {
    const user = userEvent.setup();
    mockLocation.search = '?q=test&page=1';
    
    const products = Array.from({ length: 20 }, (_, i) => ({
      _id: `product${i + 1}`,
      name: `Test Product ${i + 1}`,
      price: 100 + i * 10,
      imageCover: `https://example.com/image${i + 1}.jpg`,
    }));

    mockUseSearchResults.mockReturnValue({
      data: {
        data: products,
        totalProducts: 60,
        currentPage: 1,
        totalPages: 3,
        pagination: {
          page: 1,
          limit: 20,
          total: 60,
          totalPages: 3,
          hasNext: true,
          hasPrev: false,
          visiblePages: [1, 2, 3],
          showEllipsisStart: false,
          showEllipsisEnd: false,
        },
      },
      isLoading: false,
      error: null,
    });

    renderWithProviders(<SearchResultsPage />);

    await waitFor(() => {
      // Component checks: showPagination = !isLoading && hasPagination && !error
      expect(screen.getByTestId('search-pagination')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Click page 3
    const page3Button = screen.getByTestId('pagination-page-3');
    await user.click(page3Button);

    // Verify navigation was called with page 3
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining('page=3'),
        { replace: true }
      );
    });
  });

  test('disables previous button on first page', async () => {
    mockLocation.search = '?q=test&page=1';
    
    const products = Array.from({ length: 20 }, (_, i) => ({
      _id: `product${i + 1}`,
      name: `Test Product ${i + 1}`,
      price: 100 + i * 10,
      imageCover: `https://example.com/image${i + 1}.jpg`,
    }));

    mockUseSearchResults.mockReturnValue({
      data: {
        data: products,
        totalProducts: 60,
        currentPage: 1,
        totalPages: 3,
        pagination: {
          page: 1,
          limit: 20,
          total: 60,
          totalPages: 3,
          hasNext: true,
          hasPrev: false, // Backend indicates no previous page
          visiblePages: [1, 2, 3],
          showEllipsisStart: false,
          showEllipsisEnd: false,
        },
      },
      isLoading: false,
      error: null,
    });

    renderWithProviders(<SearchResultsPage />);

    await waitFor(() => {
      // Component checks: showPagination = !isLoading && hasPagination && !error
      expect(screen.getByTestId('search-pagination')).toBeInTheDocument();
      const prevButton = screen.getByTestId('pagination-prev');
      expect(prevButton).toBeDisabled();
      
      const nextButton = screen.getByTestId('pagination-next');
      expect(nextButton).not.toBeDisabled();
    }, { timeout: 3000 });
  });

  test('disables next button on last page', async () => {
    mockLocation.search = '?q=test&page=3';
    
    const products = Array.from({ length: 20 }, (_, i) => ({
      _id: `product${i + 1}`,
      name: `Test Product ${i + 1}`,
      price: 100 + i * 10,
      imageCover: `https://example.com/image${i + 1}.jpg`,
    }));

    mockUseSearchResults.mockReturnValue({
      data: {
        data: products,
        totalProducts: 60,
        currentPage: 3,
        totalPages: 3,
        pagination: {
          page: 3,
          limit: 20,
          total: 60,
          totalPages: 3,
          hasNext: false, // Backend indicates no next page
          hasPrev: true,
          visiblePages: [1, 2, 3],
          showEllipsisStart: false,
          showEllipsisEnd: false,
        },
      },
      isLoading: false,
      error: null,
    });

    renderWithProviders(<SearchResultsPage />);

    await waitFor(() => {
      // Component checks: showPagination = !isLoading && hasPagination && !error
      expect(screen.getByTestId('search-pagination')).toBeInTheDocument();
      const nextButton = screen.getByTestId('pagination-next');
      expect(nextButton).toBeDisabled();
      
      const prevButton = screen.getByTestId('pagination-prev');
      expect(prevButton).not.toBeDisabled();
    }, { timeout: 3000 });
  });

  test('handles backend pagination fallback when pagination object is missing', async () => {
    mockLocation.search = '?q=test';
    
    const products = [
      {
        _id: 'product1',
        name: 'Test Product 1',
        price: 100,
        imageCover: 'https://example.com/image1.jpg',
      },
    ];

    // Simulate old API response without pagination object (backward compatibility)
    // Component extracts: const data = productData?.data || productData || {};
    // products = data.data || []
    mockUseSearchResults.mockReturnValue({
      data: {
        data: products, // Component extracts: data.data
        totalProducts: 1,
        currentPage: 1,
        totalPages: 1, // totalPages === 1 means no pagination
        // No pagination object - component uses fallback: pagination: data.pagination || null
      },
      isLoading: false,
      error: null,
    });

    renderWithProviders(<SearchResultsPage />);

    await waitFor(() => {
      // Component should still render correctly with fallback
      // showProductsGrid = !isLoading && hasProducts && !error
      expect(screen.getByTestId('search-products-grid')).toBeInTheDocument();
      expect(screen.getByTestId('product-card-product1')).toBeInTheDocument();
      // No pagination should show when totalPages === 1 (hasPagination = totalPagesValue > 1)
      expect(screen.queryByTestId('search-pagination')).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('scrolls to top when page changes via useEffect', async () => {
    const scrollToSpy = jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
    
    // Ensure search query is set so the hook is enabled
    mockLocation.search = '?q=test&page=1';
    
    const products = Array.from({ length: 20 }, (_, i) => ({
      _id: `product${i + 1}`,
      name: `Test Product ${i + 1}`,
      price: 100 + i * 10,
      imageCover: `https://example.com/image${i + 1}.jpg`,
    }));

    // Component extracts: const data = productData?.data || productData || {};
    // products = data.data || []
    mockUseSearchResults.mockReturnValue({
      data: {
        data: products, // Component extracts: data.data
        totalProducts: 60,
        currentPage: 1,
        totalPages: 3, // totalPages > 1 triggers pagination
        pagination: {
          page: 1,
          limit: 20,
          total: 60,
          totalPages: 3,
          hasNext: true,
          hasPrev: false,
          visiblePages: [1, 2, 3],
          showEllipsisStart: false,
          showEllipsisEnd: false,
        },
      },
      isLoading: false,
      error: null,
    });

    const { rerender } = renderWithProviders(<SearchResultsPage />);

    // Wait for initial render with page 1
    await waitFor(() => {
      expect(screen.getByTestId('search-products-grid')).toBeInTheDocument();
      expect(screen.getByTestId('search-pagination')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Clear scrollTo calls from initial render (useEffect runs on mount)
    scrollToSpy.mockClear();

    // Simulate page change by updating location
    // Component's useEffect watches pageFromUrl (from urlParams.page)
    mockLocation.search = '?q=test&page=2';
    
    // Update mock to return page 2 data
    mockUseSearchResults.mockReturnValue({
      data: {
        data: products,
        totalProducts: 60,
        currentPage: 2, // Updated currentPage
        totalPages: 3,
        pagination: {
          page: 2,
          limit: 20,
          total: 60,
          totalPages: 3,
          hasNext: true,
          hasPrev: true,
          visiblePages: [1, 2, 3],
          showEllipsisStart: false,
          showEllipsisEnd: false,
        },
      },
      isLoading: false,
      error: null,
    });
    
    // Rerender to trigger useEffect with new URL params
    rerender(<SearchResultsPage />);

    // Wait for useEffect to detect pageFromUrl change (1 -> 2) and call scrollTo
    await waitFor(() => {
      expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    }, { timeout: 3000 });

    scrollToSpy.mockRestore();
  });
});

