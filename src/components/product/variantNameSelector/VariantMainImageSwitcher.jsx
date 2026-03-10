import React, { useEffect, useRef } from 'react';
import { useVariantSelectionByName } from '../../../shared/hooks/products/useVariantSelectionByName';

/**
 * Gets the main image to display
 * Priority: selectedVariant.images[0] > product.images[0]
 */
const getMainImage = (selectedVariant, fallbackImages = []) => {
  // If variant is selected, use variant.images[0] or variant.image
  if (selectedVariant) {
    // Check for variant.images[0]
    if (selectedVariant.images && selectedVariant.images.length > 0) {
      return selectedVariant.images[0];
    }
    // Check for variant.image (singular)
    if (selectedVariant.image) {
      return selectedVariant.image;
    }
  }
  // Fallback to product.images[0]
  if (fallbackImages.length > 0) {
    return fallbackImages[0];
  }
  return null;
};

const VariantMainImageSwitcher = ({
  selectedVariant,
  fallbackImages = [],
  onImageChange,
}) => {
  const prevVariantId = useRef(null);
  const prevGalleryRef = useRef(null);

  useEffect(() => {
    const currentVariantId = selectedVariant?._id || selectedVariant?.id || null;
    const isNewVariant = currentVariantId !== prevVariantId.current;
    const isNewGallery = fallbackImages !== prevGalleryRef.current;

    if (isNewVariant || isNewGallery) {
      const mainImage = getMainImage(selectedVariant, fallbackImages);

      if (mainImage && onImageChange) {
        let imageIndex = 0;
        if (selectedVariant) {
          if (selectedVariant.image) {
            imageIndex = 0;
          } else if (selectedVariant.images && selectedVariant.images.length > 0) {
            imageIndex = selectedVariant.images.findIndex(img => img === mainImage);
            if (imageIndex === -1) imageIndex = 0;
          }
        } else {
          imageIndex = fallbackImages.findIndex(img => img === mainImage);
          if (imageIndex === -1) imageIndex = 0;
        }

        onImageChange(imageIndex);
      } else if (!selectedVariant && fallbackImages.length > 0 && onImageChange) {
        onImageChange(0);
      }

      prevVariantId.current = currentVariantId;
      prevGalleryRef.current = fallbackImages;
    }
  }, [selectedVariant, fallbackImages, onImageChange]);

  // This component doesn't render anything - it just handles the image switching logic
  return null;
};

export default VariantMainImageSwitcher;

