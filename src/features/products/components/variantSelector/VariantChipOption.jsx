import styled, { css } from 'styled-components';
import { FaCheck, FaExclamationTriangle } from 'react-icons/fa';

const VariantChipOption = ({
  value,
  isSelected = false,
  isDisabled = false,
  stock = 0,
  isActive = true,
  onClick,
}) => {
  // Only show out of stock if we have a variant and it's actually out of stock
  // Allow selection first, then show stock status
  const isOutOfStock = isSelected && (!isActive || stock <= 0);
  const isLowStock = isSelected && stock > 0 && stock <= 5 && isActive;
  const showStockInfo = isSelected && stock > 0;

  return (
    <ChipContainer>
      <ChipInput
        type="radio"
        id={`chip-${value}`}
        name="variant-option"
        checked={isSelected}
        disabled={isDisabled}
        onChange={() => {}}
        onClick={(e) => {
          e.preventDefault();
          if (!isDisabled) {
            onClick();
          }
        }}
        aria-label={`${value}${isDisabled ? ' (Unavailable)' : isOutOfStock ? ' (Out of stock)' : isLowStock ? ` (${stock} left)` : ''}`}
      />
      <ChipLabel
        htmlFor={`chip-${value}`}
        $isSelected={isSelected}
        $isDisabled={isDisabled}
        $isOutOfStock={isOutOfStock}
        $isLowStock={isLowStock}
      >
        <ChipText $isSelected={isSelected}>{value}</ChipText>
        {isSelected && (
          <CheckIcon>
            <FaCheck />
          </CheckIcon>
        )}
        {isOutOfStock && <OutOfStockBadge>Out of Stock</OutOfStockBadge>}
        {isLowStock && !isOutOfStock && (
          <StockBadge $isLowStock>
            <FaExclamationTriangle />
            Only {stock} left
          </StockBadge>
        )}
        {showStockInfo && !isLowStock && stock > 5 && (
          <StockBadge $isLowStock={false}>{stock} in stock</StockBadge>
        )}
      </ChipLabel>
    </ChipContainer>
  );
};

export default VariantChipOption;

// Styled Components
const ChipContainer = styled.div`
  position: relative;
`;

const ChipInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  margin: 0;
  padding: 0;

  &:focus-visible + label {
    outline: 3px solid var(--color-primary-200);
    outline-offset: 2px;
  }
`;

const ChipLabel = styled.label`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.35rem 0.7rem;
  min-height: 2.6rem;
  min-width: 4.5rem;
  border: 1.5px solid
    ${(props) =>
      props.$isSelected
        ? 'var(--color-primary-500)'
        : props.$isDisabled
          ? 'var(--color-grey-300)'
          : 'var(--color-grey-200)'};
  background: ${(props) =>
    props.$isSelected
      ? 'var(--color-primary-500)'
      : props.$isDisabled
        ? 'var(--color-grey-100)'
        : 'var(--color-white-0)'};
  border-radius: var(--border-radius-md);
  cursor: ${(props) => (props.$isDisabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${(props) => (props.$isDisabled ? 0.5 : 1)};
  box-shadow: ${(props) =>
    props.$isSelected
      ? '0 1px 6px rgba(0, 120, 204, 0.15)'
      : '0 1px 2px rgba(0, 0, 0, 0.04)'};

  &:hover {
    ${(props) =>
      !props.$isDisabled &&
      css`
        border-color: ${props.$isSelected
          ? 'var(--color-primary-600)'
          : 'var(--color-primary-500)'};
        transform: translateY(-1px);
        box-shadow: ${props.$isSelected
          ? '0 2px 8px rgba(0, 120, 204, 0.2)'
          : '0 2px 4px rgba(0, 0, 0, 0.06)'};
      `}
  }

  &:active {
    ${(props) =>
      !props.$isDisabled &&
      css`
        transform: translateY(0);
      `}
  }

  @media (max-width: 768px) {
    min-height: 2.4rem;
    min-width: 4rem;
    padding: 0.3rem 0.6rem;
  }
`;

const ChipText = styled.span`
  font-size: 0.8rem;
  font-weight: ${(props) => (props.$isSelected ? 'var(--font-semibold)' : 'var(--font-medium)')};
  color: ${(props) =>
    props.$isSelected ? 'var(--color-white-0)' : 'var(--color-grey-800)'};
  font-family: var(--font-body);
  text-align: center;
  transition: color 0.2s ease;
`;

const CheckIcon = styled.span`
  position: absolute;
  top: -0.3rem;
  right: -0.3rem;
  width: 1.3rem;
  height: 1.3rem;
  background: var(--color-primary-600);
  color: var(--color-white-0);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  box-shadow: 0 1px 4px rgba(0, 120, 204, 0.3);
  z-index: 10;
`;

const StockBadge = styled.span`
  position: absolute;
  bottom: -0.4rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.65rem;
  font-weight: var(--font-semibold);
  padding: 0.1rem 0.3rem;
  border-radius: var(--border-radius-sm);
  background: ${(props) =>
    props.$isLowStock
      ? 'var(--color-yellow-100)'
      : 'var(--color-green-50)'};
  color: ${(props) =>
    props.$isLowStock
      ? 'var(--color-yellow-700)'
      : 'var(--color-green-700)'};
  display: flex;
  align-items: center;
  gap: 0.1rem;
  white-space: nowrap;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  font-family: var(--font-body);
`;

const OutOfStockBadge = styled.span`
  position: absolute;
  bottom: -0.4rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.65rem;
  font-weight: var(--font-semibold);
  padding: 0.1rem 0.3rem;
  background: var(--color-red-100);
  color: var(--color-red-700);
  border-radius: var(--border-radius-sm);
  white-space: nowrap;
  box-shadow: 0 1px 2px rgba(220, 38, 38, 0.15);
  font-family: var(--font-body);
`;

