import { useEffect } from 'react';
import { useVariantSelectionByName } from '../../../shared/hooks/products/useVariantSelectionByName';

/**
 * Gets the main image to display
 * Priority: selectedVariant.images[0] > product.images[0]
 */
const getMainImage = (selectedVariant, fallbackImages = []) => {
  // If variant is selected, use variant.images[0]
  if (selectedVariant) {
    // Check for variant.images[0]
    if (selectedVariant.images && selectedVariant.images.length > 0) {
      return selectedVariant.images[0];
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
  variantSelectionHook,
}) => {
  useEffect(() => {
    const mainImage = getMainImage(selectedVariant, fallbackImages);
    
    if (mainImage && onImageChange) {
      // Find the index of the main image in the images array
      // For variant images, we need to check if it's in the variant.images array
      // For product images, we need to find it in fallbackImages
      let imageIndex = 0;
      
      if (selectedVariant) {
        // If variant has image, check variant.images array
        if (selectedVariant.image) {
          // Single image field - use index 0 if it's in variant.images, otherwise 0
          imageIndex = 0;
        } else if (selectedVariant.images && selectedVariant.images.length > 0) {
          // Find index in variant.images array
          imageIndex = selectedVariant.images.findIndex(img => img === mainImage);
          if (imageIndex === -1) imageIndex = 0;
        }
      } else {
        // Find index in fallback images
        imageIndex = fallbackImages.findIndex(img => img === mainImage);
        if (imageIndex === -1) imageIndex = 0;
      }
      
      onImageChange(imageIndex);
    } else if (!selectedVariant && fallbackImages.length > 0 && onImageChange) {
      // No variant selected, use first fallback image
      onImageChange(0);
    }
  }, [selectedVariant, fallbackImages, onImageChange]);

  // This component doesn't render anything - it just handles the image switching logic
  return null;
};

export default VariantMainImageSwitcher;

