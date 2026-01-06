/**
 * TrackingPage Component Tests
 * 
 * Tests:
 * - Renders error state when tracking number is missing
 * - Renders loading state when tracking data is loading
 * - Renders error state when tracking fails
 * - Renders tracking information successfully
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import TrackingPage from '@/features/orders/TrackingPage';

// Mock react-router-dom
const mockParams = { trackingNumber: 'TRACK123' };
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => mockParams,
  useNavigate: () => mockNavigate,
}));

// Mock orderService
const mockGetOrderByTrackingNumber = jest.fn();
jest.mock('@/shared/services/orderApi', () => ({
  __esModule: true,
  orderService: {
    getOrderByTrackingNumber: (...args) => mockGetOrderByTrackingNumber(...args),
  },
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
  LoadingState: ({ message }) => <div data-testid="loading-state">{message}</div>,
  ErrorState: ({ title, message, onRetry }) => (
    <div data-testid="error-state">
      <h2>{title}</h2>
      <p>{message}</p>
      {onRetry && <button onClick={onRetry}>Retry</button>}
    </div>
  ),
}));

describe('TrackingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockParams.trackingNumber = 'TRACK123';
    mockNavigate.mockClear();
    mockGetOrderByTrackingNumber.mockResolvedValue({
      data: {
        order: {
          _id: 'order1',
          trackingNumber: 'TRACK123',
          status: 'shipped',
        },
      },
    });
  });

  test('renders error state when tracking number is missing', async () => {
    mockParams.trackingNumber = undefined;

    renderWithProviders(<TrackingPage />);

    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
      expect(screen.getByText('Tracking Number Missing')).toBeInTheDocument();
    });
  });

  test('renders loading state when tracking data is loading', async () => {
    mockGetOrderByTrackingNumber.mockImplementation(() => new Promise(() => {}));

    renderWithProviders(<TrackingPage />);

    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
      expect(screen.getByText(/loading tracking information/i)).toBeInTheDocument();
    });
  });

  test('renders error state when tracking fails', async () => {
    mockGetOrderByTrackingNumber.mockRejectedValue({
      response: { status: 404, data: { message: 'Order not found' } },
    });

    renderWithProviders(<TrackingPage />);

    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
      expect(screen.getByText(/order not found/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('renders tracking information successfully', async () => {
    const order = {
      _id: 'order1',
      trackingNumber: 'TRACK123',
      status: 'shipped',
      orderItems: [],
      shippingAddress: {
        fullName: 'Test User',
        address: '123 Test St',
      },
    };

    mockGetOrderByTrackingNumber.mockResolvedValue({
      data: { order },
    });

    renderWithProviders(<TrackingPage />);

    await waitFor(() => {
      expect(screen.getByText(/TRACK123/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});

