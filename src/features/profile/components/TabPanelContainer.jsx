import styled from "styled-components";
import { keyframes } from "styled-components";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const TabPanelContainer = ({ children, active }) => {
  return (
    <Panel active={active} role="tabpanel">
      {children}
    </Panel>
  );
};

export default TabPanelContainer;

const Panel = styled.div`
  display: ${(props) => (props.active ? "block" : "none")};
  animation: ${fadeIn} 0.3s ease;
  width: 100%;
`;

export const ContentCard = styled.div`
  background: var(--color-bg-card);
  border-radius: 12px;
  padding: var(--space-xl);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: var(--space-lg);
  animation: ${slideInLeft} 0.3s ease;
`;

export const CardTitle = styled.h2`
  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text-dark);
  margin: 0 0 var(--space-sm) 0;
`;

export const CardDescription = styled.p`
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: var(--color-text-light);
  margin: 0 0 var(--space-lg) 0;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
`;

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-md);

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const Label = styled.label`
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-dark);
  margin-bottom: var(--space-xs);
  display: block;
`;

export const Input = styled.input`
  width: 100%;
  padding: var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  color: var(--color-text-dark);
  background: var(--color-bg-card);
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(0, 114, 255, 0.1);
  }

  &:disabled {
    background: var(--color-bg-light);
    cursor: not-allowed;
  }
`;

export const Button = styled.button`
  padding: var(--space-md) var(--space-lg);
  border: none;
  border-radius: 8px;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);

  ${(props) => {
    if (props.variant === "primary") {
      return `
        background: var(--color-primary);
        color: white;
        &:hover {
          background: var(--color-primary-hover);
        }
      `;
    }
    if (props.variant === "danger") {
      return `
        background: var(--color-danger);
        color: white;
        &:hover {
          background: #DC2626;
        }
      `;
    }
    return `
      background: var(--color-bg-light);
      color: var(--color-text-dark);
      border: 1px solid var(--color-border);
      &:hover {
        background: var(--color-border);
      }
    `;
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

