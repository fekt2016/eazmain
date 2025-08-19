import styled from "styled-components";

const ErrorDisplay = ({ message }) => (
  <ErrorDisplayContainer>
    <ErrorDisplayContent>
      <ErrorDisplayIcon>❌</ErrorDisplayIcon>
      <ErrorDisplayMessage>{message}</ErrorDisplayMessage>
      <RetryButton onClick={() => window.location.reload()}>
        Try Again
      </RetryButton>
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
  background-color: ${({ theme }) => theme.colors.red[50]};
  border: 1px solid ${({ theme }) => theme.colors.red[200]};
  border-radius: 0.5rem;
  padding: 1.5rem;
  text-align: center;
  max-width: 32rem;
`;

const ErrorDisplayIcon = styled.div`
  color: ${({ theme }) => theme.colors.red[500]};
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const ErrorDisplayMessage = styled.p`
  color: ${({ theme }) => theme.colors.red[700]};
  font-weight: 500;
  margin-bottom: 1.5rem;
`;

const RetryButton = styled.button`
  background-color: ${({ theme }) => theme.colors.red[100]};
  color: ${({ theme }) => theme.colors.red[700]};
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.red[200]};
  }
`;
