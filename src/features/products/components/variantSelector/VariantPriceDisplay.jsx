import styled from 'styled-components';
import { useVariantSelectionByName } from '../../../../shared/hooks/products/useVariantSelectionByName';
import {
  getProductDisplayPrice,
  getProductOriginalPrice,
  hasProductDiscount,
  getProductDiscountPercentage,
} from '../../../../shared/utils/productHelpers';

const VariantPriceDisplay = ({ product, selectedVariant, variantSelectionHook }) => {
  const { getVariantPrice, getVariantOriginalPrice, hasVariantDiscount, getDiscountPercentage } = 
    variantSelectionHook || useVariantSelectionByName([]);

  // Use variant-specific pricing if variant is selected
  const displayPrice = selectedVariant 
    ? getVariantPrice(selectedVariant)
    : getProductDisplayPrice(product, selectedVariant);
  
  const originalPrice = selectedVariant 
    ? getVariantOriginalPrice(selectedVariant)
    : getProductOriginalPrice(product);
  
  // Check for discount
  const hasDiscount = selectedVariant
    ? hasVariantDiscount(selectedVariant)
    : hasProductDiscount(product, selectedVariant);
  
  // Get discount percentage
  const discountPercentage = selectedVariant
    ? getDiscountPercentage(selectedVariant)
    : getProductDiscountPercentage(product, selectedVariant);

  return (
    <PriceContainer>
      <PriceRow>
        <CurrentPrice>GH₵{displayPrice > 0 ? displayPrice.toFixed(2) : '0.00'}</CurrentPrice>
        {hasDiscount && originalPrice > 0 && (
          <OriginalPrice>GH₵{originalPrice.toFixed(2)}</OriginalPrice>
        )}
      </PriceRow>
      <PriceIncludesVat>Price includes applicable taxes</PriceIncludesVat>
      {hasDiscount && originalPrice > 0 && displayPrice > 0 && (
        <SavingsBadge>
          🎉 You save GH₵{(originalPrice - displayPrice).toFixed(2)} ({discountPercentage}% off)
        </SavingsBadge>
      )}
    </PriceContainer>
  );
};

export default VariantPriceDisplay;

// Styled Components
const PriceContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const PriceRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
`;

const CurrentPrice = styled.span`
  font-size: var(--font-size-2xl);
  font-weight: var(--font-bold);
  color: var(--color-primary-600);
  font-family: var(--font-heading);
`;

const OriginalPrice = styled.span`
  font-size: var(--font-size-lg);
  font-weight: var(--font-medium);
  color: var(--color-grey-500);
  text-decoration: line-through;
  font-family: var(--font-body);
`;

const PriceIncludesVat = styled.span`
  font-size: var(--font-size-sm);
  color: var(--color-grey-500);
`;

const SavingsBadge = styled.span`
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
  color: var(--color-green-700);
  background: var(--color-green-50);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-md);
  display: inline-block;
  font-family: var(--font-body);
`;

