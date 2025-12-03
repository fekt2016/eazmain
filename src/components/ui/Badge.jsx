import styled, { css } from 'styled-components';

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  border-radius: var(--radius-full);
  line-height: 1;

  ${({ variant }) => {
    switch (variant) {
      case 'success':
        return css`
          background: var(--color-green-100);
          color: var(--color-green-700);
        `;
      case 'warning':
        return css`
          background: var(--color-yellow-100);
          color: var(--color-yellow-700);
        `;
      case 'error':
        return css`
          background: var(--color-red-100);
          color: var(--color-red-700);
        `;
      case 'primary':
        return css`
          background: var(--color-primary-100);
          color: var(--color-primary-700);
        `;
      default:
        return css`
          background: var(--color-grey-100);
          color: var(--color-grey-700);
        `;
    }
  }}

  ${({ size }) => size === 'sm' && css`
    padding: 2px 8px;
    font-size: 0.75rem;
  `}

  ${({ pill }) => pill && css`
    border-radius: var(--radius-full);
  `}
`;

export default Badge;
