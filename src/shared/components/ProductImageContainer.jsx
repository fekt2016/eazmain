import { useState } from "react";
import styled, { css, keyframes } from "styled-components";
import { getOptimizedImageUrl, IMAGE_SLOTS } from "../utils/cloudinaryConfig";

const imageFadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const skeletonPulse = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100%;
  min-height: 200px;
  overflow: hidden;
  background-color: var(--color-grey-100, #f8f9fa);
  border-radius: var(--border-radius-md, 0.75rem);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
`;

const StyledImage = styled.img`
  display: block;
  width: auto !important;
  height: auto !important;
  max-width: 100% !important;
  max-height: 100% !important;
  object-fit: contain;
  object-position: center;
  background-color: transparent !important;
  transition: opacity 0.3s ease;

  ${({ $loaded }) =>
    $loaded
      ? css`
          animation: ${imageFadeIn} 0.4s ease-out;
          opacity: 1;
        `
      : css`
          opacity: 0;
        `}
`;

const SkeletonPlaceholder = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    var(--color-grey-100, #f3f4f6) 0%,
    var(--color-grey-200, #e5e7eb) 50%,
    var(--color-grey-100, #f3f4f6) 100%
  );
  background-size: 200% 100%;
  animation: ${skeletonPulse} 1.2s ease-in-out infinite;
`;

const NoImagePlaceholder = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-grey-100, #f3f4f6);
  color: var(--color-grey-500, #6b7280);
  font-size: 0.875rem;
  font-weight: 500;
`;

/**
 * Reusable product image container.
 * - Image maintains its original (natural) size; not forced to fill the container.
 * - max-width/max-height: 100% so it does not overflow; object-fit: contain.
 * - Skeleton while loading, smooth fade-in when loaded.
 */
export default function ProductImageContainer({
  src,
  alt = "Product",
  fallbackSrc,
  className = "",
  ...imgProps
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const effectiveSrc = error && fallbackSrc ? fallbackSrc : src;
  const hasImage = effectiveSrc && effectiveSrc.trim() !== "";

  const handleLoad = () => setLoaded(true);
  const handleError = (e) => {
    if (effectiveSrc === fallbackSrc) {
      setError(true);
    } else if (fallbackSrc) {
      e.target.src = fallbackSrc;
      setError(false);
    } else {
      setError(true);
    }
  };

  if (!hasImage) {
    return (
      <ImageWrapper className={className}>
        <NoImagePlaceholder>No Image</NoImagePlaceholder>
      </ImageWrapper>
    );
  }

  return (
    <ImageWrapper className={`image-container-hover ${className}`.trim()}>
      {!loaded && <SkeletonPlaceholder aria-hidden="true" />}
      <StyledImage
        src={effectiveSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        $loaded={loaded}
        onLoad={handleLoad}
        onError={handleError}
        {...imgProps}
      />
    </ImageWrapper>
  );
}
