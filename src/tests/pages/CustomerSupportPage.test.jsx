/**
 * CustomerSupportPage Component Tests
 * 
 * Tests:
 * - Renders page successfully
 * - Renders sidebar with navigation
 * - Renders support categories
 * - Renders quick links
 * - Opens and closes contact modal
 * - Handles department selection
 * - Handles scroll to section
 * - Handles hash-based navigation
 */

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../test-utils';
import CustomerSupportPage from '@/features/support/CustomerSupportPage';

// Mock react-router-dom
const mockLocation = { 
  search: '', 
  hash: '', 
  pathname: '/support' 
};
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => mockLocation,
  useNavigate: () => mockNavigate,
  Link: ({ children, to, ...props }) => <a href={to} {...props}>{children}</a>,
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => {
  const React = require('react');
  // Filter out animation props that React doesn't recognize
  const filterProps = (props) => {
    const { 
      whileHover, 
      whileTap, 
      variants, 
      initial, 
      animate, 
      transition,
      $primaryColor,
      $secondaryColor,
      $accentColor,
      ...rest 
    } = props;
    return rest;
  };
  
  return {
    motion: {
      div: ({ children, ...props }) => <div {...filterProps(props)}>{children}</div>,
      aside: ({ children, ...props }) => <aside {...filterProps(props)}>{children}</aside>,
      section: ({ children, ...props }) => <section {...filterProps(props)}>{children}</section>,
    },
    AnimatePresence: ({ children }) => <>{children}</>,
  };
});

// Mock useCreateTicket
const mockMutateAsync = jest.fn(() => Promise.resolve({ 
  data: { ticket: { _id: 'ticket123' } },
  message: 'Ticket created successfully'
}));
const mockUseCreateTicket = jest.fn(() => ({
  mutateAsync: mockMutateAsync,
  isPending: false,
}));

jest.mock('@/shared/hooks/useSupport', () => ({
  __esModule: true,
  useCreateTicket: (...args) => mockUseCreateTicket(...args),
}));

// Mock useAuth
const mockUserData = {
  data: {
    data: {
      user: {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
      },
    },
  },
};

const mockUseAuth = jest.fn(() => ({
  userData: mockUserData,
}));

jest.mock('@/shared/hooks/useAuth', () => ({
  __esModule: true,
  default: (...args) => mockUseAuth(...args),
}));

// Mock useQuery for orders
const mockUseQuery = jest.fn(() => ({
  data: [],
  isLoading: false,
}));

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: (...args) => mockUseQuery(...args),
}));

// Mock ContactFormModal
jest.mock('@/features/support/ContactFormModal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, preselectedDepartment }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="contact-form-modal">
        <div data-testid="modal-department">{preselectedDepartment || 'None'}</div>
        <button data-testid="modal-close" onClick={onClose}>
          Close
        </button>
      </div>
    );
  },
}));

// Mock PATHS
jest.mock('@/routes/routePaths', () => ({
  PATHS: {
    SUPPORT_TICKETS: '/support/tickets',
    PRODUCT_CARE: '/product-care',
    REFUND_POLICY: '/refund-policy',
  },
}));

// Mock document.getElementById and scrollIntoView
const mockScrollIntoView = jest.fn();
const mockGetElementById = jest.fn((id) => ({
  scrollIntoView: mockScrollIntoView,
}));

beforeAll(() => {
  global.document.getElementById = mockGetElementById;
});

