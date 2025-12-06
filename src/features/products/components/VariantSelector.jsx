import { useMemo } from "react";
import styled, { css } from "styled-components";
import { FaCheck, FaExclamationTriangle } from "react-icons/fa";
import { pulse } from "../../../shared/styles/animations";
import { isColorValue } from "../../../shared/utils/productHelpers";

const VariantSelector = ({
  variants = [],
  selectedAttributes = {},
  onAttributeChange,
}) => {
  // Get all unique attributes from variants
  const attributeKeys = useMemo(() => {
    const keys = new Set();
    variants.forEach((variant) => {
      variant.attributes.forEach((attr) => {
        keys.add(attr.key);
      });
    });
    return Array.from(keys);
  }, [variants]);

  // If no variants or attributes, don't render
  if (attributeKeys.length === 0) {
    return null;
  }

  return (
    <VariantsCard>
      <CardTitle>Select Options</CardTitle>
      {attributeKeys.map((attribute) => {
        // Get all unique values for this attribute from all variants
        const values = [
          ...new Set(
            variants
              .map((v) => v.attributes.find((a) => a.key === attribute)?.value)
              .filter(Boolean)
          ),
        ];

        const isColor = attribute.toLowerCase().includes("color");

        return (
          <VariantGroup key={attribute}>
            <VariantGroupLabel>
              {attribute}
              {selectedAttributes[attribute] && (
                <SelectedValue>: {selectedAttributes[attribute]}</SelectedValue>
              )}
            </VariantGroupLabel>

            <VariantOptionsGrid>
              {values.map((value) => {
                const showAsColor = isColor && isColorValue(value);
                
                // Find the variant that matches this attribute value and other selected attributes
                const matchingVariant = variants.find((variant) => {
                  return (
                    variant.attributes.some(
                      (attr) => attr.key === attribute && attr.value === value
                    ) &&
                    Object.entries(selectedAttributes)
                      .filter(([key]) => key !== attribute)
                      .every(([key, val]) =>
                        variant.attributes.some(
                          (attr) => attr.key === key && attr.value === val
                        )
                      )
                  );
                });
                
                const variantStock = matchingVariant?.stock || 0;
                console.log("matchingVariant", matchingVariant);
                const isVariantInactive = matchingVariant?.status === 'inactive';
                const isOutOfStock = variantStock <= 0 || isVariantInactive;
                const isLowStock = variantStock > 0 && variantStock <= 5 && !isVariantInactive;
                const isSelected = selectedAttributes[attribute] === value;
                const radioId = `${attribute}-${value}`;

                return (
                  <RadioOptionWrapper key={radioId}>
                    <RadioInput
                      type="radio"
                      id={radioId}
                      name={attribute}
                      value={value}
                      checked={isSelected}
                      disabled={isOutOfStock}
                      onChange={() => !isOutOfStock && onAttributeChange(attribute, value)}
                      aria-label={`${attribute}: ${value}${isOutOfStock ? ' (Out of stock)' : isLowStock ? ` (${variantStock} left)` : ''}`}
                    />
                    <ModernVariantOption
                      htmlFor={radioId}
                      $active={isSelected}
                      $disabled={isOutOfStock}
                      $isColor={showAsColor}
                      $colorValue={showAsColor ? value : null}
                      $isLowStock={isLowStock}
                      as="label"
                    >
                      {showAsColor ? (
                        <ColorSwatchContainer>
                          <ColorSwatch $color={value} $active={isSelected}>
                            {isSelected && (
                              <RadioIndicator $isColor>
                                <FaCheck />
                              </RadioIndicator>
                            )}
                          </ColorSwatch>
                          {isOutOfStock && <OutOfStockBadge>Out</OutOfStockBadge>}
                          {isLowStock && !isOutOfStock && (
                            <VariantStockBadge $isLowStock>{variantStock}</VariantStockBadge>
                          )}
                        </ColorSwatchContainer>
                      ) : (
                        <VariantContent>
                          <VariantText $active={isSelected}>
                            {value}
                          </VariantText>
                          {isSelected && (
                            <RadioIndicator>
                              <FaCheck />
                            </RadioIndicator>
                          )}
                          {isOutOfStock && <OutOfStockBadge>Out of Stock</OutOfStockBadge>}
                          {isLowStock && !isOutOfStock && (
                            <VariantStockBadge $isLowStock>
                              <FaExclamationTriangle />
                              {variantStock} left
                            </VariantStockBadge>
                          )}
                          {!isOutOfStock && !isLowStock && variantStock > 5 && (
                            <VariantStockBadge $isLowStock={false}>
                              {variantStock} in stock
                            </VariantStockBadge>
                          )}
                        </VariantContent>
                      )}
                    </ModernVariantOption>
                  </RadioOptionWrapper>
                );
              })}
            </VariantOptionsGrid>
          </VariantGroup>
        );
      })}
    </VariantsCard>
  );
};

export default VariantSelector;

// Styled Components
const VariantsCard = styled.div`
  background: white;
  padding: 2.5rem;
  border-radius: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--color-grey-100);
`;

const CardTitle = styled.h3`
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-grey-900);
  margin-bottom: 2rem;
`;

const VariantGroup = styled.div`
  margin-bottom: 2.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const VariantGroupLabel = styled.label`
  font-size: 1.6rem;
  font-weight: 600;
  color: var(--color-grey-800);
  display: block;
  margin-bottom: 1.5rem;
