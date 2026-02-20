/**
 * ProductsPage Component Tests
 * 
 * Tests:
 * - Renders loading state when products are loading
 * - Renders empty state when no products found
 * - Renders products successfully
 * - Handles EazShop products section
 * - Handles filtering functionality
 * - Handles sorting functionality
 * - Handles Saiisai only filter
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import ProductsPage from '@/features/products/ProductsPage';

// Mock react-router-dom
const mockLocation = { search: '' };
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => mockLocation,
}));

// Create mock functions that can be overridden in tests
// Component uses: const { getProducts } = useProduct();
// Then: const { data, isLoading } = getProducts;
const mockGetProducts = {
  data: null,
  isLoading: false,
  error: null,
};

// Component uses: const { useGetEazShopProducts } = useEazShop();
// Then: const { data, isLoading } = useGetEazShopProducts();
// So useGetEazShopProducts is a FUNCTION that returns a hook result
const mockUseGetEazShopProductsResult = {
  data: null,
  isLoading: false,
  error: null,
};

const mockUseGetEazShopProducts = jest.fn(() => mockUseGetEazShopProductsResult);

jest.mock('@/shared/hooks/useProduct', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    getProducts: mockGetProducts,
  })),
}));

jest.mock('@/shared/hooks/useEazShop', () => ({
  __esModule: true,
  useEazShop: jest.fn(() => ({
    useGetEazShopProducts: mockUseGetEazShopProducts,
  })),
}));

// Mock useDynamicPageTitle
jest.mock('@/shared/hooks/useDynamicPageTitle', () => ({
  __esModule: true,
  default: jest.fn(() => { }),
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
  SkeletonGrid: ({ count }) => (
    <div data-testid="skeleton-grid">
      {Array.from({ length: count || 8 }).map((_, i) => (
        <div key={i} data-testid="skeleton-card">Loading...</div>
      ))}
    </div>
  ),
  SkeletonCard: () => <div data-testid="skeleton-card">Loading...</div>,
  EmptyState: ({ children }) => <div data-testid="empty-state">{children}</div>,
}));

describe('ProductsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocation.search = '';
    // Reset getProducts mock object
    mockGetProducts.data = null;
    mockGetProducts.isLoading = false;
    mockGetProducts.error = null;
    // Reset useGetEazShopProducts result object
    mockUseGetEazShopProductsResult.data = null;
    mockUseGetEazShopProductsResult.isLoading = false;
    mockUseGetEazShopProductsResult.error = null;
    // Reset the function mock
    mockUseGetEazShopProducts.mockReturnValue(mockUseGetEazShopProductsResult);
  });

  test('renders loading state when products are loading', async () => {
    // Component checks: if (isProductsLoading && isEazShopLoading)
    // So BOTH need to be true for loading state
    mockGetProducts.isLoading = true;
    mockUseGetEazShopProductsResult.isLoading = true;
    mockUseGetEazShopProducts.mockReturnValue(mockUseGetEazShopProductsResult);

    renderWithProviders(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByTestId('skeleton-grid')).toBeInTheDocument();
      expect(screen.getByText('All Products')).toBeInTheDocument();
    });
  });

  test('renders empty state when no products found', async () => {
    mockGetProducts.data = { results: [] };
    mockGetProducts.isLoading = false;
    mockUseGetEazShopProductsResult.data = [];
    mockUseGetEazShopProductsResult.isLoading = false;
    mockUseGetEazShopProducts.mockReturnValue(mockUseGetEazShopProductsResult);

    renderWithProviders(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('No Products Found')).toBeInTheDocument();
    });
  });

  test('renders products successfully', async () => {
    const products = [
      {
        _id: 'product1',
        name: 'Test Product 1',
        price: 100,
        status: 'active',
        imageCover: 'https://example.com/image1.jpg',
      },
      {
        _id: 'product2',
        name: 'Test Product 2',
        price: 150,
        status: 'active',
        imageCover: 'https://example.com/image2.jpg',
      },
    ];

    mockGetProducts.data = { results: products };
    mockGetProducts.isLoading = false;
    mockUseGetEazShopProductsResult.data = [];
    mockUseGetEazShopProductsResult.isLoading = false;
    mockUseGetEazShopProducts.mockReturnValue(mockUseGetEazShopProductsResult);

    renderWithProviders(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('All Products')).toBeInTheDocument();
      expect(screen.getByTestId('product-card-product1')).toBeInTheDocument();
      expect(screen.getByTestId('product-card-product2')).toBeInTheDocument();
      expect(screen.getByText(/products available/i)).toBeInTheDocument();
    });
  });

  test('handles Saiisai products section', async () => {
    const products = [
      {
        _id: 'product1',
        name: 'Test Product 1',
        price: 100,
        status: 'active',
        imageCover: 'https://example.com/image1.jpg',
      },
    ];

    const eazshopProducts = [
      {
        _id: 'eazshop1',
        name: 'EazShop Product',
        price: 200,
        status: 'active',
        isEazShopProduct: true,
        imageCover: 'https://example.com/eazshop.jpg',
      },
    ];

    mockGetProducts.data = { results: products };
    mockGetProducts.isLoading = false;
    // Component's useMemo processes eazshopProductsData - it handles arrays directly
    mockUseGetEazShopProductsResult.data = eazshopProducts; // Array format
    mockUseGetEazShopProductsResult.isLoading = false;
    mockUseGetEazShopProducts.mockReturnValue(mockUseGetEazShopProductsResult);

    renderWithProviders(<ProductsPage />);

    await waitFor(() => {
      // Check for EazShop section - text appears in EazShopTitle component
      expect(screen.getByText('Saiisai Official Store')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Verify the product is rendered - use getAllByTestId since it might appear in multiple sections
    const eazshopCards = screen.getAllByTestId('product-card-eazshop1');
    expect(eazshopCards.length).toBeGreaterThan(0);
    // Verify the product name is displayed - use getAllByText since it might appear multiple times
    const productTexts = screen.getAllByText('EazShop Product');
    expect(productTexts.length).toBeGreaterThan(0);
  });

  test('handles filtering functionality', async () => {
    const user = userEvent.setup();
    const products = [
      {
        _id: 'product1',
        name: 'Test Product 1',
        price: 100,
        status: 'active',
        imageCover: 'https://example.com/image1.jpg',
      },
    ];

    mockGetProducts.data = { results: products };
    mockGetProducts.isLoading = false;
    mockUseGetEazShopProductsResult.data = [];
    mockUseGetEazShopProductsResult.isLoading = false;
    mockUseGetEazShopProducts.mockReturnValue(mockUseGetEazShopProductsResult);

    renderWithProviders(<ProductsPage />);

    await waitFor(() => {
      // Verify products are rendered first
      expect(screen.getByTestId('product-card-product1')).toBeInTheDocument();
    });

    // Click filter button - use role and accessible name
    const filterButton = screen.getByRole('button', { name: /filter/i });
    await user.click(filterButton);

    // Filter sidebar should appear - use heading role to avoid multiple matches
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
        status: 'active',
        imageCover: 'https://example.com/image1.jpg',
      },
      {
        _id: 'product2',
        name: 'Test Product 2',
        price: 150,
        status: 'active',
        imageCover: 'https://example.com/image2.jpg',
      },
    ];

    mockGetProducts.data = { results: products };
    mockGetProducts.isLoading = false;
    mockUseGetEazShopProductsResult.data = [];
    mockUseGetEazShopProductsResult.isLoading = false;
    mockUseGetEazShopProducts.mockReturnValue(mockUseGetEazShopProductsResult);

    renderWithProviders(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('All Products')).toBeInTheDocument();
    });

    // Find and change sort option
    const sortSelect = screen.getByRole('combobox');
    await user.selectOptions(sortSelect, 'price-low');

    await waitFor(() => {
      expect(sortSelect).toHaveValue('price-low');
    });
  });

  test('handles Saiisai only filter from URL', async () => {
    mockLocation.search = '?eazshop=true';

    const products = [
      {
        _id: 'product1',
        name: 'Test Product 1',
        price: 100,
        status: 'active',
        isEazShopProduct: true,
        imageCover: 'https://example.com/image1.jpg',
      },
    ];

    mockGetProducts.data = { results: [] };
    mockGetProducts.isLoading = false;
    mockUseGetEazShopProductsResult.data = products;
    mockUseGetEazShopProductsResult.isLoading = false;
    mockUseGetEazShopProducts.mockReturnValue(mockUseGetEazShopProductsResult);

    renderWithProviders(<ProductsPage />);

    await waitFor(() => {
      expect(screen.getByText('Saiisai Official Store')).toBeInTheDocument();
    });
  });
});

