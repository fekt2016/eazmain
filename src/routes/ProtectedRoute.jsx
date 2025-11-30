import { Navigate } from "react-router-dom";
import { memo, Suspense, useEffect, useMemo, useState } from "react";
import useAuth from '../shared/hooks/useAuth';
import { LoadingState, PageSpinner, SpinnerContainer } from '../components/loading';

const ProtectedRoutes = ({ children }) => {
  const { userData, isLoading, error } = useAuth();
  const user = useMemo(() => {
    return (
      userData?.data?.data || userData?.data?.user || userData?.user || null
    );
  }, [userData]);
 

  // Cookie-based auth: No need to check localStorage
  // Authentication state is determined by useAuth hook which calls getCurrentUser()
  // Browser automatically sends cookie via withCredentials: true
  const [localAuthCheck, setLocalAuthCheck] = useState(() => {
    // Always return true initially - let useAuth determine actual auth state
    return true;
  });

  useEffect(() => {
    // Update based on actual auth state from useAuth
    if (!isLoading) {
      setLocalAuthCheck(!!userData);
    }
  }, [isLoading, userData]);

  if (localAuthCheck && isLoading) {
    return <LoadingState message="Loading..." />;
  }

  if (isLoading) {
    return <LoadingState message="Loading..." />;
  }

  if (error) {
    console.error("Error fetching user data:", error);
    return (
      <Navigate
        to="/error"
        state={{ error: "Error fetching user data" }}
        replace
      />
    );
  }
  console.log;
  if (!user || user.role !== "user") {
    return <Navigate to="/login" replace />;
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
