// components/GlobalLoading.jsx
import { useIsFetching } from "@tanstack/react-query";
import styled, { keyframes } from "styled-components";
import { useEffect, useState } from "react";

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: var(--color-white-0, --color-primary-50);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const Spinner = styled.div`
  width: 4.8rem;
  height: 4.8rem;
  border: 4px solid var(--color-gray-200); /* gray-200 */
  border-top: 4px solid var(--color-primary-500); /* blue-600 */
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

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
    <Overlay>
      <Spinner />
    </Overlay>
  );
};

export default GlobalLoading;