describe('CustomerSupportPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocation.search = '';
    mockLocation.hash = '';
    mockLocation.pathname = '/support';
    mockNavigate.mockClear();
    mockScrollIntoView.mockClear();
    mockGetElementById.mockImplementation((id) => ({
      scrollIntoView: mockScrollIntoView,
    }));
  });

  test('renders page successfully', async () => {
    renderWithProviders(<CustomerSupportPage />);

    await waitFor(() => {
      expect(screen.getByText(/we're here to help you/i)).toBeInTheDocument();
      expect(screen.getByText(/support center/i)).toBeInTheDocument();
    });
  });

  test('renders sidebar with navigation sections', async () => {
    renderWithProviders(<CustomerSupportPage />);

    await waitFor(() => {
      expect(screen.getByText('Support Center')).toBeInTheDocument();
      expect(screen.getByText('Support')).toBeInTheDocument();
      expect(screen.getByText('Help Topics')).toBeInTheDocument();
      expect(screen.getByText('Resources')).toBeInTheDocument();
    });
  });

  test('renders support categories', async () => {
    renderWithProviders(<CustomerSupportPage />);

    await waitFor(() => {
      expect(screen.getByText('Order & Delivery Issues')).toBeInTheDocument();
      expect(screen.getByText('Payment & Billing')).toBeInTheDocument();
      // "Shipping & Returns" appears in both sidebar and category cards, use getAllByText
      expect(screen.getAllByText('Shipping & Returns').length).toBeGreaterThan(0);
      // "Account & Profile" appears in both sidebar and category cards, use getAllByText
      expect(screen.getAllByText('Account & Profile').length).toBeGreaterThan(0);
    });
  });

  test('renders quick help links', async () => {
    renderWithProviders(<CustomerSupportPage />);

    await waitFor(() => {
      expect(screen.getByText('Quick Help Resources')).toBeInTheDocument();
      // "Help Center" appears in both sidebar resources and quick links, use getAllByText
      expect(screen.getAllByText('Help Center').length).toBeGreaterThan(0);
      expect(screen.getByText('Terms & Policies')).toBeInTheDocument();
      expect(screen.getByText('Shopping Guides')).toBeInTheDocument();
    });
  });

  test('opens contact modal when clicking "Contact Support"', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CustomerSupportPage />);

    await waitFor(() => {
      expect(screen.getByText('Contact Support')).toBeInTheDocument();
    });

    const contactButton = screen.getByText('Contact Support');
    await user.click(contactButton);

    await waitFor(() => {
      expect(screen.getByTestId('contact-form-modal')).toBeInTheDocument();
    });
  });

  test('opens contact modal with department when clicking category "Open Ticket" button', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CustomerSupportPage />);

    await waitFor(() => {
      expect(screen.getByText('Order & Delivery Issues')).toBeInTheDocument();
    });

    // Find all "Open Ticket" buttons and click the first one
    const openTicketButtons = screen.getAllByText('Open Ticket');
    await user.click(openTicketButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('contact-form-modal')).toBeInTheDocument();
      expect(screen.getByTestId('modal-department')).toHaveTextContent('Orders & Delivery');
    });
  });

  test('closes contact modal when close button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CustomerSupportPage />);

    // Open modal
    const contactButton = screen.getByText('Contact Support');
    await user.click(contactButton);

    await waitFor(() => {
      expect(screen.getByTestId('contact-form-modal')).toBeInTheDocument();
    });

    // Close modal
    const closeButton = screen.getByTestId('modal-close');
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId('contact-form-modal')).not.toBeInTheDocument();
    });
  });

  test('opens modal with correct department for each category', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CustomerSupportPage />);

    await waitFor(() => {
      expect(screen.getByText('Payment & Billing')).toBeInTheDocument();
    });

    // Click "Open Ticket" for Payment & Billing category
    const openTicketButtons = screen.getAllByText('Open Ticket');
    // Payment & Billing should be the second category
    await user.click(openTicketButtons[1]);

    await waitFor(() => {
      expect(screen.getByTestId('modal-department')).toHaveTextContent('Payments & Billing');
    });
  });

  test('renders "View My Tickets" section', async () => {
    renderWithProviders(<CustomerSupportPage />);

    await waitFor(() => {
      expect(screen.getByText('My Support Tickets')).toBeInTheDocument();
      expect(screen.getByText('View My Tickets')).toBeInTheDocument();
    });
  });

  test('handles hash-based navigation', async () => {
    mockLocation.hash = '#overview';
    renderWithProviders(<CustomerSupportPage />);

    await waitFor(() => {
      expect(screen.getByText(/how can we help you/i)).toBeInTheDocument();
    });
  });

  test('renders all sidebar navigation items', async () => {
    renderWithProviders(<CustomerSupportPage />);

    await waitFor(() => {
      // Support section
      expect(screen.getByText('Support Overview')).toBeInTheDocument();
      expect(screen.getByText('My Tickets')).toBeInTheDocument();
      expect(screen.getByText('Contact Support')).toBeInTheDocument();

      // Help Topics section
      expect(screen.getByText('Orders & Delivery')).toBeInTheDocument();
      expect(screen.getByText('Payments & Billing')).toBeInTheDocument();
      // "Shipping & Returns" appears in both sidebar and category cards, use getAllByText
      expect(screen.getAllByText('Shipping & Returns').length).toBeGreaterThan(0);
      // "Account & Profile" appears in both sidebar and category cards, use getAllByText
      expect(screen.getAllByText('Account & Profile').length).toBeGreaterThan(0);

      // Resources section
      expect(screen.getByText('FAQ')).toBeInTheDocument();
      expect(screen.getByText('Policies')).toBeInTheDocument();
    });
  });

  test('renders hero section with correct content', async () => {
    renderWithProviders(<CustomerSupportPage />);

    await waitFor(() => {
      expect(screen.getByText("We're Here to Help You")).toBeInTheDocument();
      expect(screen.getByText(/get support with your orders/i)).toBeInTheDocument();
    });
  });
});

