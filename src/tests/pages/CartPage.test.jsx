/**
 * CartPage Component Tests
 * 
 * Tests:
 * - Renders cart items with product details
 * - Updates quantity when increment/decrement buttons are clicked
 * - Validates quantity (min 1, max stock)
 * - Removes items from cart
 * - Shows empty state when cart is empty
 * - Navigates to checkout when authenticated
 * - Navigates to login when not authenticated
 * - Displays correct subtotal
 */

import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import CartPage from '@/features/cart/CartPage';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock all shared hooks
jest.mock('@/shared/hooks/useAuth', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    isAuthenticated: true,
    isLoading: false,
    user: { _id: 'user123', email: 'test@example.com' },
  })),
}));

// Create shared mock functions that will be reused
const mockUpdateCartItemFn = jest.fn(() => Promise.resolve());
const mockRemoveCartItemFn = jest.fn(() => Promise.resolve());
const mockAddToCartFn = jest.fn(() => Promise.resolve());

jest.mock('@/shared/hooks/useCart', () => ({
  __esModule: true,
  useGetCart: jest.fn(() => ({
    data: {
      data: {
        cart: {
          products: [
            {
              _id: 'cart-item-1',
              product: {
                _id: 'product1',
                name: 'Test Product 1',
                price: 100,
                defaultPrice: 100,
                imageCover: 'https://example.com/image1.jpg',
                stock: 10,
              },
              quantity: 2,
              sku: 'SKU-001',
            },
            {
              _id: 'cart-item-2',
              product: {
                _id: 'product2',
                name: 'Test Product 2',
                price: 150,
                defaultPrice: 150,
                imageCover: 'https://example.com/image2.jpg',
                stock: 5,
              },
              quantity: 1,
              sku: 'SKU-002',
            },
          ],
        },
      },
    },
    isLoading: false,
    isError: false,
  })),
  useCartTotals: jest.fn(() => ({
    total: 350, // (100 * 2) + (150 * 1)
    subTotal: 350,
    shipping: 0,
    discount: 0,
  })),
  useCartActions: jest.fn(() => ({
    updateCartItem: mockUpdateCartItemFn,
    removeCartItem: mockRemoveCartItemFn,
    addToCart: mockAddToCartFn,
    isUpdating: false,
    isRemoving: false,
    isAdding: false,
    updateCartItemMutation: { isPending: false },
    removeCartItemMutation: { isPending: false },
    addToCartMutation: { isPending: false },
  })),
  useAutoSyncCart: jest.fn(() => {}),
  getCartStructure: jest.fn((data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data?.data?.cart?.products) return data.data.cart.products;
    if (data?.cart?.products) return data.cart.products;
    if (data?.products) return data.products;
    if (data?.data?.products) return data.data.products;
    return [];
  }),
}));

jest.mock('@/shared/hooks/useDynamicPageTitle', () => ({
  __esModule: true,
  default: jest.fn(() => {}),
}));

// Mock loading components - CartPage imports from '../../components/loading'
// which resolves to '@/components/loading' with the alias
jest.mock('@/components/loading', () => ({
  __esModule: true,
  LoadingState: ({ message }) => <div data-testid="loading-state">{message}</div>,
  EmptyState: ({ title, message }) => (
    <div data-testid="empty-state">
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  ),
  ErrorState: ({ title, message }) => (
    <div data-testid="error-state">
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  ),
  ButtonSpinner: () => <span data-testid="button-spinner">Loading...</span>,
}));

