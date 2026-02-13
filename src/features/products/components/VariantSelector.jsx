import { useMemo } from "react";
import styled, { css } from "styled-components";
import { FaExclamationTriangle } from "react-icons/fa";
import { pulse } from "../../../shared/styles/animations";
import { isColorValue } from "../../../shared/utils/productHelpers";

const VariantSelector = ({
  variants = [],
  selectedAttributes = {},
  onAttributeChange,
  variantSelectionHook, // Hook that provides computeAvailableOptions
  categoryAttributes = [], // Category attributes to show all available attributes
}) => {
  // Get all unique attributes from variants
  const variantAttributeKeys = useMemo(() => {
    const keys = new Set();
    variants.forEach((variant) => {
      variant.attributes?.forEach((attr) => {
        if (attr.key) keys.add(attr.key);
      });
    });
    return Array.from(keys);
  }, [variants]);

  // Get all attribute keys from category attributes
  const categoryAttributeKeys = useMemo(() => {
    return categoryAttributes.map(attr => attr.name || attr.key || attr).filter(Boolean);
  }, [categoryAttributes]);

  // Combine category attributes with variant attributes (category takes precedence)
  const attributeKeys = useMemo(() => {
    const allKeys = new Set([...categoryAttributeKeys, ...variantAttributeKeys]);
    return Array.from(allKeys);
  }, [categoryAttributeKeys, variantAttributeKeys]);

  // If no variants or attributes, don't render
  if (attributeKeys.length === 0) {
    return null;
  }

  // Use hook's computeAvailableOptions if provided, otherwise fallback to basic logic
  const getAvailableOptions = variantSelectionHook?.computeAvailableOptions || null;

  return (
    <VariantsCard>
      <CardTitle>Select Options</CardTitle>
      {attributeKeys.length > 0 && attributeKeys.map((attribute) => {
        const isColor = attribute.toLowerCase().includes("color");

        // Use hook's computeAvailableOptions if available
        const options = getAvailableOptions 
          ? getAvailableOptions(attribute)
          : null;

        // Fallback: Get all unique values for this attribute
        const values = options 
          ? options.map(opt => opt.value)
          : [
              ...new Set(
                variants
                  .map((v) => v.attributes.find((a) => a.key === attribute)?.value)
                  .filter(Boolean)
              ),
            ];

        return (
          <VariantGroup key={attribute}>
            <VariantGroupHeader>
              <VariantGroupLabel>{attribute}</VariantGroupLabel>
            </VariantGroupHeader>

            <VariantOptionsList>
              {values.map((value) => {
                const showAsColor = isColor && isColorValue(value);
                
                // Use hook's availability data if available
                const optionData = options?.find(opt => opt.value === value);
                const availabilityStatus = optionData?.availabilityStatus || 'unavailable';
                const variantStock = optionData?.stock || 0;
                const isDisabled = optionData?.isDisabled ?? false;
                const isSelected = selectedAttributes[attribute] === value;
                const isLowStock = variantStock > 0 && variantStock <= 5 && availabilityStatus === 'available';
                
                // Determine visual states
                const isOutOfStock = availabilityStatus === 'outOfStock';
                const isUnavailable = availabilityStatus === 'unavailable';
                const isAvailable = availabilityStatus === 'available';
                
                const radioId = `${attribute}-${value}`;

                return (
                  <VariantOptionItem
                    key={radioId}
                    $selected={isSelected}
                    $disabled={isDisabled}
                    $status={availabilityStatus}
                    onClick={() => !isDisabled && onAttributeChange(attribute, value)}
                  >
                    <RadioButtonContainer>
                      <CustomRadioInput
                        type="radio"
                        id={radioId}
                        name={attribute}
                        value={value}
                        checked={isSelected}
                        disabled={isDisabled}
                        onChange={() => !isDisabled && onAttributeChange(attribute, value)}
                        aria-label={`${attribute}: ${value}${isUnavailable ? ' (Not available)' : isOutOfStock ? ' (Out of stock)' : isLowStock ? ` (${variantStock} left)` : isAvailable ? ` (${variantStock} in stock)` : ''}`}
                      />
                      <RadioButton $checked={isSelected} $disabled={isDisabled}>
                        {isSelected && <RadioButtonInner />}
                      </RadioButton>
                    </RadioButtonContainer>

                    <ValueContainer>
                      {showAsColor ? (
                        <ColorValueWrapper>
                          <ColorSwatch $color={value} $selected={isSelected} />
                          <ValueText $selected={isSelected}>{value}</ValueText>
                        </ColorValueWrapper>
                      ) : (
                        <ValueText $selected={isSelected}>{value}</ValueText>
                      )}
                    </ValueContainer>

                    <StatusContainer>
                      {isUnavailable && (
                        <StatusBadge $type="unavailable">
                          <FaExclamationTriangle size={10} />
                          Unavailable
                        </StatusBadge>
                      )}
                      {isOutOfStock && !isUnavailable && (
                        <StatusBadge $type="outOfStock">
                          <FaExclamationTriangle size={10} />
                          Out of Stock
                        </StatusBadge>
                      )}
                    </StatusContainer>
                  </VariantOptionItem>
                );
              })}
            </VariantOptionsList>
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
  padding: 1.5rem;
  border-radius: 1.2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--color-grey-100);
`;

const CardTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-grey-900);
  margin-bottom: 1.5rem;
`;

const VariantGroup = styled.div`
  margin-bottom: 1.8rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const VariantGroupHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  gap: 0.8rem;
`;

const VariantGroupLabel = styled.label`
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--color-grey-800);
  display: block;
`;

const VariantOptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const VariantOptionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 0.5rem;
  border-radius: 0.8rem;
  max-width: 100px;
  min-width: 100px;
  width: 100px;
  border: 2px solid
    ${(props) => {
      if (props.$selected) return "var(--color-primary-500)";
      if (props.$disabled) return "var(--color-grey-300)";
      if (props.$status === 'available') return "var(--color-green-300)";
      if (props.$status === 'outOfStock') return "var(--color-red-300)";
      return "var(--color-grey-200)";
    }};
  background: ${(props) => {
    if (props.$selected) return "var(--color-primary-50)";
    if (props.$disabled) return "var(--color-grey-50)";
    if (props.$status === 'available') return "var(--color-green-50)";
    if (props.$status === 'outOfStock') return "var(--color-red-50)";
    return "white";
  }};
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${(props) => (props.$disabled ? 0.6 : 1)};
  overflow: hidden;
  box-sizing: border-box;

  &:hover:not([disabled]) {
    border-color: ${(props) => {
      if (props.$selected) return "var(--color-primary-600)";
      if (props.$status === 'available') return "var(--color-green-500)";
      if (props.$status === 'outOfStock') return "var(--color-red-500)";
      return "var(--color-primary-400)";
    }};
    transform: translateX(2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  @media (max-width: 768px) {
    padding: 0.5rem 0.4rem;
    gap: 0.3rem;
    max-width: 100px;
    min-width: 100px;
    width: 100px;
  }
`;

const RadioButtonContainer = styled.div`
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.2rem;
  min-width: 1.2rem;
  max-width: 1.2rem;
`;

const CustomRadioInput = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  margin: 0;
  padding: 0;
  cursor: pointer;

  &:focus-visible + div {
    outline: 2px solid var(--color-primary-200);
    outline-offset: 1px;
  }

  &:disabled + div {
    cursor: not-allowed;
  }
`;

const RadioButton = styled.div`
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  border: 1.5px solid
    ${(props) => {
      if (props.$checked) return "var(--color-primary-500)";
      if (props.$disabled) return "var(--color-grey-400)";
      return "var(--color-grey-300)";
    }};
  background: ${(props) =>
    props.$checked ? "var(--color-primary-500)" : "white"};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  position: relative;

  @media (max-width: 768px) {
    width: 0.9rem;
    height: 0.9rem;
  }
`;

const RadioButtonInner = styled.div`
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 50%;
  background: white;
  animation: ${pulse} 0.3s ease-out;

  @media (max-width: 768px) {
    width: 0.35rem;
    height: 0.35rem;
  }
`;

const ValueContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  min-width: 0;
  max-width: calc(100px - 1.2rem - 0.4rem - 2.5rem - 0.4rem - 2px - 2px);
  overflow: hidden;
`;

const ColorValueWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex: 1;
`;

const ColorSwatch = styled.div`
  width: 1.5rem;
  height: 1.5rem;
  background-color: ${(props) => props.$color};
  border-radius: 50%;
  border: 1.5px solid
    ${(props) =>
      props.$selected ? "var(--color-primary-500)" : "var(--color-grey-300)"};
  box-shadow: ${(props) =>
    props.$selected
      ? "0 0 0 1px var(--color-primary-100), 0 1px 3px rgba(0, 0, 0, 0.1)"
      : "0 1px 2px rgba(0, 0, 0, 0.06)"};
  transition: all 0.3s ease;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 1.3rem;
    height: 1.3rem;
  }
`;

const ValueText = styled.span`
  font-size: 1rem;
  font-weight: ${(props) => (props.$selected ? "600" : "500")};
  color: ${(props) =>
    props.$selected ? "var(--color-primary-700)" : "var(--color-grey-800)"};
  transition: all 0.2s ease;
  word-break: break-word;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-left: auto;
  max-width: 2.5rem;
  min-width: 2.5rem;
  width: 2.5rem;
  justify-content: flex-end;
`;

const StatusBadge = styled.span`
  display: flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.15rem 0.3rem;
  border-radius: 0.4rem;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: ${(props) => {
    if (props.$type === 'unavailable') return "var(--color-red-100)";
    if (props.$type === 'outOfStock') return "var(--color-red-100)";
    if (props.$type === 'lowStock') return "var(--color-yellow-100)";
    return "var(--color-green-100)";
  }};
  color: ${(props) => {
    if (props.$type === 'unavailable') return "var(--color-red-700)";
    if (props.$type === 'outOfStock') return "var(--color-red-700)";
    if (props.$type === 'lowStock') return "var(--color-yellow-700)";
    return "var(--color-green-700)";
  }};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  max-width: 100%;

  @media (max-width: 768px) {
    font-size: 0.7rem;
    padding: 0.1rem 0.25rem;
    gap: 0.15rem;
  }
`;
