import { Navigate } from "react-router-dom";
import { memo, Suspense, useMemo } from "react";
import useAuth from '../shared/hooks/useAuth';
import { LoadingState, PageSpinner, SpinnerContainer } from '../components/loading';
import logger from '../shared/utils/logger';

const ProtectedRoutes = ({ children }) => {
  const { userData, isLoading, error } = useAuth();
  const user = useMemo(() => {
    return (
      userData?.data?.data || userData?.data?.user || userData?.user || null
    );
  }, [userData]);
 
  // FIX: Removed localAuthCheck state - it was causing unnecessary re-renders
  // Use userData and isLoading directly instead

  // Show loading state only for auth check - not covered by GlobalLoading
  // This prevents double spinners since auth queries don't have meta?.global
  if (isLoading) {
    return (
      <SpinnerContainer fullScreen>
        <PageSpinner />
      </SpinnerContainer>
    );
  }

  if (error) {
    logger.error("Error fetching user data:", error);
    return (
      <Navigate
        to="/error"
        state={{ error: "Error fetching user data" }}
        replace
      />
    );
  }
  // User authenticated and verified
  if (!user || user.role !== "user") {
    return <Navigate to="/login" replace />;
  }

  // ✅ CRITICAL: Check if account is verified before allowing access
  if (!user.emailVerified && !user.phoneVerified) {
    return (
      <Navigate
        to="/verify-account"
        state={{
          email: user.email,
          phone: user.phone,
          message: "Please verify your account to access this page",
        }}
        replace
      />
    );
  }

  if (user.status !== "active") {
    return handleStatusRedirect(user.status);
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
