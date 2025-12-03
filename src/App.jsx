import { useEffect, useMemo, lazy, Suspense } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GlobalStyles from "./shared/styles/GlobalStyles";

import MainRoutes from "./routes/MainRoutes";
import GlobalLoading from "./shared/components/GlobalLoading";
import ScrollToTop from "./shared/ScrollToTop";
import ErrorBoundary from "./shared/components/ErrorBoundary";

// ReactQueryDevtools only in development
const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() => import("@tanstack/react-query-devtools").then((mod) => ({ default: mod.ReactQueryDevtools })))
  : () => null;

function App() {
  // Use useMemo to prevent creating new QueryClient on every render
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            gcTime: 1000 * 60 * 5, // 5 minutes garbage collection time
          },
        },
      }),
    []
  );

  // Suppress known harmless CORS errors from Cloudflare Turnstile on Paystack checkout
  useEffect(() => {
    const originalError = window.console.error;
    window.console.error = (...args) => {
      const errorMessage = args[0]?.toString() || '';
      // Suppress Cloudflare Turnstile CORS error from Paystack checkout
      if (
        errorMessage.includes('cloudflare.com/turnstile') ||
        errorMessage.includes('Access-Control-Allow-Origin') ||
        (errorMessage.includes('CORS') && errorMessage.includes('checkout.paystack.com'))
      ) {
        // Silently ignore this known harmless error
        return;
      }
      originalError.apply(console, args);
    };

    // Also suppress unhandled promise rejections for the same issue
    const handleUnhandledRejection = (event) => {
      const errorMessage = event.reason?.message || event.reason?.toString() || '';
      if (
        errorMessage.includes('cloudflare.com/turnstile') ||
        errorMessage.includes('Access-Control-Allow-Origin') ||
        (errorMessage.includes('CORS') && errorMessage.includes('checkout.paystack.com'))
      ) {
        event.preventDefault();
        return;
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.console.error = originalError;
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GlobalStyles />
        <GlobalLoading />
        <BrowserRouter basename="">
          <ScrollToTop />
          <MainRoutes />
        </BrowserRouter>
        {import.meta.env.DEV && (
          <Suspense fallback={null}>
            <ReactQueryDevtools initialIsOpen={false} />
          </Suspense>
        )}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
