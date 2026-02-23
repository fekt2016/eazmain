import { Navigate } from "react-router-dom";
import { memo, Suspense, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import useAuth from '../shared/hooks/useAuth';
import { LoadingState, PageSpinner, SpinnerContainer } from '../components/loading';
import logger from '../shared/utils/logger';

const ProtectedRoutes = ({ children }) => {
  const { userData, isLoading, error } = useAuth();
  const queryClient = useQueryClient();
  
  const user = useMemo(() => {
    if (!userData) return null;

    // Most common case: useAuth already returns a plain user object
    if (
      typeof userData === "object" &&
      !Array.isArray(userData) &&
      (userData.id || userData._id)
    ) {
      return userData;
    }

    // Backwards‑compatibility for older response shapes
    return (
      userData?.data?.data ||
      userData?.data?.user ||
      userData?.user ||
      null
    );
  }, [userData]);
  
  // CRITICAL FIX: Check for cached user data if current query failed
  // This prevents redirect when notification endpoints fail but user is still authenticated
  const cachedUser = useMemo(() => {
    if (user) return user; // Use current user data if available
    // If no user but we have cached data, use it (might be from previous successful auth)
    const cached = queryClient.getQueryData(["auth"]);
    if (cached) {
      const cachedUserData = cached?.data?.data || cached?.data?.user || cached?.user || cached;
      if (cachedUserData && (cachedUserData.id || cachedUserData._id)) {
        logger.warn("[ProtectedRoute] Using cached user data - current query may have failed on non-auth endpoint");
        return cachedUserData;
      }
    }
    return null;
  }, [user, queryClient]);
 
  // FIX: Removed localAuthCheck state - it was causing unnecessary re-renders
  // Use userData and isLoading directly instead

  // Show loading state only for auth check - not covered by GlobalLoading
  // This prevents double spinners since auth queries don't have meta?.global
  if (isLoading) {
    return (
      <SpinnerContainer $fullScreen>
        <PageSpinner />
      </SpinnerContainer>
    );
  }

  // CRITICAL FIX: Only redirect on error if it's an actual auth endpoint failure
  // Notification endpoint failures should not trigger redirect
  if (error) {
    const errorUrl = error?.config?.url || '';
    const isAuthEndpoint = errorUrl.includes('/auth/me') || errorUrl.includes('/auth/current-user');
    const isNotificationError = error?.isNotificationError;
    
    // If error is from notification endpoint, don't redirect - use cached user if available
    if (isNotificationError && cachedUser) {
      logger.warn("[ProtectedRoute] Notification endpoint error but cached user exists - allowing access");
      // Continue to user check below with cached user
    } else if (isAuthEndpoint) {
      // Only redirect on actual auth endpoint failures
      // 401 is expected when user is not authenticated - not an error
      if (error?.response?.status === 401) {
        if ((typeof __DEV__ !== 'undefined' && __DEV__) || !import.meta.env.PROD) {
          logger.debug("User unauthenticated (401) on auth endpoint");
        }
      } else {
        // Real errors (network, 5xx, etc.) should be logged
        logger.error("Error fetching user data from auth endpoint:", error);
      }
      return (
        <Navigate
          to="/error"
          state={{ error: "Error fetching user data" }}
          replace
        />
      );
    } else {
      // For other endpoint failures, log but don't redirect if we have cached user
      logger.warn("[ProtectedRoute] Non-auth endpoint error:", errorUrl);
      if (!cachedUser) {
        // Only redirect if we don't have cached user data
        logger.error("Error fetching user data and no cached user:", error);
        return (
          <Navigate
            to="/error"
            state={{ error: "Error fetching user data" }}
            replace
          />
        );
      }
    }
  }
  
  // User authenticated and verified
  // Allow access for buyers (role "buyer", "user", or undefined/null)
  // Block only admin and seller roles from buyer routes
  // CRITICAL FIX: Use cachedUser if available (handles notification endpoint failures)
  const activeUser = user || cachedUser;
  if (!activeUser) {
    logger.warn("[ProtectedRoute] No user data found (current or cached), redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // Block admin and seller from buyer routes (they should use their own apps),
  // but do NOT send them back to the login page if they are already authenticated.
  // Instead, send them to a dedicated unauthorized page.
  const blockedRoles = ["admin", "seller"];
  if (activeUser.role && blockedRoles.includes(activeUser.role)) {
    logger.warn("[ProtectedRoute] User role", activeUser.role, "not allowed on buyer routes, redirecting to unauthorized page");
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ CRITICAL: Check if account is verified before allowing access
  if (!activeUser.emailVerified && !activeUser.phoneVerified) {
    return (
      <Navigate
        to="/verify-account"
        state={{
          email: activeUser.email,
          phone: activeUser.phone,
          message: "Please verify your account to access this page",
        }}
        replace
      />
    );
  }

  if (activeUser.status !== "active") {
    return handleStatusRedirect(activeUser.status);
  }

  return <Suspense fallback={<SpinnerContainer><PageSpinner /></SpinnerContainer>}>{children}</Suspense>;
};

const statusRedirectMap = {
  pending: "/account-pending",
  inactive: "/account-inactive",
  default: "/unauthorized",
};

const handleStatusRedirect = (status) => {
  const path = statusRedirectMap[status] || statusRedirectMap.default;
  return <Navigate to={path} replace />;
};

const MemoizedProtectedRoutes = memo(ProtectedRoutes);
export default MemoizedProtectedRoutes;
export { MemoizedProtectedRoutes as ProtectedRoute };
