import styled from 'styled-components';
import { useVariantSelectionByName } from '../../../shared/hooks/products/useVariantSelectionByName';

const VariantColorImageGallery = ({
  selectedVariant,
  variants = [],
  onImageSelect,
  variantSelectionHook,
}) => {
  const { getVariantColorImage } = variantSelectionHook || useVariantSelectionByName([]);

  if (!selectedVariant || !variants.length) return null;

  // Get all variants that have color images
  const variantsWithImages = variants.filter((variant) => {
    const colorImage = getVariantColorImage(variant);
    return colorImage !== null;
  });

  // If no variants have images, don't show gallery
  if (variantsWithImages.length === 0) return null;

  // Get selected variant's color image
  const selectedColorImage = getVariantColorImage(selectedVariant);

  return (
    <GalleryContainer>
      <GalleryLabel>Color Options:</GalleryLabel>
      <ImageSwatches>
        {variantsWithImages.map((variant) => {
          const colorImage = getVariantColorImage(variant);
          const isSelected = selectedVariant._id === variant._id;
          const isAvailable = variant.status === 'active' && (variant.stock || 0) > 0;

          if (!colorImage) return null;

          return (
            <ImageSwatch
              key={variant._id || variant.sku}
              type="button"
              $isSelected={isSelected}
              $isAvailable={isAvailable}
              onClick={() => isAvailable && onImageSelect && onImageSelect(variant)}
              disabled={!isAvailable}
              aria-label={`Select color: ${variant.name || 'Variant'}`}
            >
              <SwatchImage src={colorImage} alt={variant.name || 'Color option'} />
              {isSelected && <SelectedIndicator />}
            </ImageSwatch>
          );
        })}
      </ImageSwatches>
    </GalleryContainer>
  );
};

export default VariantColorImageGallery;

// Styled Components
const GalleryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
`;

const GalleryLabel = styled.label`
  font-size: var(--font-size-md);
  font-weight: var(--font-semibold);
  color: var(--color-grey-900);
`;

const ImageSwatches = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
`;

const ImageSwatch = styled.button`
  position: relative;
  width: 4rem;
  height: 4rem;
  border-radius: var(--border-radius-md);
  border: 2px solid
    ${(props) =>
      props.$isSelected
        ? 'var(--color-primary-500)'
        : props.$isAvailable
          ? 'var(--color-grey-200)'
          : 'var(--color-grey-300)'};
  overflow: hidden;
  cursor: ${(props) => (props.$isAvailable ? 'pointer' : 'not-allowed')};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: ${(props) => (props.$isAvailable ? 1 : 0.5)};
  background: var(--color-white-0);
  padding: 0;
  box-shadow: ${(props) =>
    props.$isSelected
      ? '0 0 0 2px var(--color-primary-100), 0 2px 8px rgba(0, 120, 204, 0.2)'
      : '0 1px 3px rgba(0, 0, 0, 0.08)'};

  &:hover:not(:disabled) {
    border-color: ${(props) =>
      props.$isSelected
        ? 'var(--color-primary-600)'
        : 'var(--color-primary-400)'};
    transform: scale(1.05);
    box-shadow: ${(props) =>
      props.$isSelected
        ? '0 0 0 2px var(--color-primary-200), 0 4px 12px rgba(0, 120, 204, 0.25)'
        : '0 2px 6px rgba(0, 0, 0, 0.12)'};
  }

  &:active:not(:disabled) {
    transform: scale(1.02);
  }

  @media (max-width: 768px) {
    width: 3.5rem;
    height: 3.5rem;
  }
`;

const SwatchImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const SelectedIndicator = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 120, 204, 0.1);
  border: 2px solid var(--color-primary-500);
  border-radius: var(--border-radius-md);
  pointer-events: none;
`;

