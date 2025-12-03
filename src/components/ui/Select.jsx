import styled, { css } from 'styled-components';
import { FaChevronDown } from 'react-icons/fa';

const SelectContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SelectStyled = styled.select`
  width: 100%;
  padding: var(--space-md) var(--space-lg) var(--space-md) var(--space-md);
  font-size: var(--text-base);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--radius-md);
  background: var(--color-white-0);
  color: var(--color-grey-900);
  appearance: none;
  cursor: pointer;
  transition: border-color var(--transition-base), box-shadow var(--transition-base);

  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right var(--space-md) center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;

  &::placeholder {
    color: var(--color-grey-400);
  }

  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px rgba(255, 196, 0, 0.1);
  }

  &:disabled {
    background: var(--color-grey-50);
    color: var(--color-grey-500);
    cursor: not-allowed;
  }
`;

const SelectIcon = styled(FaChevronDown)`
  position: absolute;
  right: var(--space-md);
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--color-grey-400);
  transition: color var(--transition-base);
`;

const Select = styled(SelectStyled)`
  ${({ error }) => error && css`
    border-color: var(--color-red-300);

    &:focus {
      border-color: var(--color-red-500);
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }

    + ${SelectIcon} {
      color: var(--color-red-500);
    }
  `}
`;

const SelectComponent = ({ 
  label, 
  error, 
  helperText, 
  ...props 
}) => {
  return (
    <SelectContainer>
      {label && <label htmlFor={props.id} style={{ display: 'block', marginBottom: 'var(--space-sm)', fontWeight: 'var(--font-medium)', color: 'var(--color-grey-700)' }}>{label}</label>}
      <Select {...props} error={!!error} />
      <SelectIcon />
      {error && <span style={{ color: 'var(--color-red-500)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-xs)' }}>{error}</span>}
      {helperText && !error && <span style={{ color: 'var(--color-grey-500)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-xs)' }}>{helperText}</span>}
    </SelectContainer>
  );
};

export default SelectComponent;
