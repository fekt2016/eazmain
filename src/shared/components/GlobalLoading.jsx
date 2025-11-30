// components/GlobalLoading.jsx
import { useIsFetching } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { SpinnerContainer, PageSpinner } from "../../components/loading";

const GlobalLoading = () => {
  const isFetching = useIsFetching({
    predicate: (query) => query.meta?.global === true,
  });

  const [visible, setVisible] = useState(false);

  // Add a short delay to prevent flicker on quick queries
  useEffect(() => {
    let timeout;
    if (isFetching > 0) {
      timeout = setTimeout(() => setVisible(true), 200);
    } else {
      setVisible(false);
    }
    return () => clearTimeout(timeout);
  }, [isFetching]);

  if (!visible) return null;

  return (
    <SpinnerContainer fullScreen>
      <PageSpinner />
    </SpinnerContainer>
  );
};

export default GlobalLoading;
