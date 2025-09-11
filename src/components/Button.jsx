import styled, { keyframes } from "styled-components";

// Spinner animation
const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const ButtonStyled = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background-color: var(--color-primary-500); /* blue-600 */
  color: var(--color-white-0);
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background 0.2s ease;

  &:hover:not(:disabled) {
    background: var(--color-primary-400);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const Spinner = styled.span`
  width: 16px;
  height: 16px;
  border: 2px solid white;
  border-top-color: transparent;
  border-radius: 50%;
  animation: ${spin} 0.6s linear infinite;
`;

export default function Button({ isLoading, children, ...props }) {
  return (
    <ButtonStyled disabled={isLoading} {...props}>
      {isLoading && <Spinner />}
      {children}
    </ButtonStyled>
  );
}
