import { useEffect, useMemo } from 'react';
import { getProductImages } from '../../../../shared/utils/productHelpers';

/**
 * Component to handle image switching based on selected variant
 * This component doesn't render anything, it just manages the image state
 * The actual image display is handled by the parent ProductDetail component
 */
const VariantImageSwitcher = ({
  product,
  selectedVariant,
  selectedImageIndex,
  onImageChange,
}) => {
  // Get variant-specific images if available, otherwise use product images
  const images = useMemo(() => {
    // If variant has its own images, use them
    if (selectedVariant?.images && Array.isArray(selectedVariant.images) && selectedVariant.images.length > 0) {
      return selectedVariant.images;
    }

    // Otherwise, use product images
    return getProductImages(product);
  }, [product, selectedVariant]);

  // Update image when variant changes
  useEffect(() => {
    if (selectedVariant && images.length > 0) {
      // Reset to first image when variant changes
      if (onImageChange && selectedImageIndex >= images.length) {
        onImageChange(0);
      }
    }
  }, [selectedVariant, images, selectedImageIndex, onImageChange]);

  // This component doesn't render anything
  // It's used for side effects only
  return null;
};

export default VariantImageSwitcher;

