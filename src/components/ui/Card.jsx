import styled, { css } from 'styled-components';

const cardBaseStyles = css`
  background: var(--color-white-0);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  width: 100%;
  position: relative;
`;

const StyledCard = styled.div`
  ${cardBaseStyles}

  ${({ variant }) => {
    switch (variant) {
      case 'elevated':
        return css`
          box-shadow: var(--shadow-md);
          border: 1px solid var(--color-grey-100);

          &:hover {
            box-shadow: var(--shadow-lg);
          }
        `;
      case 'outlined':
        return css`
          border: 1px solid var(--color-grey-200);
          box-shadow: none;
        `;
      default:
        return css`
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--color-grey-50);
        `;
    }
  }}

  ${({ noPadding }) => noPadding && css`
    padding: 0;
  `}

  ${({ clickable }) => clickable && css`
    cursor: pointer;
    transition: all var(--transition-base);

    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }
  `}
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-md);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--color-grey-200);
`;

const CardTitle = styled.h3`
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  margin: 0;
`;

const CardContent = styled.div`
  flex-grow: 1;
`;

const CardFooter = styled.div`
  margin-top: var(--space-md);
  padding-top: var(--space-sm);
  border-top: 1px solid var(--color-grey-200);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
`;

const Card = ({ 
  children, 
  variant = 'default', 
  noPadding = false, 
  clickable = false, 
  title,
  headerActions,
  footerActions 
}) => {
  return (
    <StyledCard variant={variant} noPadding={noPadding} clickable={clickable}>
      {(title || headerActions) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {headerActions && headerActions}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
      {footerActions && <CardFooter>{footerActions}</CardFooter>}
    </StyledCard>
  );
};

export default Card;
export { CardHeader, CardTitle, CardContent, CardFooter };
