import styled from 'styled-components';
import VariantChipOption from './VariantChipOption';
import VariantColorSwatch from './VariantColorSwatch';
import { isColorValue } from '../../../../shared/utils/productHelpers';

const VariantOptionGroup = ({
  attributeKey,
  options = [],
  isColor = false,
  selectedValue,
  onSelect,
}) => {
  if (!options.length) return null;

  return (
    <GroupContainer>
      <GroupLabel>
        {attributeKey}
        {selectedValue && (
          <SelectedIndicator>: {selectedValue}</SelectedIndicator>
        )}
      </GroupLabel>

      <OptionsContainer $isColor={isColor}>
        {options.map((option) => {
          const showAsColor = isColor && isColorValue(option.value);

          if (showAsColor) {
            return (
              <VariantColorSwatch
                key={`${attributeKey}-${option.value}`}
                color={option.value}
                isSelected={option.isSelected}
                isDisabled={option.isDisabled}
                stock={option.stock}
                isActive={option.isActive}
                onClick={() => !option.isDisabled && onSelect(option.value)}
              />
            );
          }

          return (
            <VariantChipOption
              key={`${attributeKey}-${option.value}`}
              value={option.value}
              isSelected={option.isSelected}
              isDisabled={option.isDisabled}
              stock={option.stock}
              isActive={option.isActive}
              onClick={() => !option.isDisabled && onSelect(option.value)}
            />
          );
        })}
      </OptionsContainer>
    </GroupContainer>
  );
};

export default VariantOptionGroup;

// Styled Components
const GroupContainer = styled.div`
  margin-bottom: var(--spacing-sm);

  &:last-child {
    margin-bottom: 0;
  }
`;

const GroupLabel = styled.label`
  display: block;
  font-size: 0.8rem;
  font-weight: var(--font-semibold);
  color: var(--color-grey-800);
  margin-bottom: 0.5rem;
`;

const SelectedIndicator = styled.span`
  font-weight: var(--font-medium);
  color: var(--primary-700);
  font-size: 0.8rem;
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  ${(props) =>
    props.$isColor
      ? `
    align-items: center;
  `
      : ''}
`;

