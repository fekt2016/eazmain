import styled, { css } from "styled-components";
import { devicesMax } from "../styles/breakpoint";
import { spin } from "../styles/animations";

const sizeStyles = {
  xs: css`
    padding: var(--spacing-xs);
    font-size: var(--font-size-xs);
    border-radius: var(--border-radius-sm);
    min-height: 2.4rem;
  `,
  sm: css`
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-size-sm);
    border-radius: var(--border-radius-sm);
    min-height: 3.2rem;
  `,
  md: css`
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--font-size-md);
    border-radius: var(--border-radius-md);
    min-height: 4rem;
  `,
  lg: css`
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: var(--font-size-lg);
    border-radius: var(--border-radius-lg);
    min-height: 4.8rem;
  `,
};

const variantStyles = {
  primary: css`
    background-color: var(--color-primary-500);
    color: var(--color-white-0);
    border: none;
    &:hover:not(:disabled) {
      background-color: var(--color-primary-400);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(255, 196, 0, 0.3);
    }
    &:active:not(:disabled) {
      transform: translateY(0);
    }
  `,
  secondary: css`
    background-color: var(--color-grey-800);
    color: var(--color-white-0);
    border: none;
    &:hover:not(:disabled) {
      background-color: var(--color-grey-700);
      transform: translateY(-1px);
    }
    &:active:not(:disabled) {
      transform: translateY(0);
    }
  `,
  outline: css`
    background-color: transparent;
    color: var(--color-grey-700);
    border: 1px solid var(--color-grey-300);
    &:hover:not(:disabled) {
      background-color: var(--color-grey-50);
      border-color: var(--color-grey-400);
    }
  `,
  danger: css`
    background-color: var(--color-red-600);
    color: var(--color-white-0);
    border: none;
    &:hover:not(:disabled) {
      background-color: var(--color-red-700);
      transform: translateY(-1px);
    }
    &:active:not(:disabled) {
      transform: translateY(0);
    }
  `,
  ghost: css`
    background-color: transparent;
    color: var(--color-grey-700);
    border: none;
    &:hover:not(:disabled) {
      background-color: var(--color-grey-100);
    }
  `,
  success: css`
    background-color: var(--color-green-700);
    color: var(--color-white-0);
    border: none;
    &:hover:not(:disabled) {
      background-color: var(--color-green-500);
      transform: translateY(-1px);
    }
    &:active:not(:disabled) {
      transform: translateY(0);
    }
  `,
  link: css`
    background-color: transparent;
    color: var(--color-primary-500);
    border: none;
    text-decoration: underline;
    padding: 0;
    min-height: auto;
    &:hover:not(:disabled) {
      color: var(--color-primary-600);
    }
  `,
};

const ButtonStyled = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  font-family: var(--font-body);
  font-weight: ${({ $weight }) => $weight || 500};
  cursor: pointer;
  transition: var(--transition-base);
  width: ${({ $fullWidth }) => ($fullWidth ? "100%" : "auto")};
  position: relative;
  white-space: nowrap;
  text-decoration: none;
  
  /* Icon-only button (circular/square) */
  ${({ $iconOnly, $size }) =>
    $iconOnly &&
    css`
      width: ${$size === "xs" ? "2.4rem" : $size === "sm" ? "3.2rem" : $size === "md" ? "4rem" : "4.8rem"};
      height: ${$size === "xs" ? "2.4rem" : $size === "sm" ? "3.2rem" : $size === "md" ? "4rem" : "4.8rem"};
      padding: 0;
      border-radius: ${({ $round }) => ($round ? "50%" : "var(--border-radius-md)")};
    `}

  ${({ $size }) => sizeStyles[$size || "md"]};
  ${({ $variant }) => variantStyles[$variant || "primary"]};

  /* Gradient variant */
  ${({ $gradient }) =>
    $gradient &&
    css`
      background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      &:hover:not(:disabled) {
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
      }
    `}

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none !important;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(255, 196, 0, 0.2);
  }
  
  @media ${devicesMax.sm} {
    font-size: ${({ $size }) => {
      if ($size === "lg") return "var(--font-size-md)";
      if ($size === "md") return "var(--font-size-sm)";
      return "var(--font-size-xs)";
    }};
    padding: ${({ $size, $iconOnly }) => {
      if ($iconOnly) return "0";
      if ($size === "lg") return "var(--spacing-sm) var(--spacing-md)";
      return "var(--spacing-xs) var(--spacing-sm)";
    }};
  }
`;

const Spinner = styled.span`
  width: ${({ $size }) => ($size === "xs" ? 12 : $size === "sm" ? 14 : $size === "lg" ? 18 : 16)}px;
  height: ${({ $size }) => ($size === "xs" ? 12 : $size === "sm" ? 14 : $size === "lg" ? 18 : 16)}px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: ${spin} 0.6s linear infinite;
`;

/**
 * Universal Button Component
 * 
 * @param {string} variant - Button style: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success' | 'link'
 * @param {string} size - Button size: 'xs' | 'sm' | 'md' | 'lg'
 * @param {boolean} fullWidth - Make button full width
 * @param {boolean} isLoading - Show loading spinner
 * @param {boolean} iconOnly - Icon-only button (circular/square)
 * @param {boolean} round - Make icon-only button circular
 * @param {boolean} gradient - Apply gradient background
 * @param {string} weight - Font weight: '400' | '500' | '600' | '700'
 * @param {ReactNode} children - Button content
 * @param {object} props - All other button props (onClick, disabled, type, etc.)
 * 
 * @example
 * <Button variant="primary" size="md">Click Me</Button>
 * <Button variant="outline" iconOnly round><FaIcon /></Button>
 * <Button variant="danger" isLoading>Delete</Button>
 * <Button as={Link} to="/path" variant="ghost">Navigate</Button>
 */
export default function Button({
  isLoading,
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  iconOnly = false,
  round = false,
  gradient = false,
  weight,
  ...props
}) {
  return (
    <ButtonStyled
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      $iconOnly={iconOnly}
      $round={round}
      $gradient={gradient}
      $weight={weight}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Spinner $size={size} />}
      {children}
    </ButtonStyled>
  );
}
