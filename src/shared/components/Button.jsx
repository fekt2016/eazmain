import styled, { css } from "styled-components";
import { devicesMax } from "../styles/breakpoint";
import LoadingSpinner from "./LoadingSpinner";

const sizeStyles = {
  xs: css`
    padding: 1rem;
    font-size: 0.8rem;
    border-radius: 6px;
    min-height: 2.4rem;
  `,
  sm: css`
    padding: 1rem 1rem;
    font-size: 0.875rem;
    border-radius: 6px;
    min-height: 3.2rem;
  `,
  md: css`
    padding: 1rem 1rem;
    font-size: 0.9rem;
    border-radius: 9px;
    min-height: 4rem;
  `,
  lg: css`
    padding: 1rem 1rem;
    font-size: 1.1rem;
    border-radius: 12px;
    min-height: 4.8rem;
  `,
};

const variantStyles = {
  primary: css`
    background-color: #E8920A;
    color: #FFFFFF;
    border: none;
    &:hover:not(:disabled) {
      background-color: #E8920A;
      transform: translateY(-1px);
    }
    &:active:not(:disabled) {
      transform: translateY(0);
    }
  `,
  secondary: css`
    background-color: #1F2937;
    color: #FFFFFF;
    border: none;
    &:hover:not(:disabled) {
      background-color: #374151;
      transform: translateY(-1px);
    }
    &:active:not(:disabled) {
      transform: translateY(0);
    }
  `,
  outline: css`
    background-color: transparent;
    color: #374151;
    border: 1px solid #E5E7EB;
    &:hover:not(:disabled) {
      background-color: #F9F8F5;
      border-color: #D1D5DB;
    }
  `,
  danger: css`
    background-color: #A32D2D;
    color: #FFFFFF;
    border: none;
    &:hover:not(:disabled) {
      background-color: #A32D2D;
      transform: translateY(-1px);
    }
    &:active:not(:disabled) {
      transform: translateY(0);
    }
  `,
  ghost: css`
    background-color: transparent;
    color: #374151;
    border: none;
    &:hover:not(:disabled) {
      background-color: #F9F8F5;
    }
  `,
  success: css`
    background-color: #3B6D11;
    color: #FFFFFF;
    border: none;
    &:hover:not(:disabled) {
      background-color: #3B6D11;
      transform: translateY(-1px);
    }
    &:active:not(:disabled) {
      transform: translateY(0);
    }
  `,
  link: css`
    background-color: transparent;
    color: #E8920A;
    border: none;
    text-decoration: underline;
    padding: 0;
    min-height: auto;
    &:hover:not(:disabled) {
      color: #E8920A;
    }
  `,
};

const ButtonStyled = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  font-weight: ${({ $weight }) => $weight || 500};
  cursor: pointer;
  transition: 0.12s;
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
      border-radius: ${({ $round }) => ($round ? "50%" : "9px")};
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
    box-shadow: 0 0 0 3px rgba(43, 122, 255, 0.2);
  }
  
  &:focus-visible {
    outline: 2px solid var(--color-primary-500);
    outline-offset: 2px;
  }
  
  @media ${devicesMax.sm} {
    font-size: ${({ $size }) => {
    if ($size === "lg") return "0.9rem";
    if ($size === "md") return "0.875rem";
    return "0.8rem";
  }};
    padding: ${({ $size, $iconOnly }) => {
    if ($iconOnly) return "0";
    if ($size === "lg") return "1rem 1rem";
    return "1rem 1rem";
  }};
  }
`;

const IconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

/**
 * Universal Button Component - GLOBAL STANDARD
 * 
 * This is the SINGLE SOURCE OF TRUTH for all buttons across the application.
 * All other button components should be deprecated and replaced with this one.
 * 
 * @param {string} label - Button text (alternative to children)
 * @param {ReactNode} children - Button content (alternative to label)
 * @param {Function} onClick - Click handler
 * @param {string} type - Button type: 'button' | 'submit' | 'reset'
 * @param {boolean} disabled - Disable the button
 * @param {boolean} loading - Show loading spinner and disable button
 * @param {string} variant - Button style: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success' | 'link'
 * @param {string} size - Button size: 'xs' | 'sm' | 'md' | 'lg'
 * @param {boolean} fullWidth - Make button full width
 * @param {ReactNode} leftIcon - Icon to display on the left
 * @param {ReactNode} rightIcon - Icon to display on the right
 * @param {boolean} iconOnly - Icon-only button (circular/square)
 * @param {boolean} round - Make icon-only button circular
 * @param {boolean} gradient - Apply gradient background
 * @param {string} weight - Font weight: '400' | '500' | '600' | '700'
 * @param {string} ariaLabel - Accessibility label
 * @param {object} props - All other button props
 * 
 * @example
 * <Button variant="primary" size="md" onClick={handleClick}>Click Me</Button>
 * <Button variant="outline" iconOnly round><FaIcon /></Button>
 * <Button variant="danger" loading={isSubmitting}>Delete</Button>
 * <Button leftIcon={<FaIcon />} rightIcon={<FaChevron />}>Action</Button>
 * <Button as={Link} to="/path" variant="ghost">Navigate</Button>
 */
export default function Button({
  label,
  children,
  onClick,
  type = "button",
  disabled = false,
  loading = false,
  variant = "primary",
  size = "md",
  fullWidth = false,
  leftIcon,
  rightIcon,
  iconOnly = false,
  round = false,
  gradient = false,
  weight,
  ariaLabel,
  ...props
}) {
  // Determine button content
  const buttonContent = label || children;

  // When loading, show spinner instead of content (unless iconOnly)
  const showSpinner = loading && !iconOnly;
  const showContent = !loading || iconOnly;

  return (
    <ButtonStyled
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      $iconOnly={iconOnly}
      $round={round}
      $gradient={gradient}
      $weight={weight}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      aria-label={ariaLabel || (iconOnly && buttonContent ? String(buttonContent) : undefined)}
      role="button"
      aria-busy={loading}
      {...props}
    >
      {showSpinner && (
        <IconWrapper>
          <LoadingSpinner size="sm" />
        </IconWrapper>
      )}
      {showContent && leftIcon && (
        <IconWrapper>{leftIcon}</IconWrapper>
      )}
      {showContent && !iconOnly && buttonContent}
      {showContent && rightIcon && (
        <IconWrapper>{rightIcon}</IconWrapper>
      )}
    </ButtonStyled>
  );
}
