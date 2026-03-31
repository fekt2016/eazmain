import styled, { css, keyframes } from "styled-components";
import { devicesMax } from "../styles/breakpoint";

const imageFadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

export const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  min-height: 0;
  overflow: hidden;
  background-color: ${({ $bg }) => $bg || "transparent"};
  border-radius: ${({ $radius }) => $radius || "var(--border-radius-md, 0.75rem)"};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const StyledImage = styled.img`
  position: relative;
  z-index: 1;
  display: block;
  width: auto !important;
  height: auto !important;
  max-width: 100% !important;
  max-height: 100% !important;
  object-fit: contain;
  object-position: center;
  opacity: ${({ $loaded, $hasError }) => ($loaded || $hasError ? 1 : 0)};
  animation: ${({ $loaded }) => ($loaded ? css`${imageFadeIn} 0.4s ease-out` : "none")};
  transform: none;
`;

