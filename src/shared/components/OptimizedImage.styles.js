import styled, { css, keyframes } from "styled-components";
import { devicesMax } from "../styles/breakpoint";

const imageFadeIn = keyframes`
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
`;

export const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: ${({ $aspectRatio }) => $aspectRatio || "1 / 1"};
  overflow: hidden;
  background-color: ${({ $bg }) => $bg || "transparent"};
  border-radius: ${({ $radius }) => $radius || "var(--border-radius-md, 0.75rem)"};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &.image-hover:hover img {
    transform: scale(1.05);
  }
`;

export const StyledImage = styled.img`
  position: relative;
  z-index: 1;
  width: 100% !important;
  height: 100% !important;
  object-fit: ${({ $objectFit }) => $objectFit || "contain"} !important;
  object-position: center;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${({ $loaded, $hasError }) => ($loaded || $hasError ? 1 : 0)};
  animation: ${({ $loaded }) => ($loaded ? css`${imageFadeIn} 0.4s ease-out` : "none")};
  
  transform: ${({ $isZoomed, $zoomX, $zoomY }) => {
    const x = $zoomX != null ? $zoomX : 50;
    const y = $zoomY != null ? $zoomY : 50;
    return $isZoomed
      ? `scale(2.5) translate(${-x + 50}%, ${-y + 50}%)`
      : "scale(1)";
  }};
  transform-origin: center center;
  will-change: transform;
`;

