// components/GlobalLoading.jsx
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import styled from "styled-components";

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--color-white-0);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const Spinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const GlobalLoading = () => {
  // Check if any queries are fetching
  const isFetching = useIsFetching();
  // Check if any mutations are in progress
  const isMutating = useIsMutating();

  // Show loading if either is true
  const showLoading = isFetching > 0 || isMutating > 0;

  if (!showLoading) return null;

  return (
    <LoadingOverlay>
      <Spinner />
    </LoadingOverlay>
  );
};

export default GlobalLoading;
