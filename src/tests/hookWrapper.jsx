/**
 * Hook Wrapper for renderHook
 * 
 * Provides React Query and React Router context for testing hooks
 * This wrapper MUST return JSX, not DOM nodes
 */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Create a test QueryClient with disabled retries
 */
const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
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

const queryClient = createTestQueryClient();

/**
 * Hook Wrapper Component
 * 
 * Wraps hooks with necessary providers for testing
 * Returns JSX (ReactNode), not DOM nodes
 */
export const HookWrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </QueryClientProvider>
);


