import styled from "styled-components";

/**
 * Reusable radio-based variant selector.
 *
 * Attribute-based mode (preferred when variants have attributes):
 * - attributeKeys: string[] of attribute names (e.g. ["Color", "Size"])
 * - computeAvailableOptions: (attributeKey) => Option[]
 * - selectAttribute: (attributeKey, value) => void
 *
 * Simple mode (when variants have no attributes, e.g. name-only):
 * - variants: array of variant objects
 * - selectedVariant: currently selected variant (object or null)
 * - onSelectVariant: (variant) => void
 * - variantLabel: (variant) => string — optional, defaults to variant.name
 */
const VariantRadioSelector = ({
  attributeKeys = [],
  computeAvailableOptions,
  selectAttribute,
  showOutOfStockMeta = true,
  // Simple mode (name-based variants)
  variants = [],
  selectedVariant,
  onSelectVariant,
  variantLabel,
}) => {
  const isAttributeMode =
    attributeKeys.length > 0 && computeAvailableOptions && selectAttribute;
  const isSimpleMode = variants.length >= 1 && onSelectVariant;

  if (isAttributeMode) {
    return (
      <VariantOptionsForm>
        {attributeKeys.map((attributeKey) => {
          const options = computeAvailableOptions(attributeKey);
          if (!options || options.length === 0) return null;

          return (
            <VariantOptionGroup key={attributeKey}>
              <VariantOptionLegend>{attributeKey}</VariantOptionLegend>
              <VariantRadioList role="radiogroup" aria-label={attributeKey}>
                {options.map((option) => {
                  const id = `${attributeKey}-${option.value}`
                    .replace(/\s+/g, "-")
                    .toLowerCase();

                  return (
                    <VariantRadioItem key={id}>
                      <VariantRadioInput
                        type="radio"
                        id={id}
                        name={attributeKey}
                        value={option.value}
                        checked={option.isSelected}
                        disabled={option.isDisabled}
                        onChange={() =>
                          !option.isDisabled &&
                          selectAttribute(attributeKey, option.value)
                        }
                      />
                      <VariantRadioLabel
                        htmlFor={id}
                        $selected={option.isSelected}
                        $disabled={option.isDisabled}
                      >
                        <VariantRadioText>{option.value}</VariantRadioText>
                        {showOutOfStockMeta &&
                          option.availabilityStatus === "outOfStock" && (
                            <VariantRadioMeta>Out of stock</VariantRadioMeta>
                          )}
                      </VariantRadioLabel>
                    </VariantRadioItem>
                  );
                })}
              </VariantRadioList>
            </VariantOptionGroup>
          );
        })}
      </VariantOptionsForm>
    );
  }

  if (isSimpleMode) {
    const selectedId =
      selectedVariant?._id ??
      selectedVariant?.id ??
      selectedVariant?.sku ??
      null;
    const getLabel = variantLabel || ((v) => v.name || v.sku || "Option");

    return (
      <VariantOptionsForm>
        <VariantOptionGroup>
          <VariantOptionLegend>Option</VariantOptionLegend>
          <VariantRadioList role="radiogroup" aria-label="Variant">
            {variants.map((variant) => {
              const variantId = variant._id ?? variant.id ?? variant.sku;
              const id = `variant-${variantId ?? Math.random()}`;
              const isSelected =
                (variantId != null && variantId === selectedId) ||
                variant === selectedVariant;
              const stock = variant.stock ?? variant.quantity ?? 0;
              const isDisabled = stock <= 0;

              return (
                <VariantRadioItem key={id}>
                  <VariantRadioInput
                    type="radio"
                    id={id}
                    name="variant-option"
                    value={variant.sku ?? variant._id ?? variant.id}
                    checked={isSelected}
                    disabled={isDisabled}
                    onChange={() => !isDisabled && onSelectVariant(variant)}
                  />
                  <VariantRadioLabel
                    htmlFor={id}
                    $selected={isSelected}
                    $disabled={isDisabled}
                  >
                    <VariantRadioText>{getLabel(variant)}</VariantRadioText>
                    {showOutOfStockMeta && isDisabled && (
                      <VariantRadioMeta>Out of stock</VariantRadioMeta>
                    )}
                  </VariantRadioLabel>
                </VariantRadioItem>
              );
            })}
          </VariantRadioList>
        </VariantOptionGroup>
      </VariantOptionsForm>
    );
  }

  return null;
};

export default VariantRadioSelector;

// Styled components (kept local for reusability)
const VariantOptionsForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
`;

const VariantOptionGroup = styled.fieldset`
  border: none;
  padding: 0;
  margin: 0;
`;

const VariantOptionLegend = styled.legend`
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-grey-900);
  margin-bottom: 0.5rem;
`;

const VariantRadioList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const VariantRadioItem = styled.div`
  position: relative;
`;

const VariantRadioInput = styled.input`
  position: absolute;
  opacity: 0;
  pointer-events: none;
`;

const VariantRadioLabel = styled.label`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  border: 1.5px solid
    ${({ $selected, $disabled }) =>
      $disabled
        ? "var(--color-grey-300)"
        : $selected
          ? "var(--color-primary-500)"
          : "var(--color-grey-300)"};
  background: var(--color-white-0);
  color: ${({ $disabled }) =>
    $disabled ? "var(--color-grey-400)" : "var(--color-grey-800)"};
  font-size: 0.85rem;
  font-weight: 500;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  min-width: 3rem;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.1s ease;

  box-shadow: ${({ $selected }) =>
    $selected ? "0 0 0 1px rgba(59, 130, 246, 0.3)" : "none"};

  &:hover {
    border-color: ${({ $disabled }) =>
      $disabled ? "var(--color-grey-300)" : "var(--color-primary-400)"};
    transform: ${({ $disabled }) =>
      $disabled ? "none" : "translateY(-1px)"};
  }
`;

const VariantRadioText = styled.span`
  white-space: nowrap;
`;

const VariantRadioMeta = styled.span`
  margin-left: 0.4rem;
  font-size: 0.75rem;
  color: var(--color-grey-500);
`;

