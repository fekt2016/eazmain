/**
 * Test Utilities for EazMain
 * 
 * Provides renderWithProviders helper that wraps components with:
 * - BrowserRouter (React Router)
 * - QueryClientProvider (React Query)
 * - Disabled query retries for faster tests
 */

import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Create a test QueryClient with disabled retries
 * This makes tests faster and more predictable
 */
export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0, // Previously cacheTime
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
};

/**
 * Render component with all necessary providers
 * 
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} options - Render options
 * @param {QueryClient} options.queryClient - Optional custom QueryClient
 * @param {Object} options.routerOptions - Optional router options (initialEntries, etc.)
 * @returns {Object} Render result with queryClient
 */
export const renderWithProviders = (
  ui,
  {
    queryClient = createTestQueryClient(),
    routerOptions = {},
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }) => {
    return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter {...routerOptions}>
          {children}
        </BrowserRouter>
      </QueryClientProvider>
    );
  };

  const renderResult = render(ui, { wrapper: Wrapper, ...renderOptions });

  return {
    ...renderResult,
    queryClient,
  };
};

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';


