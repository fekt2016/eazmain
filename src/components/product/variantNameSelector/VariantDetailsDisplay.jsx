import styled from 'styled-components';
import { useVariantSelectionByName } from '../../../shared/hooks/products/useVariantSelectionByName';

const VariantDetailsDisplay = ({
  selectedVariant,
  variantSelectionHook,
}) => {
  const { getVariantAttributes } = variantSelectionHook || useVariantSelectionByName([]);

  if (!selectedVariant) return null;

  const attributes = getVariantAttributes(selectedVariant);

  if (!attributes.length) return null;

  return (
    <DetailsContainer>
      <DetailsTitle>Variant Details:</DetailsTitle>
      <DetailsList>
        {attributes.map((attr, index) => {
          if (!attr.key || !attr.value) return null;
          return (
            <DetailItem key={`${attr.key}-${index}`}>
              <DetailLabel>{attr.key}:</DetailLabel>
              <DetailValue>{attr.value}</DetailValue>
            </DetailItem>
          );
        })}
      </DetailsList>
    </DetailsContainer>
  );
};

export default VariantDetailsDisplay;

// Styled Components
const DetailsContainer = styled.div`
  background: var(--color-white-0);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-grey-200);
  margin-bottom: var(--spacing-md);
`;

const DetailsTitle = styled.h3`
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
  margin-bottom: var(--spacing-sm);
  font-family: var(--font-heading);
`;

const DetailsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
`;

const DetailItem = styled.li`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-xs) 0;
`;

const DetailLabel = styled.span`
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  color: var(--color-grey-700);
  font-family: var(--font-body);
  min-width: 6rem;
`;

const DetailValue = styled.span`
  font-size: var(--font-size-sm);
  font-weight: var(--font-medium);
  color: var(--color-grey-900);
  font-family: var(--font-body);
`;

