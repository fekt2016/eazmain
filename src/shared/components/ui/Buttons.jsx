import styled from "styled-components";
import { Link } from "react-router-dom";
import { devicesMax } from "../../styles/breakpoint";

// Note: To use framer-motion animations, install: npm install framer-motion
// Then change: styled.button → styled(motion.button)
// And import: import { motion } from "framer-motion";

export const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  padding: ${({ $size }) => {
    switch ($size) {
      case "sm":
        return "var(--space-sm) var(--space-lg)";
      case "lg":
        return "var(--space-lg) var(--space-2xl)";
      default:
        return "var(--space-md) var(--space-xl)";
    }
  }};
  border-radius: var(--radius-lg);
  font-family: var(--font-body);
  font-weight: var(--font-semibold);
  font-size: ${({ $size }) => {
    switch ($size) {
      case "sm":
        return "var(--text-sm)";
      case "lg":
        return "var(--text-lg)";
      default:
        return "var(--text-base)";
    }
  }};
  border: none;
  cursor: pointer;
  transition: all var(--transition-normal);
  text-decoration: none;
  position: relative;
  overflow: hidden;

  /* Accessibility: Focus visible */
  &:focus-visible {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    aria-disabled: true;
  }

  /* Button with icons */
  &:has(svg) {
    line-height: 0;
  }

  @media ${devicesMax.sm} {
    font-size: var(--text-sm);
    padding: var(--space-sm) var(--space-md);
  }
`;

export const PrimaryButton = styled(Button)`
  background: var(--gradient-primary);
  color: var(--white);
  box-shadow: var(--shadow-md);

  &:hover:not(:disabled) {
    box-shadow: var(--shadow-lg);
  }

  &:active:not(:disabled) {
    box-shadow: var(--shadow-md);
  }
`;

export const SecondaryButton = styled(Button)`
  background: transparent;
  color: var(--primary);
  border: 2px solid var(--primary);

  &:hover:not(:disabled) {
    background: var(--primary);
    color: var(--white);
  }
`;

export const AccentButton = styled(Button)`
  background: var(--gradient-accent);
  color: var(--white);
  font-weight: var(--font-bold);

  &:hover:not(:disabled) {
    box-shadow: var(--shadow-gold);
  }
`;

export const GhostButton = styled(Button)`
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--gray-300);

  &:hover:not(:disabled) {
    background: var(--gray-50);
    border-color: var(--gray-400);
  }
`;

export const SuccessButton = styled(Button)`
  background: var(--success);
  color: var(--white);
  box-shadow: var(--shadow-sm);

  &:hover:not(:disabled) {
    background: #059669;
    box-shadow: var(--shadow-md);
  }
`;

export const WarningButton = styled(Button)`
  background: var(--warning);
  color: var(--white);
  box-shadow: var(--shadow-sm);

  &:hover:not(:disabled) {
    background: #d97706;
    box-shadow: var(--shadow-md);
  }
`;

export const ErrorButton = styled(Button)`
  background: var(--error);
  color: var(--white);
  box-shadow: var(--shadow-sm);

  &:hover:not(:disabled) {
    background: #dc2626;
    box-shadow: var(--shadow-md);
  }
`;

// NEW: DangerButton - More prominent than ErrorButton for critical actions
export const DangerButton = styled(Button)`
  background: var(--error);
  color: var(--white);
  border: 2px solid var(--error);
  box-shadow: var(--shadow-md);
  font-weight: var(--font-bold);

  &:hover:not(:disabled) {
    background: #dc2626;
    border-color: #dc2626;
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px) scale(1.02);
  }

  &:active:not(:disabled) {
    transform: translateY(0) scale(1);
    box-shadow: var(--shadow-md);
  }

  &:focus {
    outline: 2px solid var(--error-light);
    outline-offset: 2px;
  }
`;

// Alternative DangerButton with outline variant
export const DangerOutlineButton = styled(Button)`
  background: transparent;
  color: var(--error);
  border: 2px solid var(--error);
  font-weight: var(--font-semibold);

  &:hover:not(:disabled) {
    background: var(--error);
    color: var(--white);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: var(--shadow-sm);
  }
`;

// Link variant of buttons
export const ButtonLink = styled(PrimaryButton).attrs({ as: Link })``;
export const SecondaryButtonLink = styled(SecondaryButton).attrs({
  as: Link,
})``;
export const AccentButtonLink = styled(AccentButton).attrs({ as: Link })``;
export const GhostButtonLink = styled(GhostButton).attrs({ as: Link })``;
export const DangerButtonLink = styled(DangerButton).attrs({ as: Link })``;
export const DangerOutlineButtonLink = styled(DangerOutlineButton).attrs({
  as: Link,
})``;

// Export all buttons for easy importing
export default {
  Button,
  PrimaryButton,
  SecondaryButton,
  AccentButton,
  GhostButton,
  SuccessButton,
  WarningButton,
  ErrorButton,
  DangerButton,
  DangerOutlineButton,
  ButtonLink,
  SecondaryButtonLink,
  AccentButtonLink,
  GhostButtonLink,
  DangerButtonLink,
  DangerOutlineButtonLink,
};

