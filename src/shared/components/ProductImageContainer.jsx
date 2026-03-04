import { useState } from "react";
import styled, { css, keyframes } from "styled-components";

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
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background-color: var(--color-grey-100, #f3f4f6);
  border-radius: var(--border-radius-md, 0.75rem);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  box-sizing: border-box;
`;

const StyledImage = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  ${({ $loaded }) =>
    $loaded
      ? css`
          animation: ${imageFadeIn} 0.35s ease-out;
        `
      : css`
          opacity: 0;
        `}

  .image-container-hover & {
    transform: scale(1.05);
  }
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
 * - Fixed 1:1 aspect ratio (no layout shift).
 * - object-fit: cover so image fills the 1:1 box without stretching; consistent with mobile.
 * - Skeleton while loading, smooth fade-in when loaded.
 * - Neutral background, rounded corners, soft shadow.
 * - Optional hover zoom via parent .image-container-hover.
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
