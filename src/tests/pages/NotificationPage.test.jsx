/**
 * NotificationPage Component Tests
 * 
 * Tests for the NotificationPage:
 * - Renders notification settings page
 * - Displays notification settings
 * - Handles toggle settings
 * - Handles loading state
 * - Handles error state
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../test-utils';
import NotificationPage from '../../features/profile/NotificationPage';

// Mock useNotification hooks
const mockSettings = {
  email: {
    order: true,
    promotion: true,
    security: true,
  },
  push: {
    order: false,
    promotion: false,
    security: true,
  },
  sms: {
    order: false,
    promotion: false,
    security: false,
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '08:00',
  },
};

const mockUseNotificationSettings = jest.fn(() => ({
  data: mockSettings,
  isLoading: false,
  isError: false,
}));

const mockUpdateSetting = {
  mutate: jest.fn(),
  isPending: false,
};

const mockResetSettings = {
  mutate: jest.fn(),
  isPending: false,
};

const mockUseUpdateNotificationSetting = jest.fn(() => mockUpdateSetting);
const mockUseResetNotificationSettings = jest.fn(() => mockResetSettings);

jest.mock('../../shared/hooks/useNotification', () => ({
  useNotificationSettings: (...args) => mockUseNotificationSettings(...args),
  useUpdateNotificationSetting: (...args) => mockUseUpdateNotificationSetting(...args),
  useResetNotificationSettings: (...args) => mockUseResetNotificationSettings(...args),
}));

describe('NotificationPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock window.confirm
    window.confirm = jest.fn(() => true);
  });

  test('renders notification settings page', async () => {
    renderWithProviders(<NotificationPage />);

    await waitFor(() => {
      expect(screen.getByText(/notification settings/i)).toBeInTheDocument();
    });
  });

  test('displays notification settings', async () => {
    renderWithProviders(<NotificationPage />);

    await waitFor(() => {
      expect(screen.getByText(/customize how and when/i)).toBeInTheDocument();
    });
  });

  test('handles loading state', async () => {
    mockUseNotificationSettings.mockReturnValue({
      data: null,
      isLoading: true,
      isError: false,
    });

    renderWithProviders(<NotificationPage />);

    await waitFor(() => {
      expect(screen.getByText(/loading notification settings/i)).toBeInTheDocument();
    });
  });

  test('handles error state', async () => {
    mockUseNotificationSettings.mockReturnValue({
      data: null,
      isLoading: false,
      isError: true,
    });

    renderWithProviders(<NotificationPage />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load notification settings/i)).toBeInTheDocument();
    });
  });
});

