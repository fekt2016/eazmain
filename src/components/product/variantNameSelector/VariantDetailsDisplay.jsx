import styled from 'styled-components';
import { useVariantSelectionByName } from '../../../shared/hooks/products/useVariantSelectionByName';

const VariantDetailsDisplay = ({
  selectedVariant,
  variantSelectionHook,
}) => {
  const { getVariantAttributes } = variantSelectionHook || useVariantSelectionByName([]);

  if (!selectedVariant) return null;

  const attributes = getVariantAttributes(selectedVariant);
  const condition = selectedVariant.condition || 'new';

  // Format condition for display
  const formatCondition = (cond) => {
    if (!cond) return 'New';
    return cond
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const hasDetails = attributes.length > 0 || condition;

  if (!hasDetails) return null;

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
        {condition && (
          <DetailItem>
            <DetailLabel>Condition:</DetailLabel>
            <ConditionValue $condition={condition}>
              {formatCondition(condition)}
            </ConditionValue>
          </DetailItem>
        )}
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

const ConditionValue = styled.span`
  font-size: var(--font-size-sm);
  font-weight: var(--font-semibold);
  font-family: var(--font-body);
  padding: 0.2rem 0.6rem;
  border-radius: 0.4rem;
  display: inline-block;
  background: ${({ $condition }) => {
    switch ($condition) {
      case 'new':
        return 'var(--color-blue-100, #dbeafe)';
      case 'like_new':
      case 'open_box':
        return 'var(--color-green-100, #dcfce7)';
      case 'refurbished':
        return 'var(--color-purple-100, #f3e8ff)';
      case 'used':
        return 'var(--color-yellow-100, #fef9c3)';
      case 'fair':
        return 'var(--color-orange-100, #ffedd5)';
      case 'poor':
        return 'var(--color-red-100, #fee2e2)';
      default:
        return 'var(--color-grey-100, #f3f4f6)';
    }
  }};
  color: ${({ $condition }) => {
    switch ($condition) {
      case 'new':
        return 'var(--color-blue-700, #1e40af)';
      case 'like_new':
      case 'open_box':
        return 'var(--color-green-700, #15803d)';
      case 'refurbished':
        return 'var(--color-purple-700, #6b21a8)';
      case 'used':
        return 'var(--color-yellow-700, #a16207)';
      case 'fair':
        return 'var(--color-orange-700, #c2410c)';
      case 'poor':
        return 'var(--color-red-700, #b91c1c)';
      default:
        return 'var(--color-grey-700, #374151)';
    }
  }};
`;

