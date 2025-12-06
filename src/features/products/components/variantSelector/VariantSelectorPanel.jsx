import styled from 'styled-components';
import VariantOptionGroup from './VariantOptionGroup';

const VariantSelectorPanel = ({
  product,
  variants = [],
  selectedAttributes = {},
  onAttributeChange,
  variantSelectionHook,
}) => {
  const {
    attributeKeys,
    computeAvailableOptions,
    isColorAttribute,
    getVariantSummary,
  } = variantSelectionHook;

  // Don't render if no variants
  if (!variants.length || !attributeKeys.length) {
    return null;
  }

  const variantSummary = getVariantSummary();

  return (
    <PanelContainer>
      <PanelTitle>Select Options</PanelTitle>
      
      {attributeKeys.map((attributeKey) => {
        const options = computeAvailableOptions(attributeKey);
        const isColor = isColorAttribute(attributeKey);

        if (!options.length) return null;

        return (
          <VariantOptionGroup
            key={attributeKey}
            attributeKey={attributeKey}
            options={options}
            isColor={isColor}
            selectedValue={selectedAttributes[attributeKey]}
            onSelect={(value) => onAttributeChange(attributeKey, value)}
          />
        );
      })}

      {variantSummary && (
        <VariantSummary>
          <SummaryLabel>You selected:</SummaryLabel>
          <SummaryValue>{variantSummary}</SummaryValue>
        </VariantSummary>
      )}
    </PanelContainer>
  );
};

export default VariantSelectorPanel;

// Styled Components
const PanelContainer = styled.div`
  background: var(--color-white-0);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-md);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--color-grey-200);
  margin-bottom: var(--spacing-sm);
`;

const PanelTitle = styled.h3`
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  margin-bottom: var(--spacing-sm);
  font-family: var(--font-heading);
`;

const VariantSummary = styled.div`
  margin-top: var(--spacing-sm);
  padding-top: var(--spacing-xs);
  border-top: 1px solid var(--color-grey-200);
  display: flex;
  align-items: center;
  gap: 0.3rem;
  flex-wrap: wrap;
`;

const SummaryLabel = styled.span`
  font-size: 0.75rem;
  font-weight: var(--font-medium);
  color: var(--color-grey-600);
  font-family: var(--font-body);
`;

const SummaryValue = styled.span`
  font-size: 0.75rem;
  font-weight: var(--font-semibold);
  color: var(--color-primary-600);
  font-family: var(--font-body);
`;

