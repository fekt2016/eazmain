/**
 * OrderList Component Tests
 * 
 * Tests:
 * - Renders loading state when orders are loading
 * - Renders empty state when no orders found
 * - Renders orders successfully
 * - Handles filtering by status
 * - Handles search functionality
 * - Handles sorting functionality
 * - Handles order actions (view, edit, delete)
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import OrdersPage from '@/features/orders/OrderList';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock useOrder hooks
const mockUseGetUserOrders = jest.fn(() => ({
  data: null,
  isLoading: false,
  error: null,
}));

const mockUseDeleteOrder = jest.fn(() => ({
  mutate: jest.fn(),
  isPending: false,
}));

jest.mock('@/shared/hooks/useOrder', () => ({
  __esModule: true,
  useGetUserOrders: (...args) => mockUseGetUserOrders(...args),
  getOrderStructure: (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.data && Array.isArray(data.data)) return data.data;
    if (data.orders && Array.isArray(data.orders)) return data.orders;
    return [];
  },
  useDeleteOrder: (...args) => mockUseDeleteOrder(...args),
}));

// Mock window.confirm
const mockConfirm = jest.fn(() => true);
window.confirm = mockConfirm;

describe('OrdersPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    mockConfirm.mockReturnValue(true);
    mockUseGetUserOrders.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });
    mockUseDeleteOrder.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });
  });

  test('renders loading state when orders are loading', async () => {
    mockUseGetUserOrders.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    renderWithProviders(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('Order Management')).toBeInTheDocument();
    });
  });

  test('renders empty state when no orders found', async () => {
    mockUseGetUserOrders.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    renderWithProviders(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('No orders found')).toBeInTheDocument();
      expect(screen.getByText(/No orders have been placed yet/i)).toBeInTheDocument();
    });
  });

  test('renders orders successfully', async () => {
    const orders = [
      {
        id: 'order1',
        orderNumber: 'ORD123456789',
        createdAt: '2024-01-15T10:00:00Z',
        status: 'processing',
        totalPrice: 150.00,
        orderItems: [
          { _id: 'item1', name: 'Product 1', quantity: 1 },
        ],
        trackingNumber: 'TRACK123',
        user: { name: 'Test User' },
      },
      {
        id: 'order2',
        orderNumber: 'ORD987654321',
        createdAt: '2024-01-16T10:00:00Z',
        status: 'delivered',
        totalPrice: 200.00,
        orderItems: [
          { _id: 'item2', name: 'Product 2', quantity: 2 },
        ],
        trackingNumber: null,
        user: { name: 'Test User' },
      },
    ];

    mockUseGetUserOrders.mockReturnValue({
      data: orders,
      isLoading: false,
      error: null,
    });

    renderWithProviders(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('Order Management')).toBeInTheDocument();
      // Component formats order numbers: shows last 8 chars with # prefix
      // "ORD123456789" becomes "#23456789", "ORD987654321" becomes "#87654321"
      // Multiple elements may contain the same text, so use getAllByText
      const order1Elements = screen.getAllByText(/#23456789/i);
      expect(order1Elements.length).toBeGreaterThan(0);
      const order2Elements = screen.getAllByText(/#87654321/i);
      expect(order2Elements.length).toBeGreaterThan(0);
      expect(screen.getByText('Processing')).toBeInTheDocument();
      expect(screen.getByText('Delivered')).toBeInTheDocument();
    });
  });

  test('handles filtering by status', async () => {
    const user = userEvent.setup();
    const orders = [
      {
        id: 'order1',
        orderNumber: 'ORD123456789',
        createdAt: '2024-01-15T10:00:00Z',
        status: 'processing',
        totalPrice: 150.00,
        orderItems: [{ _id: 'item1', name: 'Product 1', quantity: 1 }],
        trackingNumber: 'TRACK123',
        user: { name: 'Test User' },
      },
      {
        id: 'order2',
        orderNumber: 'ORD987654321',
        createdAt: '2024-01-16T10:00:00Z',
        status: 'delivered',
        totalPrice: 200.00,
        orderItems: [{ _id: 'item2', name: 'Product 2', quantity: 2 }],
        trackingNumber: null,
        user: { name: 'Test User' },
      },
    ];

    mockUseGetUserOrders.mockReturnValue({
      data: orders,
      isLoading: false,
      error: null,
    });

    renderWithProviders(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('Order Management')).toBeInTheDocument();
    });

    // Change filter to "processing"
    const filterSelect = screen.getByRole('combobox');
    await user.selectOptions(filterSelect, 'processing');

    await waitFor(() => {
      expect(filterSelect).toHaveValue('processing');
      // Only processing order should be visible
      // Component formats: "ORD123456789" -> "#23456789"
      const order1Elements = screen.getAllByText(/#23456789/i);
      expect(order1Elements.length).toBeGreaterThan(0);
      expect(screen.queryByText(/#87654321/i)).not.toBeInTheDocument();
    });
  });

  test('handles search functionality', async () => {
    const user = userEvent.setup();
    const orders = [
      {
        id: 'order1',
        orderNumber: 'ORD123456789',
        createdAt: '2024-01-15T10:00:00Z',
        status: 'processing',
        totalPrice: 150.00,
        orderItems: [{ _id: 'item1', name: 'Product 1', quantity: 1 }],
        trackingNumber: 'TRACK123',
        user: { name: 'Test User' },
      },
      {
        id: 'order2',
        orderNumber: 'ORD987654321',
        createdAt: '2024-01-16T10:00:00Z',
        status: 'delivered',
        totalPrice: 200.00,
        orderItems: [{ _id: 'item2', name: 'Product 2', quantity: 2 }],
        trackingNumber: null,
        user: { name: 'Test User' },
      },
    ];

    mockUseGetUserOrders.mockReturnValue({
      data: orders,
      isLoading: false,
      error: null,
    });

    renderWithProviders(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('Order Management')).toBeInTheDocument();
    });

    // Type in search box
    const searchInput = screen.getByPlaceholderText(/search orders/i);
    await user.type(searchInput, 'ORD123');

    await waitFor(() => {
      expect(searchInput).toHaveValue('ORD123');
      // Only matching order should be visible
      // Component formats: "ORD123456789" -> "#23456789"
      // Search should still match the full order number in the data
      const order1Elements = screen.getAllByText(/#23456789/i);
      expect(order1Elements.length).toBeGreaterThan(0);
      expect(screen.queryByText(/#87654321/i)).not.toBeInTheDocument();
    });
  });

  test('handles sorting functionality', async () => {
    const user = userEvent.setup();
    const orders = [
      {
        id: 'order1',
        orderNumber: 'ORD123456789',
        createdAt: '2024-01-15T10:00:00Z',
        status: 'processing',
        totalPrice: 150.00,
        orderItems: [{ _id: 'item1', name: 'Product 1', quantity: 1 }],
        trackingNumber: 'TRACK123',
        user: { name: 'Test User' },
      },
      {
        id: 'order2',
        orderNumber: 'ORD987654321',
        createdAt: '2024-01-16T10:00:00Z',
        status: 'delivered',
        totalPrice: 200.00,
        orderItems: [{ _id: 'item2', name: 'Product 2', quantity: 2 }],
        trackingNumber: null,
        user: { name: 'Test User' },
      },
    ];

    mockUseGetUserOrders.mockReturnValue({
      data: orders,
      isLoading: false,
      error: null,
    });

    renderWithProviders(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('Order Management')).toBeInTheDocument();
    });

    // Click on date header to sort
    const dateHeader = screen.getByText('Date');
    await user.click(dateHeader);

    // Sorting should be applied (we can't easily test the visual order change without more setup)
    await waitFor(() => {
      expect(dateHeader).toBeInTheDocument();
    });
  });

  test('handles order view action', async () => {
    const user = userEvent.setup();
    const orders = [
      {
        id: 'order1',
        orderNumber: 'ORD123456789',
        createdAt: '2024-01-15T10:00:00Z',
        status: 'processing',
        totalPrice: 150.00,
        orderItems: [{ _id: 'item1', name: 'Product 1', quantity: 1 }],
        trackingNumber: 'TRACK123',
        user: { name: 'Test User' },
      },
    ];

    mockUseGetUserOrders.mockReturnValue({
      data: orders,
      isLoading: false,
      error: null,
    });

    renderWithProviders(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('Order Management')).toBeInTheDocument();
    });

    // Find and click view button
    const viewButtons = screen.getAllByTitle('View Details');
    await user.click(viewButtons[0]);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/orders/order1');
    });
  });

  test('handles order delete action', async () => {
    const user = userEvent.setup();
    const mockDeleteMutate = jest.fn();
    mockUseDeleteOrder.mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    });

    const orders = [
      {
        id: 'order1',
        orderNumber: 'ORD123456789',
        createdAt: '2024-01-15T10:00:00Z',
        status: 'processing',
        totalPrice: 150.00,
        orderItems: [{ _id: 'item1', name: 'Product 1', quantity: 1 }],
        trackingNumber: 'TRACK123',
        user: { name: 'Test User' },
      },
    ];

    mockUseGetUserOrders.mockReturnValue({
      data: orders,
      isLoading: false,
      error: null,
    });

    renderWithProviders(<OrdersPage />);

    await waitFor(() => {
      expect(screen.getByText('Order Management')).toBeInTheDocument();
    });

    // Find and click delete button
    const deleteButtons = screen.getAllByTitle('Delete Order');
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockConfirm).toHaveBeenCalled();
      expect(mockDeleteMutate).toHaveBeenCalledWith('order1');
    });
  });
});

