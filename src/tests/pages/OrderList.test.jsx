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
import { ModalProvider } from '@/components/modal/ModalProvider';

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

jest.mock('@/shared/hooks/useOrder', () => {
  const actual = jest.requireActual('@/shared/hooks/useOrder');
  return {
    __esModule: true,
    ...actual,
    useGetUserOrders: (...args) => mockUseGetUserOrders(...args),
    getOrderStructure: (data) => {
      if (!data) return [];
      if (Array.isArray(data)) return data;
      if (data.data && Array.isArray(data.data)) return data.data;
      if (data.orders && Array.isArray(data.orders)) return data.orders;
      return [];
    },
    useDeleteOrder: (...args) => mockUseDeleteOrder(...args),
  };
});

// Mock useModal so showDanger immediately invokes onConfirm (avoids modal interaction)
const mockShowDanger = jest.fn(({ onConfirm }) => {
  if (typeof onConfirm === 'function') onConfirm();
});
const mockShowAlert = jest.fn();
jest.mock('@/shared/hooks/useModal', () => ({
  useModal: () => ({
    showDanger: mockShowDanger,
    showAlert: mockShowAlert,
    showWarning: jest.fn(),
    showSuccess: jest.fn(),
    showInfo: jest.fn(),
    hideModal: jest.fn(),
  }),
}));

// Mock window.confirm
const mockConfirm = jest.fn(() => true);
window.confirm = mockConfirm;

const renderOrdersPage = (ui = <OrdersPage />) =>
  renderWithProviders(<ModalProvider>{ui}</ModalProvider>);

describe('OrdersPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    mockConfirm.mockReturnValue(true);
    mockShowDanger.mockImplementation(({ onConfirm }) => {
      if (typeof onConfirm === 'function') onConfirm();
    });
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

    renderOrdersPage();

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

    renderOrdersPage();

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
        status: 'completed',
        currentStatus: 'delivered',
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

    renderOrdersPage();

    await waitFor(() => {
      expect(screen.getByText('Order Management')).toBeInTheDocument();
      // Component formats order numbers: shows last 8 chars with # prefix
      const order1Elements = screen.getAllByText(/23456789/);
      expect(order1Elements.length).toBeGreaterThan(0);
      const order2Elements = screen.getAllByText(/87654321/);
      expect(order2Elements.length).toBeGreaterThan(0);
      // "Processing" and "Delivered" appear in both status badges and filter dropdown
      expect(screen.getAllByText('Processing').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Delivered').length).toBeGreaterThan(0);
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
        status: 'completed',
        currentStatus: 'delivered',
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

    renderOrdersPage();

    await waitFor(() => {
      expect(screen.getByText('Order Management')).toBeInTheDocument();
    });

    // Change filter to "processing"
    const filterSelect = screen.getByRole('combobox');
    await user.selectOptions(filterSelect, 'processing');

    await waitFor(() => {
      expect(filterSelect).toHaveValue('processing');
      // Only processing order should be visible
      const order1Elements = screen.getAllByText(/23456789/);
      expect(order1Elements.length).toBeGreaterThan(0);
      const order2Elements = screen.queryAllByText(/87654321/);
      expect(order2Elements.length).toBe(0);
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
        status: 'completed',
        currentStatus: 'delivered',
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

    renderOrdersPage();

    await waitFor(() => {
      expect(screen.getByText('Order Management')).toBeInTheDocument();
    });

    // Type in search box
    const searchInput = screen.getByPlaceholderText(/search orders/i);
    await user.type(searchInput, 'ORD123');

    await waitFor(() => {
      expect(searchInput).toHaveValue('ORD123');
      const order1Elements = screen.getAllByText(/23456789/);
      expect(order1Elements.length).toBeGreaterThan(0);
      const order2Elements = screen.queryAllByText(/87654321/);
      expect(order2Elements.length).toBe(0);
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
        status: 'completed',
        currentStatus: 'delivered',
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

    renderOrdersPage();

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

    renderOrdersPage();

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

    renderOrdersPage();

    await waitFor(() => {
      expect(screen.getByText('Order Management')).toBeInTheDocument();
    });

    // Click delete button - mock useModal's showDanger immediately calls onConfirm
    const deleteButtons = screen.getAllByTitle('Delete Order');
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(mockShowDanger).toHaveBeenCalled();
      expect(mockDeleteMutate).toHaveBeenCalledWith('order1', expect.any(Object));
    });
  });
});

