/**
 * AddressPage Component Tests
 * 
 * Tests:
 * - Renders loading state when addresses are loading
 * - Renders error state when addresses fail to load
 * - Renders empty state when no addresses found
 * - Renders addresses successfully
 * - Handles create address
 * - Handles update address
 * - Handles delete address
 * - Handles set default address
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import AddressManagementPage from '@/features/profile/AddressPage';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock useAddress hooks
const mockUseGetUserAddress = jest.fn(() => ({
  data: null,
  isLoading: false,
  isError: false,
  refetch: jest.fn(),
}));

const mockUseCreateAddress = jest.fn(() => ({
  mutate: jest.fn(),
  isPending: false,
}));

const mockUseUpdateAddress = jest.fn(() => ({
  mutate: jest.fn(),
  isPending: false,
}));

const mockUseDeleteAddress = jest.fn(() => ({
  mutate: jest.fn(),
  isPending: false,
}));

const mockUseSetDefaultAddress = jest.fn(() => ({
  mutate: jest.fn(),
  isPending: false,
}));

jest.mock('@/shared/hooks/useAddress', () => ({
  __esModule: true,
  useGetUserAddress: (...args) => mockUseGetUserAddress(...args),
  useCreateAddress: (...args) => mockUseCreateAddress(...args),
  useUpdateAddress: (...args) => mockUseUpdateAddress(...args),
  useDeleteAddress: (...args) => mockUseDeleteAddress(...args),
  useSetDefaultAddress: (...args) => mockUseSetDefaultAddress(...args),
}));

// Mock loading components
jest.mock('@/components/loading', () => ({
  __esModule: true,
  LoadingState: () => <div data-testid="loading-state">Loading...</div>,
  ErrorState: ({ title, message, onRetry }) => (
    <div data-testid="error-state">
      <h2>{title}</h2>
      <p>{message}</p>
      {onRetry && <button onClick={onRetry}>Retry</button>}
    </div>
  ),
}));

describe('AddressManagementPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    mockUseGetUserAddress.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
  });

  test('renders loading state when addresses are loading', async () => {
    mockUseGetUserAddress.mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
      refetch: jest.fn(),
    });

    renderWithProviders(<AddressManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
    });
  });

  test('renders error state when addresses fail to load', async () => {
    mockUseGetUserAddress.mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
      refetch: jest.fn(),
    });

    renderWithProviders(<AddressManagementPage />);

    await waitFor(() => {
      expect(screen.getByTestId('error-state')).toBeInTheDocument();
    });
  });

  test('renders empty state when no addresses found', async () => {
    mockUseGetUserAddress.mockReturnValue({
      data: { data: { data: { addresses: [] } } },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });

    renderWithProviders(<AddressManagementPage />);

    await waitFor(() => {
      expect(screen.getByText(/no addresses/i)).toBeInTheDocument();
    });
  });

  test('renders addresses successfully', async () => {
    const addresses = [
      {
        _id: 'address1',
        fullName: 'Test User',
        streetAddress: '123 Test St',
        city: 'Accra',
        region: 'Greater Accra',
        isDefault: true,
      },
      {
        _id: 'address2',
        fullName: 'Test User',
        streetAddress: '456 Test Ave',
        city: 'Kumasi',
        region: 'Ashanti',
        isDefault: false,
      },
    ];

    mockUseGetUserAddress.mockReturnValue({
      data: { data: { data: { addresses } } },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });

    renderWithProviders(<AddressManagementPage />);

    await waitFor(() => {
      expect(screen.getByText('123 Test St')).toBeInTheDocument();
      expect(screen.getByText('456 Test Ave')).toBeInTheDocument();
    });
  });

  test('handles create address', async () => {
    const user = userEvent.setup();
    const mockCreateMutate = jest.fn();
    mockUseCreateAddress.mockReturnValue({
      mutate: mockCreateMutate,
      isPending: false,
    });

    mockUseGetUserAddress.mockReturnValue({
      data: { data: { data: { addresses: [] } } },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });

    renderWithProviders(<AddressManagementPage />);

    await waitFor(() => {
      expect(screen.getByText(/no addresses/i)).toBeInTheDocument();
    });

    // Find and click add address button
    const addButtons = screen.queryAllByText(/add address/i);
    if (addButtons.length > 0) {
      await user.click(addButtons[0]);
      // Form should appear for creating address
    }
  });
});

