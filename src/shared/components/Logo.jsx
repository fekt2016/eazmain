import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

/**
 * Saiisai Logo Component
 * Can be used as a standalone logo or as a link to home
 */
const Logo = ({
  variant = "default", // "default" | "compact" | "icon" | "footer"
  to = null, // If provided, wraps logo in Link
  className = "",
  ...props
}) => {
  const logoContent = (
    <LogoContainer className={className} $variant={variant} {...props}>
      <LogoIcon $variant={variant}>
        {/* Use provided Saiisai PNG logo from public folder */}
        <img
          src="/newSaiisaiLogo.png"
          alt="Saiisai – Ghana e-commerce and online shopping logo"
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
          loading="eager"
          fetchPriority="high"
        />
      </LogoIcon>
      {variant !== "icon" && (
        <LogoText>
          <LogoTextPrimary $variant={variant}>Sai</LogoTextPrimary>
          <LogoTextSecondary $variant={variant}>isai</LogoTextSecondary>
        </LogoText>
      )}
    </LogoContainer>
  );

  if (to) {
    return (
      <LogoLink to={to}>
        {logoContent}
      </LogoLink>
    );
  }

  return logoContent;
};

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => (props.$variant === "compact" ? "0.5rem" : "0.75rem")};
  cursor: ${(props) => (props.onClick || props.to ? "pointer" : "default")};
  transition: opacity 0.2s ease;

  &:hover {
    opacity: ${(props) => (props.onClick || props.to ? 0.8 : 1)};
  }
`;

const LogoLink = styled(Link)`
  text-decoration: none;
  display: inline-flex;
  cursor: pointer;
`;

const LogoIcon = styled.div`
  width: ${(props) => {
    if (props.$variant === "compact" || props.$variant === "footer") return "32px";
    if (props.$variant === "icon") return "40px";
    return "36px";
  }};
  height: ${(props) => {
    if (props.$variant === "compact" || props.$variant === "footer") return "32px";
    if (props.$variant === "icon") return "40px";
    return "36px";
  }};
  min-height: 32px;
  color: #D4882A;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    object-fit: contain;
  }
  svg {
    width: 100%;
    height: 100%;
  }
`;

const LogoText = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.125rem;
  line-height: 1;
`;

const LogoTextPrimary = styled.span`
  font-size: ${(props) => {
    if (props.$variant === "compact") return "0.85rem";
    return "1rem";
  }};
  font-weight: 700;
  color: ${(props) => (props.$variant === "footer" ? "#ffffff" : "#1e293b")};
  letter-spacing: -0.5px;
`;

const LogoTextSecondary = styled.span`
  font-size: ${(props) => {
    if (props.$variant === "compact") return "0.85rem";
    return "1rem";
  }};
  font-weight: 700;
  color: ${(props) => (props.$variant === "footer" ? "#D4882A" : "#ffc400")};
  letter-spacing: -0.5px;
`;

export default Logo;

