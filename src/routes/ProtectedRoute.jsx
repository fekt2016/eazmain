import { Navigate } from "react-router-dom";
import { memo, Suspense, useEffect, useMemo, useState } from "react";
import useAuth from "../hooks/useAuth";
import LoadingSpinner from "../components/LoadingSpinner";

const ProtectedRoutes = ({ children }) => {
  const { userData, isLoading, error } = useAuth();
  const user = useMemo(() => {
    return (
      userData?.data?.data || userData?.data?.user || userData?.user || null
    );
  }, [userData]);

  const [localAuthCheck, setLocalAuthCheck] = useState(() => {
    return !!localStorage.getItem("authToken");
  });

  useEffect(() => {
    if (!isLoading) {
      setLocalAuthCheck(!!localStorage.getItem("authToken"));
    }
  }, [isLoading]);

  if (localAuthCheck && isLoading) {
    return <LoadingSpinner />;
  }

  if (isLoading) {
    return <div>Loading...</div>;
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

  return <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>;
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
