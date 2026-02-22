import styled from "styled-components";
import { devicesMax } from "../../styles/breakpoint";

const Input = styled.input`
  font-size: var(--font-size-md);
  font-weight: 400;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-grey-300);
  border-radius: var(--border-radius-md);
  background: var(--color-white-0);
  color: var(--color-grey-900);
  width: ${({ $fullWidth }) => ($fullWidth ? "100%" : "auto")};
  transition: var(--transition-base);
  
  &:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px rgba(255, 196, 0, 0.1);
  }
  
  &:disabled {
    background-color: var(--color-grey-200);
    color: var(--color-grey-500);
    cursor: not-allowed;
  }
  
  &::placeholder {
    color: var(--color-grey-400);
  }
  
  @media ${devicesMax.sm} {
    font-size: var(--font-size-sm);
    padding: var(--spacing-xs) var(--spacing-sm);
  }
`;

export default Input;

