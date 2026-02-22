import styled, { css } from 'styled-components';
import { FaCheck, FaExclamationTriangle } from 'react-icons/fa';

const VariantColorSwatch = ({
  color,
  isSelected = false,
  isDisabled = false,
  stock = 0,
  isActive = true,
  onClick,
}) => {
  // Only show out of stock if selected and actually out of stock
  // Allow selection first, then show stock status
  const isOutOfStock = isSelected && (!isActive || stock <= 0);
  const isLowStock = isSelected && stock > 0 && stock <= 5 && isActive;
  const showStockInfo = isSelected && stock > 0;

  return (
    <SwatchContainer>
      <SwatchInput
        type="radio"
        id={`swatch-${color}`}
        name="variant-color"
        checked={isSelected}
        disabled={isDisabled}
        onChange={() => {}}
        onClick={(e) => {
          e.preventDefault();
          if (!isDisabled) {
            onClick();
          }
        }}
        aria-label={`Color: ${color}${isDisabled ? ' (Unavailable)' : isOutOfStock ? ' (Out of stock)' : isLowStock ? ` (${stock} left)` : ''}`}
      />
      <SwatchLabel
        htmlFor={`swatch-${color}`}
        $color={color}
        $isSelected={isSelected}
        $isDisabled={isDisabled}
        $isOutOfStock={isOutOfStock}
      >
        {isSelected && (
          <CheckIndicator>
            <FaCheck />
          </CheckIndicator>
        )}
        {isOutOfStock && <OutOfStockOverlay />}
        {isLowStock && !isOutOfStock && (
          <StockIndicator $isLowStock>
            <FaExclamationTriangle />
            {stock}
          </StockIndicator>
        )}
        {showStockInfo && !isLowStock && stock > 5 && (
          <StockIndicator $isLowStock={false}>{stock}</StockIndicator>
        )}
      </SwatchLabel>
    </SwatchContainer>
  );
};

export default VariantColorSwatch;

// Styled Components
const SwatchContainer = styled.div`
  position: relative;
`;

const SwatchInput = styled.input`
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

const SwatchLabel = styled.label`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.2rem;
  height: 3.2rem;
  background-color: ${(props) => props.$color};
  border-radius: 50%;
  border: ${(props) =>
    props.$isSelected
      ? '2.5px solid var(--color-primary-500)'
      : props.$isDisabled
        ? '2px solid var(--color-grey-300)'
        : '2px solid var(--color-grey-200)'};
  cursor: ${(props) => (props.$isDisabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${(props) => (props.$isDisabled ? 0.5 : props.$isOutOfStock ? 0.6 : 1)};
  box-shadow: ${(props) =>
    props.$isSelected
      ? '0 0 0 2px var(--color-primary-100), 0 1px 6px rgba(0, 120, 204, 0.2)'
      : '0 1px 3px rgba(0, 0, 0, 0.06)'};
  overflow: visible;

  &:hover {
    ${(props) =>
      !props.$isDisabled &&
      css`
        border-color: ${props.$isSelected
          ? 'var(--color-primary-600)'
          : 'var(--color-primary-400)'};
        transform: scale(1.06);
        box-shadow: ${props.$isSelected
          ? '0 0 0 2px var(--color-primary-200), 0 2px 8px rgba(0, 120, 204, 0.25)'
          : '0 2px 6px rgba(0, 0, 0, 0.1)'};
      `}
  }

  &:active {
    ${(props) =>
      !props.$isDisabled &&
      css`
        transform: scale(1.02);
      `}
  }

  @media (max-width: 768px) {
    width: 2.8rem;
    height: 2.8rem;
  }
`;

const CheckIndicator = styled.span`
  position: absolute;
  top: -0.3rem;
  right: -0.3rem;
  width: 1.4rem;
  height: 1.4rem;
  background: var(--color-primary-600);
  color: var(--color-white-0);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  z-index: 10;
  box-shadow: 0 1px 4px rgba(0, 120, 204, 0.3);
`;

const OutOfStockOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
  width: 80%;
  height: 2px;
  background: var(--color-red-600);
  z-index: 5;
  box-shadow: 0 0 4px rgba(220, 38, 38, 0.5);
`;

const StockIndicator = styled.span`
  position: absolute;
  bottom: -0.5rem;
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
`;

