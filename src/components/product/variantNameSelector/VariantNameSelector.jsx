import styled from 'styled-components';
import { useVariantSelectionByName } from '../../../shared/hooks/products/useVariantSelectionByName';

const VariantNameSelector = ({
  variants = [],
  selectedVariant,
  onSelect,
  variantSelectionHook,
}) => {
  const { getVariantName, isVariantAvailable } = variantSelectionHook || useVariantSelectionByName(variants);

  if (!variants.length) return null;

  return (
    <SelectorContainer>
      <SelectorLabel>Variant:</SelectorLabel>
      <VariantButtonsContainer>
        {variants.map((variant) => {
          const variantName = getVariantName(variant);
          const isSelected = selectedVariant?._id === variant._id;
          const isAvailable = isVariantAvailable(variant);
          const isDisabled = !isAvailable;

          return (
            <VariantButton
              key={variant._id || variant.sku}
              type="button"
              $isSelected={isSelected}
              $isDisabled={isDisabled}
              onClick={() => !isDisabled && onSelect(variant)}
              disabled={isDisabled}
              aria-label={`Select variant: ${variantName}${isDisabled ? ' (Out of stock)' : ''}`}
            >
              {variantName}
              {isDisabled && <OutOfStockLabel>Out of Stock</OutOfStockLabel>}
            </VariantButton>
          );
        })}
      </VariantButtonsContainer>
    </SelectorContainer>
  );
};

export default VariantNameSelector;

// Styled Components
const SelectorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
`;

const SelectorLabel = styled.label`
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
`;

const VariantButtonsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
`;

const VariantButton = styled.button`
  position: relative;
  padding: var(--spacing-sm) var(--spacing-md);
  min-height: 3rem;
  min-width: 8rem;
  border: 2px solid
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
  color: ${(props) =>
    props.$isSelected
      ? 'var(--color-white-0)'
      : props.$isDisabled
        ? 'var(--color-grey-500)'
        : 'var(--color-grey-900)'};
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  cursor: ${(props) => (props.$isDisabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${(props) => (props.$isDisabled ? 0.6 : 1)};
  box-shadow: ${(props) =>
    props.$isSelected
      ? '0 2px 8px rgba(0, 120, 204, 0.2)'
      : '0 1px 3px rgba(0, 0, 0, 0.08)'};

  &:hover:not(:disabled) {
    border-color: ${(props) =>
      props.$isSelected
        ? 'var(--color-primary-600)'
        : 'var(--color-primary-500)'};
    transform: translateY(-1px);
    box-shadow: ${(props) =>
      props.$isSelected
        ? '0 4px 12px rgba(0, 120, 204, 0.25)'
        : '0 2px 6px rgba(0, 0, 0, 0.12)'};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    min-height: 2.8rem;
    min-width: 7rem;
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-size-sm);
  }
`;

const OutOfStockLabel = styled.span`
  display: block;
  font-size: 0.7rem;
  font-weight: var(--font-medium);
  color: var(--color-red-600);
  margin-top: 0.2rem;
`;

