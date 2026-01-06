/**
 * CategoriesListPage Component Tests
 * 
 * Tests:
 * - Renders loading state when categories are loading
 * - Renders error state when categories fail to load
 * - Renders empty state when no categories found
 * - Renders categories successfully
 * - Filters to show only parent categories
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import CategoriesListPage from '@/features/categories/CategoriesListPage';

// Mock useCategory
const mockGetCategories = {
  data: null,
  isLoading: false,
  isError: false,
};

jest.mock('@/shared/hooks/useCategory', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    getCategories: mockGetCategories,
  })),
}));

// Mock useDynamicPageTitle
jest.mock('@/shared/hooks/useDynamicPageTitle', () => ({
  __esModule: true,
  default: jest.fn(() => {}),
}));

// Container is already mocked globally in setupTests.js
// No need to mock it again here

// Mock loading components
jest.mock('@/components/loading', () => ({
  __esModule: true,
  LoadingState: () => <div data-testid="loading-state">Loading...</div>,
}));

describe('CategoriesListPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCategories.data = null;
    mockGetCategories.isLoading = false;
    mockGetCategories.isError = false;
  });

  test('renders loading state when categories are loading', async () => {
    mockGetCategories.isLoading = true;

    renderWithProviders(<CategoriesListPage />);

    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    });
  });

  test('renders error state when categories fail to load', async () => {
    mockGetCategories.isError = true;

    renderWithProviders(<CategoriesListPage />);

    await waitFor(() => {
      expect(screen.getByText('Unable to Load Categories')).toBeInTheDocument();
      expect(screen.getByText(/There was an error loading categories/i)).toBeInTheDocument();
    });
  });

  test('renders empty state when no categories found', async () => {
    mockGetCategories.data = { results: [] };

    renderWithProviders(<CategoriesListPage />);

    await waitFor(() => {
      expect(screen.getByText('No Categories Available')).toBeInTheDocument();
      expect(screen.getByText(/Check back later for new categories/i)).toBeInTheDocument();
    });
  });

  test('renders categories successfully', async () => {
    const categories = [
      {
        _id: 'cat1',
        name: 'Electronics',
        slug: 'electronics',
        image: 'https://example.com/electronics.jpg',
        productCount: 50,
        parentCategory: null,
      },
      {
        _id: 'cat2',
        name: 'Fashion',
        slug: 'fashion',
        image: 'https://example.com/fashion.jpg',
        productCount: 30,
        parentCategory: null,
      },
      {
        _id: 'cat3',
        name: 'Laptops',
        slug: 'laptops',
        image: 'https://example.com/laptops.jpg',
        productCount: 20,
        parentCategory: 'cat1', // Subcategory
      },
    ];

    mockGetCategories.data = { results: categories };

    renderWithProviders(<CategoriesListPage />);

    await waitFor(() => {
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('Fashion')).toBeInTheDocument();
      // Subcategory should not be shown (only parent categories)
      expect(screen.queryByText('Laptops')).not.toBeInTheDocument();
    });
  });

  test('filters to show only parent categories', async () => {
    const categories = [
      {
        _id: 'cat1',
        name: 'Parent Category 1',
        slug: 'parent1',
        parentCategory: null,
      },
      {
        _id: 'cat2',
        name: 'Subcategory 1',
        slug: 'sub1',
        parentCategory: 'cat1',
      },
      {
        _id: 'cat3',
        name: 'Parent Category 2',
        slug: 'parent2',
        parentCategory: null,
      },
    ];

    mockGetCategories.data = { results: categories };

    renderWithProviders(<CategoriesListPage />);

    await waitFor(() => {
      expect(screen.getByText('Parent Category 1')).toBeInTheDocument();
      expect(screen.getByText('Parent Category 2')).toBeInTheDocument();
      expect(screen.queryByText('Subcategory 1')).not.toBeInTheDocument();
    });
  });
});