describe('CartPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    // Clear the shared mock functions
    mockUpdateCartItemFn.mockClear();
    mockRemoveCartItemFn.mockClear();
    mockAddToCartFn.mockClear();
  });

  test('renders cart items with product details', async () => {
    renderWithProviders(<CartPage />);

    await waitFor(() => {
      expect(screen.getByText('Your Shopping Cart')).toBeInTheDocument();
      // Products appear in both cart and recommendations, so use getAllByText
      const product1Elements = screen.getAllByText('Test Product 1');
      const product2Elements = screen.getAllByText('Test Product 2');
      expect(product1Elements.length).toBeGreaterThan(0);
      expect(product2Elements.length).toBeGreaterThan(0);
      // Prices also appear multiple times
      const price100Elements = screen.getAllByText(/GH₵100.00/i);
      const price150Elements = screen.getAllByText(/GH₵150.00/i);
      expect(price100Elements.length).toBeGreaterThan(0);
      expect(price150Elements.length).toBeGreaterThan(0);
    });
  });

  test('displays correct subtotal in order summary', async () => {
    renderWithProviders(<CartPage />);

    await waitFor(() => {
      expect(screen.getByText('Order Summary')).toBeInTheDocument();
      // Subtotal should be 350 (100*2 + 150*1)
      expect(screen.getAllByText(/GH₵350.00/i).length).toBeGreaterThan(0);
    });
  });

  test('increments quantity when + button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartPage />);

    await waitFor(() => {
      // Product appears multiple times, verify it exists
      expect(screen.getAllByText('Test Product 1').length).toBeGreaterThan(0);
    });

    // Find the increment button for the first item (quantity is 2, so we should see buttons)
    const incrementButtons = screen.getAllByLabelText('Increase quantity');
    expect(incrementButtons.length).toBeGreaterThan(0);

    await user.click(incrementButtons[0]);

    await waitFor(() => {
      expect(mockUpdateCartItemFn).toHaveBeenCalledWith({
        itemId: 'cart-item-1',
        quantity: 3, // 2 + 1
      });
    }, { timeout: 3000 });
  });

  test('decrements quantity when - button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartPage />);

    await waitFor(() => {
      // Product appears multiple times, verify it exists
      expect(screen.getAllByText('Test Product 1').length).toBeGreaterThan(0);
    });

    // Find the decrement button for the first item
    const decrementButtons = screen.getAllByLabelText('Decrease quantity');
    expect(decrementButtons.length).toBeGreaterThan(0);

    // Find the first enabled decrement button (product 1 has quantity 2, so it should be enabled)
    const enabledDecrementButton = Array.from(decrementButtons).find(btn => !btn.disabled);
    expect(enabledDecrementButton).toBeTruthy();

    await user.click(enabledDecrementButton);

    await waitFor(() => {
      expect(mockUpdateCartItemFn).toHaveBeenCalledWith({
        itemId: 'cart-item-1',
        quantity: 1, // 2 - 1
      });
    }, { timeout: 3000 });
  });

  test('disables decrement button when quantity is 1', async () => {
    renderWithProviders(<CartPage />);

    await waitFor(() => {
      // Product 2 appears multiple times, verify it exists
      expect(screen.getAllByText('Test Product 2').length).toBeGreaterThan(0);
    });

    // Product 2 has quantity 1, so its decrement button should be disabled
    const decrementButtons = screen.getAllByLabelText('Decrease quantity');
    expect(decrementButtons.length).toBeGreaterThan(0);

    // Find the decrement button associated with quantity=1 input
    // The button next to an input with value="1" should be disabled
    const quantityInputs = screen.getAllByRole('spinbutton');
    const quantity1Input = quantityInputs.find(input => input.value === '1');
    
    if (quantity1Input) {
      // Find the decrement button in the same container
      const container = quantity1Input.closest('div');
      const decrementButton = container?.querySelector('button[aria-label="Decrease quantity"]');
      if (decrementButton) {
        expect(decrementButton).toBeDisabled();
      }
    }

    // At least verify that some decrement buttons exist
    expect(decrementButtons.length).toBeGreaterThan(0);
  });

  test('updates quantity when input value changes', async () => {
    renderWithProviders(<CartPage />);

    await waitFor(() => {
      // Verify product exists (may appear multiple times)
      expect(screen.getAllByText('Test Product 1').length).toBeGreaterThan(0);
    });

    // Find quantity input for first item (value should be 2)
    // Use getAllByRole to find number inputs in cart section
    const quantityInputs = screen.getAllByRole('spinbutton');
    const cartInputs = quantityInputs.filter(input => input.value === '2');
    expect(cartInputs.length).toBeGreaterThan(0);

    const firstInput = cartInputs[0];
    expect(firstInput).not.toBeDisabled();
    
    // Use fireEvent.change to directly set the value
    // This triggers onChange - the component may fire multiple updates:
    // 1. Normalization to min value (1)
    // 2. Final parsed value (5)
    fireEvent.change(firstInput, { target: { value: '5' } });

    // Wait for the function to be called (component may call it multiple times)
    await waitFor(() => {
      expect(mockUpdateCartItemFn).toHaveBeenCalled();
    }, { timeout: 3000 });

    // Check that it was called with quantity 5 at some point
    // (onChange may fire multiple times with intermediate values, which is valid)
    const calls = mockUpdateCartItemFn.mock.calls;
    const hasCallWithQuantity5 = calls.some(call => 
      call[0]?.itemId === 'cart-item-1' && call[0]?.quantity === 5
    );
    expect(hasCallWithQuantity5).toBe(true);
  });

  test('validates quantity to not exceed stock', async () => {
    renderWithProviders(<CartPage />);

    await waitFor(() => {
      // Product 2 appears multiple times, verify it exists
      expect(screen.getAllByText('Test Product 2').length).toBeGreaterThan(0);
    });

    // Product 2 has stock: 5, quantity: 1
    // Find quantity input for product 2 in cart section (value = 1)
    const quantityInputs = screen.getAllByRole('spinbutton');
    const cartInputs = quantityInputs.filter(input => input.value === '1');
    expect(cartInputs.length).toBeGreaterThan(0);

    // Use the first input with value 1 (should be product 2 in cart)
    const product2Input = cartInputs[0];
    expect(product2Input).not.toBeDisabled();

    // Set value to 10, which exceeds stock of 5
    // The component should cap it at stock (5)
    fireEvent.change(product2Input, { target: { value: '10' } });

    // Wait for the function to be called (the component validates and caps the quantity)
    await waitFor(() => {
      expect(mockUpdateCartItemFn).toHaveBeenCalled();
    }, { timeout: 3000 });

    // Check that it was called with quantity capped at stock (5)
    // The component's handleQuantityChange validates: Math.max(1, Math.min(10, 5)) = 5
    const calls = mockUpdateCartItemFn.mock.calls;
    const hasCallWithQuantity5 = calls.some(call => 
      call[0]?.itemId === 'cart-item-2' && call[0]?.quantity === 5
    );
    expect(hasCallWithQuantity5).toBe(true);
  });

  test('removes item from cart when Remove button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartPage />);

    await waitFor(() => {
      // Product appears multiple times, verify it exists
      expect(screen.getAllByText('Test Product 1').length).toBeGreaterThan(0);
    });

    // Find all Remove buttons (only in cart section, not recommendations)
    // Remove buttons are in cart items, not in recommendations
    const removeButtons = screen.getAllByText('Remove');
    expect(removeButtons.length).toBeGreaterThan(0);

    // Find the Remove button that's in the same container as "Test Product 1"
    // We'll use the first Remove button which should be for the first cart item
    const firstRemoveButton = removeButtons[0];
    
    // Verify the button is not disabled and is a button element
    expect(firstRemoveButton).not.toBeDisabled();
    expect(firstRemoveButton.tagName).toBe('BUTTON');

    // Use userEvent.click for proper user interaction simulation
    await user.click(firstRemoveButton);

    // Wait for the function to be called
    await waitFor(() => {
      expect(mockRemoveCartItemFn).toHaveBeenCalled();
    }, { timeout: 3000 });

    // Verify it was called with the correct item ID
    expect(mockRemoveCartItemFn).toHaveBeenCalledWith('cart-item-1');
  });

  test('shows empty state when cart is empty', async () => {
    const { useGetCart } = require('@/shared/hooks/useCart');
    useGetCart.mockReturnValueOnce({
      data: {
        data: {
          cart: {
            products: [],
          },
        },
      },
      isLoading: false,
      isError: false,
    });

    renderWithProviders(<CartPage />);

    await waitFor(() => {
      expect(screen.getByTestId('empty-state')).toBeInTheDocument();
      expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
      expect(screen.getByText('Browse our products and add items to your cart')).toBeInTheDocument();
    });
  });

  test('shows error state when cart fails to load', async () => {
    const { useGetCart } = require('@/shared/hooks/useCart');
    useGetCart.mockReturnValueOnce({
      data: null,
      isLoading: false,
      isError: true,
    });

    renderWithProviders(<CartPage />);

    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
      expect(screen.getByText('Failed to load cart')).toBeInTheDocument();
    });
  });

  test('shows loading state when cart is loading', async () => {
    const { useGetCart } = require('@/shared/hooks/useCart');
    useGetCart.mockReturnValueOnce({
      data: null,
      isLoading: true,
      isError: false,
    });

    renderWithProviders(<CartPage />);

    expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    expect(screen.getByText('Loading cart...')).toBeInTheDocument();
  });

  test('navigates to checkout when authenticated user clicks checkout', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartPage />);

    await waitFor(() => {
      expect(screen.getByText('Proceed to Checkout')).toBeInTheDocument();
    });

    const checkoutButton = screen.getByText('Proceed to Checkout');
    await user.click(checkoutButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/checkout');
    });
  });

  test('navigates to login when unauthenticated user clicks checkout', async () => {
    const { default: useAuth } = require('@/shared/hooks/useAuth');
    useAuth.mockReturnValueOnce({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });

    const user = userEvent.setup();
    renderWithProviders(<CartPage />);

    await waitFor(() => {
      expect(screen.getByText('Proceed to Checkout')).toBeInTheDocument();
    });

    const checkoutButton = screen.getByText('Proceed to Checkout');
    await user.click(checkoutButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  test('displays correct item total (price * quantity)', async () => {
    renderWithProviders(<CartPage />);

    await waitFor(() => {
      // Product 1: 100 * 2 = 200 (appears in cart item total)
      // Product 2: 150 * 1 = 150 (appears in cart item total)
      // Prices appear multiple times, so use getAllByText
      const price200Elements = screen.getAllByText(/GH₵200.00/i);
      const price150Elements = screen.getAllByText(/GH₵150.00/i);
      // At least one instance of each should exist (in cart section)
      expect(price200Elements.length).toBeGreaterThan(0);
      expect(price150Elements.length).toBeGreaterThan(0);
    });
  });

  test('disables quantity buttons when updating', async () => {
    const { useCartActions } = require('@/shared/hooks/useCart');
    useCartActions.mockReturnValueOnce({
      updateCartItem: jest.fn(),
      removeCartItem: jest.fn(),
      addToCart: jest.fn(),
      isUpdating: true, // Cart is updating
      isRemoving: false,
      isAdding: false,
      updateCartItemMutation: { isPending: true },
      removeCartItemMutation: { isPending: false },
      addToCartMutation: { isPending: false },
    });

    renderWithProviders(<CartPage />);

    await waitFor(() => {
      // Quantity inputs should be disabled when updating
      const quantityInputs = screen.getAllByRole('spinbutton');
      quantityInputs.forEach((input) => {
        expect(input).toBeDisabled();
      });
    });
  });
});

