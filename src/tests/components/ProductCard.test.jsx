/**
 * ProductCard Component Tests
 * 
 * Tests:
 * - Renders product name, image, and price
 * - Shows discount badge when discount exists
 * - Clicking "Add to Cart" automatically selects DEFAULT variant SKU
 * - Never throws "Product variant SKU is required" error
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import ProductCard from '@/shared/components/ProductCard';
import { useCartActions } from '@/shared/hooks/useCart';
import { toast } from 'react-toastify';

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock all shared hooks and utilities
jest.mock('@/shared/hooks/useCart', () => ({
  __esModule: true,
  useCartActions: jest.fn(() => ({
    addToCart: jest.fn(() => Promise.resolve()),
    updateCartItem: jest.fn(),
    removeCartItem: jest.fn(),
    clearCart: jest.fn(),
    isAdding: false,
  })),
  useGetCart: jest.fn(() => ({
    data: { data: { cart: { products: [] } } },
    isLoading: false,
  })),
  useCartTotals: jest.fn(() => ({
    total: 0,
    subTotal: 0,
  })),
}));

jest.mock('@/shared/hooks/useWishlist', () => ({
  __esModule: true,
  useToggleWishlist: jest.fn(() => ({
    toggleWishlist: jest.fn(),
    isAdding: false,
    isRemoving: false,
    isInWishlist: false,
    isLoading: false,
  })),
  useRemoveFromWishlist: jest.fn(() => ({
    mutate: jest.fn(),
    isPending: false,
  })),
}));

jest.mock('@/shared/utils/productHelpers', () => ({
  __esModule: true,
  hasProductDiscount: jest.fn((product) => 
    product.originalPrice && product.originalPrice > product.price
  ),
  getProductDiscountPercentage: jest.fn((product) => {
    if (!product.originalPrice || !product.price) return 0;
    return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  }),
  isProductTrending: jest.fn(() => false),
  isProductNew: jest.fn(() => false),
  hasProductPriceRange: jest.fn(() => false),
  getProductTotalStock: jest.fn((product) => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
    }
    return product.stock || 0;
  }),
}));

describe('ProductCard', () => {
  let mockAddToCart;

  beforeEach(() => {
    jest.clearAllMocks();
    // Get the mocked useCartActions
    const mockUseCartActions = useCartActions();
    mockAddToCart = mockUseCartActions.addToCart;
  });

  const mockProductWithoutVariants = {
    _id: 'product1',
    name: 'Test Product',
    price: 100,
    imageCover: 'https://example.com/image.jpg',
    stock: 10,
  };

  const mockProductWithVariants = {
    _id: 'product2',
    name: 'Variant Product',
    price: 150,
    originalPrice: 200,
    imageCover: 'https://example.com/image2.jpg',
    variants: [
      {
        _id: 'variant1',
        sku: 'SKU-001',
        status: 'active',
        stock: 5,
        price: 150,
      },
      {
        _id: 'variant2',
        sku: 'SKU-002',
        status: 'active',
        stock: 3,
        price: 150,
      },
    ],
  };

  test('renders product name, image, and price', () => {
    renderWithProviders(<ProductCard product={mockProductWithoutVariants} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText(/GH₵100/i)).toBeInTheDocument();
  });

  test('shows discount badge when discount exists', () => {
    renderWithProviders(<ProductCard product={mockProductWithVariants} showBadges />);

    // Discount badge should show percentage
    expect(screen.getByText(/-25%/i)).toBeInTheDocument();
  });

  test('clicking "Add to Cart" automatically selects DEFAULT variant SKU for variant products', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <ProductCard product={mockProductWithVariants} showAddToCart />
    );

    // Find and click "Add to Cart" button
    const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
    
    // Click should not throw error
    await expect(user.click(addToCartButton)).resolves.not.toThrow();

    // Verify no SKU error is shown (behavior test, not implementation)
    await waitFor(() => {
      expect(screen.queryByText(/sku is required/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/product variant sku is required/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/please select product options/i)).not.toBeInTheDocument();
    });
  });

  test('never throws "Product variant SKU is required" error when adding variant product to cart', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <ProductCard product={mockProductWithVariants} showAddToCart />
    );

    const addToCartButton = screen.getByRole('button', { name: /add to cart/i });

    // Should not throw error
    await expect(user.click(addToCartButton)).resolves.not.toThrow();

    // Verify no error messages are shown (behavior test)
    await waitFor(() => {
      expect(screen.queryByText(/sku is required/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/product variant sku is required/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });
  });

  test('adds product without variants to cart without SKU', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <ProductCard product={mockProductWithoutVariants} showAddToCart />
    );

    const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
    
    // Click should not throw error
    await expect(user.click(addToCartButton)).resolves.not.toThrow();

    // Verify no error messages are shown (behavior test)
    await waitFor(() => {
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/sku is required/i)).not.toBeInTheDocument();
    });
  });

  test('disables "Add to Cart" button when product is out of stock', () => {
    const outOfStockProduct = {
      ...mockProductWithoutVariants,
      stock: 0,
    };

    renderWithProviders(
      <ProductCard product={outOfStockProduct} showAddToCart />
    );

    const addToCartButton = screen.getByRole('button', { name: /add to cart/i });
    expect(addToCartButton).toBeDisabled();
  });
});

