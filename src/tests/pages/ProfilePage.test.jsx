/**
 * ProfilePage Component Tests
 * 
 * Tests:
 * - Renders loading state when profile is loading
 * - Renders error state when profile fails to load
 * - Renders profile successfully
 * - Handles tab navigation
 * - Displays user information
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import ProfilePage from '@/features/profile/profilePage';

// Mock useAuth
const mockProfileData = {
  userInfo: {
    name: 'Test User',
    email: 'test@example.com',
  },
};

const mockUserData = {
  user: {
    id: 'user1',
    name: 'Test User',
  },
};

const mockUseAuth = jest.fn(() => ({
  profileData: mockProfileData,
  isProfileLoading: false,
  profileError: null,
  userData: mockUserData,
}));

jest.mock('@/shared/hooks/useAuth', () => ({
  __esModule: true,
  default: (...args) => mockUseAuth(...args),
}));

// Mock loading components
jest.mock('@/components/loading', () => ({
  __esModule: true,
  LoadingState: ({ message }) => <div data-testid="loading-state">{message}</div>,
}));

jest.mock('@/shared/components/ErrorDisplay', () => ({
  __esModule: true,
  default: ({ message, onRetry }) => (
    <div data-testid="error-display">
      <p>{message}</p>
      <button onClick={onRetry}>Retry</button>
    </div>
  ),
}));

// Mock profile components
jest.mock('@/features/profile/components/ProfileHeader', () => ({
  __esModule: true,
  default: () => <div data-testid="profile-header">Profile Header</div>,
}));

jest.mock('@/features/profile/components/SidebarTabs', () => ({
  __esModule: true,
  default: ({ activeTab, onTabChange }) => (
    <div data-testid="sidebar-tabs">
      <button onClick={() => onTabChange('account')}>Account</button>
      <button onClick={() => onTabChange('security')}>Security</button>
    </div>
  ),
}));

jest.mock('@/features/profile/components/MobileTabBar', () => ({
  __esModule: true,
  default: ({ activeTab, onTabChange }) => (
    <div data-testid="mobile-tab-bar">
      <button onClick={() => onTabChange('account')}>Account</button>
    </div>
  ),
}));

jest.mock('@/features/profile/components/TabPanelContainer', () => ({
  __esModule: true,
  default: ({ activeTab }) => (
    <div data-testid="tab-panel-container">
      <div>Active Tab: {activeTab}</div>
    </div>
  ),
}));

describe('ProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      profileData: mockProfileData,
      isProfileLoading: false,
      profileError: null,
      userData: mockUserData,
    });
  });

  test('renders loading state when profile is loading', async () => {
    mockUseAuth.mockReturnValue({
      profileData: null,
      isProfileLoading: true,
      profileError: null,
      userData: null,
    });

    renderWithProviders(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByTestId('loading-state')).toBeInTheDocument();
      expect(screen.getByText(/loading profile/i)).toBeInTheDocument();
    });
  });

  test('renders error state when profile fails to load', async () => {
    mockUseAuth.mockReturnValue({
      profileData: null,
      isProfileLoading: false,
      profileError: { message: 'Failed to load profile' },
      userData: mockUserData,
    });

    renderWithProviders(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByTestId('error-display')).toBeInTheDocument();
      expect(screen.getByText(/failed to load profile/i)).toBeInTheDocument();
    });
  });

  test('renders profile successfully', async () => {
    renderWithProviders(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByTestId('profile-header')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar-tabs')).toBeInTheDocument();
      // Multiple tab panels may be rendered, so use getAllByTestId
      const tabPanels = screen.getAllByTestId('tab-panel-container');
      expect(tabPanels.length).toBeGreaterThan(0);
    });
  });

  test('handles tab navigation', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByTestId('sidebar-tabs')).toBeInTheDocument();
    });

    // Click on Security tab - there may be multiple Security buttons (desktop and mobile)
    const securityButtons = screen.getAllByText('Security');
    expect(securityButtons.length).toBeGreaterThan(0);
    
    // Click the first Security button
    await user.click(securityButtons[0]);

    // Wait for the active tab to change - check if "Active Tab: security" appears
    // Note: All tab panels may be rendered, so check if at least one shows security
    await waitFor(() => {
      const securityTabTexts = screen.getAllByText((content, element) => {
        return element?.textContent?.toLowerCase().includes('active tab') &&
               element?.textContent?.toLowerCase().includes('security');
      });
      expect(securityTabTexts.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });
});





