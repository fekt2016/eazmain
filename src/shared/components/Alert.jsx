import styled, { css } from "styled-components";

const baseStyles = css`
  border-radius: var(--border-radius-md);
  padding: var(--spacing-md);
  margin: var(--spacing-md) 0;
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
`;

const AlertContainer = styled.div`
  ${baseStyles};
  background-color: var(--color-gray-50);
  border: 1px solid var(--color-gray-200);
  color: var(--color-gray-800);

  ${({ $variant }) =>
    $variant === "success" &&
    css`
      background-color: var(--color-green-50);
      border-color: var(--color-green-200);
      color: var(--color-green-800);
    `}

  ${({ $variant }) =>
    $variant === "error" &&
    css`
      background-color: var(--color-red-50);
      border-color: var(--color-red-200);
      color: var(--color-red-800);
    `}

  ${({ $variant }) =>
    $variant === "warning" &&
    css`
      background-color: var(--color-yellow-50);
      border-color: var(--color-yellow-200);
      color: var(--color-yellow-800);
    `}
`;

const AlertTitle = styled.div`
  font-weight: var(--font-semibold);
  margin-bottom: var(--spacing-xs);
`;

const AlertMessage = styled.div``;

function Alert({ variant = "info", title, children, className }) {
  return (
    <AlertContainer $variant={variant} className={className}>
      <div>
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertMessage>{children}</AlertMessage>
      </div>
    </AlertContainer>
  );
}

export default Alert;

