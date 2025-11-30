import styled from "styled-components";
import { PrimaryButton } from './ui/Buttons';

const ErrorDisplay = ({ message }) => (
  <ErrorDisplayContainer>
    <ErrorDisplayContent>
      <ErrorDisplayIcon>❌</ErrorDisplayIcon>
      <ErrorDisplayMessage>{message}</ErrorDisplayMessage>
      <PrimaryButton $size="sm" onClick={() => window.location.reload()}>
        Try Again
      </PrimaryButton>
    </ErrorDisplayContent>
  </ErrorDisplayContainer>
);

export default ErrorDisplay;

const ErrorDisplayContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 64vh;
`;

const ErrorDisplayContent = styled.div`
  background-color: var(--color-red-100);
  border: 1px solid var(--color-red-200);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  text-align: center;
  max-width: 32rem;
`;

const ErrorDisplayIcon = styled.div`
  color: var(--color-red-600);
  font-size: 3rem;
  margin-bottom: var(--spacing-sm);
`;

const ErrorDisplayMessage = styled.p`
  color: var(--color-red-700);
  font-weight: 500;
  margin-bottom: var(--spacing-md);
`;
