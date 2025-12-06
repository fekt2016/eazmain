// components/GlobalLoading.jsx
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { SpinnerContainer, PageSpinner } from "../../components/loading";

/**
 * GlobalLoading Component
 * DISABLED: Each page should show its own loading spinner.
 * 
 * This component is kept for potential future use (e.g., truly global operations),
 * but currently disabled to prevent double spinners with page-level loading states.
 * 
 * To enable for specific queries/mutations, add meta: { global: true } to them.
 */
const GlobalLoading = () => {
  // DISABLED: Each page handles its own loading state
  // Only track queries/mutations that explicitly opt-in with meta?.global === true
  // Currently, no queries use this, so GlobalLoading won't show
  const isFetching = useIsFetching({
    predicate: (query) => query.meta?.global === true
  });
  
  // Track mutations that opt-in to global loading
  const isMutating = useIsMutating({
    predicate: (mutation) => mutation.meta?.global === true
  });

  const [visible, setVisible] = useState(false);

  // Show spinner if any opted-in query is fetching or mutation is in progress
  const isLoading = isFetching > 0 || isMutating > 0;

  // Add a short delay to prevent flicker on quick queries
  useEffect(() => {
    let timeout;
    if (isLoading) {
      timeout = setTimeout(() => setVisible(true), 200);
    } else {
      setVisible(false);
    }
    return () => clearTimeout(timeout);
  }, [isLoading]);

  // Currently disabled - no queries use meta?.global === true
  // Each page shows its own loading spinner
  if (!visible) return null;

  return (
    <SpinnerContainer fullScreen>
      <PageSpinner />
    </SpinnerContainer>
  );
};

export default GlobalLoading;
