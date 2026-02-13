import { useState, useCallback, useEffect, useMemo } from 'react';

/**
 * Custom hook for managing variant selection by variant name
 * Handles variant selection, default initialization, and variant data access
 */
export const useVariantSelectionByName = (variants = [], product = null) => {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedVariantImage, setSelectedVariantImage] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Find the default variant to select on page load
   * Priority: 1) variant with defaultSKU flag, 2) first in-stock variant, 3) first active variant, 4) first variant
   */
  const findDefaultVariant = useCallback(() => {
    if (!variants.length) return null;

    // Check for variant with defaultSKU flag (if it exists in the future)
    const defaultVariant = variants.find((v) => v.defaultSKU === true);
    if (defaultVariant) return defaultVariant;

    // Find first variant with stock > 0 and active status
    const inStockVariant = variants.find(
      (v) => (v.stock || 0) > 0 && v.status === 'active'
    );
    if (inStockVariant) return inStockVariant;

    // Find first active variant
    const activeVariant = variants.find((v) => v.status === 'active');
    if (activeVariant) return activeVariant;

    // Fallback to first variant
    return variants[0] || null;
  }, [variants]);

  /**
   * Initialize with default variant
   */
  const initializeDefaultVariant = useCallback(() => {
    if (isInitialized || !variants.length) return;

    const defaultVariant = findDefaultVariant();
    if (defaultVariant) {
      setSelectedVariant(defaultVariant);
      // Set selected variant image - use variant.images[0]
      const variantImage = defaultVariant.images && defaultVariant.images.length > 0 ? defaultVariant.images[0] : null;
      setSelectedVariantImage(variantImage);
      setIsInitialized(true);
    }
  }, [variants, findDefaultVariant, isInitialized]);

  // Auto-initialize on mount or when variants change
  useEffect(() => {
    if (!isInitialized && variants.length > 0) {
      initializeDefaultVariant();
    }
  }, [variants, isInitialized, initializeDefaultVariant]);

  /**
   * Handle variant selection (by name or by clicking variant image).
   * Allow selecting out-of-stock variants so we can show price/SKU and disable Add to Cart;
   * UI (e.g. VariantColorImageGallery) disables the option for out-of-stock so user cannot click them.
   */
  const handleVariantSelect = useCallback((variant) => {
    if (!variant) return;
    setSelectedVariant(variant);
    const variantImage = variant.images && variant.images.length > 0 ? variant.images[0] : null;
    setSelectedVariantImage(variantImage);
  }, []);

  /**
   * Get variant attributes as an array of {key, value} pairs
   */
  const getVariantAttributes = useCallback((variant) => {
    if (!variant || !variant.attributes) return [];
    return variant.attributes.map((attr) => ({
      key: attr.key || '',
      value: attr.value || '',
    }));
  }, []);

  /**
   * Get variant price
   */
  const getVariantPrice = useCallback((variant) => {
    if (!variant) return 0;
    return variant.price || 0;
  }, []);

  /**
   * Get variant original price
   */
  const getVariantOriginalPrice = useCallback((variant) => {
    if (!variant) return 0;
    return variant.originalPrice || variant.price || 0;
  }, []);

  /**
   * Get variant images - returns variant.images array ONLY
   * NEVER falls back to product.images
   */
  const getVariantImages = useCallback((variant) => {
    if (!variant) return [];
    // Check for variant.images array
    if (variant.images && Array.isArray(variant.images) && variant.images.length > 0) {
      return variant.images;
    }
    // Return empty array - never fallback to product.images
    return [];
  }, []);

  /**
   * Get variant color image - for color swatches
   * Returns variant.images[0] ONLY
   */
  const getVariantColorImage = useCallback((variant) => {
    if (!variant) return null;
    if (variant.images && variant.images.length > 0) return variant.images[0];
    return null;
  }, []);

  /**
   * Get variant name/title
   */
  const getVariantName = useCallback((variant) => {
    if (!variant) return '';
    return variant.name || variant.title || 'Unnamed Variant';
  }, []);

  /**
   * Check if variant is available (active and in stock)
   */
  const isVariantAvailable = useCallback((variant) => {
    if (!variant) return false;
    return variant.status === 'active' && (variant.stock || 0) > 0;
  }, []);

  /**
   * Check if variant has discount
   */
  const hasVariantDiscount = useCallback((variant) => {
    if (!variant) return false;
    if (variant.discount > 0) return true;
    if (variant.originalPrice && variant.price && variant.originalPrice > variant.price) {
      return true;
    }
    return false;
  }, []);

  /**
   * Get discount percentage
   */
  const getDiscountPercentage = useCallback((variant) => {
    if (!variant) return 0;
    if (variant.discount > 0) return variant.discount;
    if (variant.originalPrice && variant.price && variant.originalPrice > variant.price) {
      return Math.round(((variant.originalPrice - variant.price) / variant.originalPrice) * 100);
    }
    return 0;
  }, []);

  return {
    // State
    selectedVariant,
    selectedVariantImage,
    isInitialized,
    
    // Methods
    handleVariantSelect,
    initializeDefaultVariant,
    
    // Getters
    getVariantAttributes,
    getVariantPrice,
    getVariantOriginalPrice,
    getVariantImages,
    getVariantColorImage,
    getVariantName,
    isVariantAvailable,
    hasVariantDiscount,
    getDiscountPercentage,
  };
};