`;

const SelectedValue = styled.span`
  font-weight: 500;
  color: var(--color-primary-500);
`;

const VariantOptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
  gap: 1.2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(7rem, 1fr));
    gap: 1rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fill, minmax(6.5rem, 1fr));
    gap: 0.8rem;
  }
`;

const RadioOptionWrapper = styled.div`
  position: relative;
`;

const RadioInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  margin: 0;
  padding: 0;
  
  /* Ensure radio button is accessible but visually hidden */
  &:focus-visible + label {
    outline: 3px solid var(--color-primary-200);
    outline-offset: 2px;
  }
`;

const ModernVariantOption = styled.label`
  position: relative;
  min-height: 5.6rem;
  min-width: 8rem;
  border: 2.5px solid
    ${(props) =>
    props.$active
      ? "var(--color-primary-500)"
      : props.$disabled
        ? "var(--color-grey-300)"
        : "var(--color-grey-200)"};
  background: ${(props) =>
    props.$active
      ? props.$isColor
        ? "transparent"
        : "var(--color-primary-50)"
      : props.$disabled
        ? "var(--color-grey-100)"
        : "white"};
  border-radius: ${(props) => (props.$isColor ? "50%" : "1.6rem")};
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: visible;
  opacity: ${(props) => (props.$disabled ? 0.5 : 1)};
  box-shadow: ${(props) =>
    props.$active
      ? "0 4px 16px rgba(0, 120, 204, 0.2)"
      : "0 2px 8px rgba(0, 0, 0, 0.06)"};
  padding: ${(props) => (props.$isColor ? "0" : "1.2rem 1.6rem")};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  
  /* Ensure touch-friendly size on mobile */
  @media (max-width: 768px) {
    min-height: 5rem;
    min-width: 7rem;
    padding: ${(props) => (props.$isColor ? "0" : "1rem 1.4rem")};
  }

  &:hover {
    border-color: ${(props) =>
    props.$disabled
      ? "var(--color-grey-300)"
      : props.$active
        ? "var(--color-primary-600)"
        : "var(--color-primary-500)"};
    transform: ${(props) => (props.$disabled ? "none" : "translateY(-3px) scale(1.02)")};
    box-shadow: ${(props) =>
    props.$disabled
      ? "0 2px 8px rgba(0, 0, 0, 0.06)"
      : props.$active
        ? "0 6px 24px rgba(0, 120, 204, 0.3)"
        : "0 6px 20px rgba(0, 0, 0, 0.12)"};
  }

  &:active {
    transform: ${(props) => (props.$disabled ? "none" : "translateY(-1px) scale(0.98)")};
  }

  ${(props) =>
    props.$active &&
    !props.$isColor &&
    css`
      background: linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-brand-50) 100%);
      font-weight: 600;
    `}
`;

const ColorSwatchContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ColorSwatch = styled.div`
  width: 5.6rem;
  height: 5.6rem;
  background-color: ${(props) => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  position: relative;
  border: ${(props) =>
    props.$active ? "3px solid var(--color-primary-500)" : "2px solid var(--color-grey-200)"};
  box-shadow: ${(props) =>
    props.$active
      ? "0 0 0 3px var(--color-primary-100), 0 4px 12px rgba(0, 0, 0, 0.15)"
      : "0 2px 8px rgba(0, 0, 0, 0.1)"};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  @media (max-width: 768px) {
    width: 5rem;
    height: 5rem;
  }
`;

const VariantContent = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
`;

const RadioIndicator = styled.span`
  position: absolute;
  top: ${(props) => (props.$isColor ? "-0.6rem" : "-0.6rem")};
  right: ${(props) => (props.$isColor ? "-0.6rem" : "-0.6rem")};
  width: 2.4rem;
  height: 2.4rem;
  background: var(--color-primary-500);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 120, 204, 0.4);
  animation: ${pulse} 0.3s ease-out;
`;

const VariantText = styled.span`
  font-size: 1.5rem;
  font-weight: ${(props) => (props.$active ? "600" : "500")};
  color: ${(props) =>
    props.$active ? "var(--color-primary-700)" : "var(--color-grey-800)"};
  position: relative;
  text-align: center;
  line-height: 1.3;
  transition: all 0.2s ease;
  
  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;

const VariantStockBadge = styled.span`
  font-size: 1rem;
  font-weight: 600;
  padding: 0.3rem 0.6rem;
  border-radius: 0.8rem;
  background: ${(props) =>
    props.$isLowStock
      ? "linear-gradient(135deg, var(--color-yellow-100) 0%, var(--color-yellow-700) 100%)"
      : "var(--color-green-50)"};
  color: ${(props) =>
    props.$isLowStock ? "var(--color-yellow-700)" : "var(--color-green-700)"};
  display: flex;
  align-items: center;
  gap: 0.3rem;
  white-space: nowrap;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    padding: 0.25rem 0.5rem;
  }
`;

const OutOfStockBadge = styled.span`
  position: absolute;
  bottom: -0.8rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  background: var(--color-red-100);
  color: var(--color-red-700);
  border-radius: 0.6rem;
  white-space: nowrap;
  box-shadow: 0 2px 6px rgba(220, 38, 38, 0.2);
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    padding: 0.15rem 0.5rem;
  }
`;

