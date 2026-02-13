import { useState, useMemo, useCallback, useEffect } from 'react';
import { isColorValue } from '../../../shared/utils/productHelpers';

/**
 * Custom hook for managing variant selection logic
 * Handles attribute selection, variant matching, and availability checking
 * Auto-selects default variant on initialization
 */
export const useVariantSelection = (variants = [], product = null) => {
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get all unique attribute keys from variants
  const attributeKeys = useMemo(() => {
    const keys = new Set();
    variants.forEach((variant) => {
      variant.attributes?.forEach((attr) => {
        keys.add(attr.key);
      });
    });
    return Array.from(keys);
  }, [variants]);

  /**
   * Match selected attributes to a variant
   * Returns the variant that matches all selected attributes, or null
   * Supports partial matching - variant can have more attributes than selected
   */
  const matchVariant = useCallback((attributes, variantList = variants) => {
    if (!variantList.length || !Object.keys(attributes).length) {
      return null;
    }

    // For complete selection, find exact match (all attributes match)
    // For partial selection, find variants that contain all selected attributes
    return variantList.find((variant) => {
      // Check if variant matches all selected attributes
      const matchesAllAttributes = Object.entries(attributes).every(([key, value]) => {
        return variant.attributes?.some(
          (attr) => attr.key === key && attr.value === value
        );
      });

      // Also check that variant has all the required attribute keys
      const hasAllAttributeKeys = Object.keys(attributes).every((key) => {
        return variant.attributes?.some((attr) => attr.key === key);
      });

      // Match if variant contains all selected attributes (subset matching)
      // Removed hasSameAttributeCount check to support partial selections
      return matchesAllAttributes && hasAllAttributeKeys;
    }) || null;
  }, [variants]);

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
    if (defaultVariant && defaultVariant.attributes) {
      const initialAttributes = {};
      defaultVariant.attributes.forEach((attr) => {
        if (attr.key && attr.value) {
          initialAttributes[attr.key] = attr.value;
        }
      });
      setSelectedAttributes(initialAttributes);
      setSelectedVariant(defaultVariant);
      setIsInitialized(true);
    }
  }, [variants, findDefaultVariant, isInitialized]);

  // Auto-initialize on mount or when variants change
  useEffect(() => {
    if (!isInitialized && variants.length > 0) {
      initializeDefaultVariant();
    }
  }, [variants, isInitialized, initializeDefaultVariant]);

  // Update selected variant when attributes change
  useEffect(() => {
    if (Object.keys(selectedAttributes).length > 0) {
      // Only match if all attributes are selected (complete selection)
      // For partial selection, we'll use findMatchingVariants to show available options
      const allAttributesSelected = attributeKeys.every(key => selectedAttributes[key]);
      
      if (allAttributesSelected) {
        const matched = matchVariant(selectedAttributes);
        setSelectedVariant(matched);
      } else {
        // Partial selection - don't set selectedVariant yet
        setSelectedVariant(null);
      }
    } else {
      setSelectedVariant(null);
    }
  }, [selectedAttributes, matchVariant, attributeKeys]);

  /**
   * Select an attribute value (option click).
   */
  const selectAttribute = useCallback((attributeName, value) => {
    setSelectedAttributes((prev) => ({
      ...prev,
      [attributeName]: value,
    }));
  }, []);

  /**
   * Select a full variant (e.g. when user clicks a variant image).
   * Sets attributes from the variant so selectedVariant updates to match; enables image sync.
   */
  const selectVariant = useCallback((variant) => {
    if (!variant?.attributes?.length) return;
    const attrs = {};
    variant.attributes.forEach((attr) => {
      if (attr?.key && attr?.value) attrs[attr.key] = attr.value;
    });
    setSelectedAttributes(attrs);
  }, []);

  /**
   * Find all variants matching partial or complete selection
   * Returns array of variants that contain all selected attributes
   */
  const findMatchingVariants = useCallback((attributes = selectedAttributes) => {
    if (!variants.length || !Object.keys(attributes).length) {
      return [];
    }

    return variants.filter((variant) => {
      return Object.entries(attributes).every(([key, value]) => {
        return variant.attributes?.some(
          (attr) => attr.key === key && attr.value === value
        );
      });
    });
  }, [variants, selectedAttributes]);

  /**
   * Check if an option is disabled (invalid combination or all matching variants out of stock).
   * Stock disabling: out-of-stock variants are disabled so only valid purchasable options can be selected.
   */
  const isOptionDisabled = useCallback((attributeName, value) => {
    const potentialAttributes = {
      ...selectedAttributes,
      [attributeName]: value,
    };

    const matchingVariants = findMatchingVariants(potentialAttributes);

    // Disabled if no variant matches this combination
    if (matchingVariants.length === 0) return true;
    // Disabled if all matching variants are inactive
    if (matchingVariants.every((v) => v.status === 'inactive')) return true;
    // Disabled if all matching variants are out of stock (stock handling: disable option)
    if (matchingVariants.every((v) => (v.stock || 0) === 0)) return true;

    return false;
  }, [selectedAttributes, findMatchingVariants]);

  /**
   * Compute available options for an attribute
   * Returns options with availability status (available/outOfStock/unavailable) and stock info
   */
  const computeAvailableOptions = useCallback((attributeKey) => {
    if (!variants.length) return [];

    // Get all unique values for this attribute
    const allValues = new Set();
    variants.forEach((variant) => {
      const attr = variant.attributes?.find((a) => a.key === attributeKey);
      if (attr?.value) {
        allValues.add(attr.value);
      }
    });

    return Array.from(allValues).map((value) => {
      // Build potential attributes if this option is selected
      const potentialAttributes = {
        ...selectedAttributes,
        [attributeKey]: value,
      };

      // Find all variants matching this potential selection
      const matchingVariants = findMatchingVariants(potentialAttributes);
      
      // For complete selection (all attributes selected), find exact match
      const allAttributesSelected = attributeKeys.every(key => 
        potentialAttributes[key] !== undefined
      );
      
      let potentialVariant = null;
      let variantStock = 0;
      let isVariantActive = false;
      let availabilityStatus = 'unavailable'; // 'available' | 'outOfStock' | 'unavailable'
      
      if (allAttributesSelected && matchingVariants.length > 0) {
        // Complete selection - find exact match
        potentialVariant = matchVariant(potentialAttributes, variants);
        variantStock = potentialVariant?.stock || 0;
        isVariantActive = potentialVariant?.status !== 'inactive';
        
        if (potentialVariant && isVariantActive) {
          availabilityStatus = variantStock > 0 ? 'available' : 'outOfStock';
        }
      } else if (matchingVariants.length > 0) {
        // Partial selection - check if any matching variant is available
        const availableVariants = matchingVariants.filter(v => 
          v.status !== 'inactive' && (v.stock || 0) > 0
        );
        const outOfStockVariants = matchingVariants.filter(v => 
          v.status !== 'inactive' && (v.stock || 0) === 0
        );
        
        if (availableVariants.length > 0) {
          availabilityStatus = 'available';
          // Use first available variant for stock display
          variantStock = availableVariants[0].stock || 0;
          isVariantActive = true;
        } else if (outOfStockVariants.length > 0) {
          availabilityStatus = 'outOfStock';
          isVariantActive = true;
        }
      }
      
      // Option disabled: invalid combination, all inactive, or all out of stock (variant combination logic)
      const isDisabled = isOptionDisabled(attributeKey, value);

      return {
        value,
        availabilityStatus, // 'available' | 'outOfStock' | 'unavailable'
        isAvailable: availabilityStatus === 'available',
        isDisabled: isDisabled || availabilityStatus === 'outOfStock', // Disable out-of-stock options in UI
        isSelected: selectedAttributes[attributeKey] === value,
        variant: potentialVariant,
        matchingVariants, // All variants matching this option
        stock: variantStock,
        isActive: isVariantActive,
      };
    });
  }, [variants, selectedAttributes, matchVariant, isOptionDisabled, findMatchingVariants, attributeKeys]);

  /**
   * Clear selection (reset to default)
   */
  const clearSelection = useCallback(() => {
    initializeDefaultVariant();
  }, [initializeDefaultVariant]);

  // Check if an attribute is a color attribute
  const isColorAttribute = useCallback((attributeKey) => {
    return attributeKey.toLowerCase().includes('color');
  }, []);

  // Check if a value is a color value
  const isColorValueAttribute = useCallback((value) => {
    return isColorValue(value);
  }, []);

  // Get variant summary text
  const getVariantSummary = useCallback(() => {
    if (!selectedVariant || !Object.keys(selectedAttributes).length) {
      return null;
    }

    const summaryParts = Object.entries(selectedAttributes)
      .map(([key, value]) => `${key}: ${value}`)
      .join(' / ');

    return summaryParts;
  }, [selectedVariant, selectedAttributes]);

  // Check if all attributes are selected
  const allAttributesSelected = useMemo(() => {
    return attributeKeys.length > 0 && attributeKeys.every(key => selectedAttributes[key]);
  }, [attributeKeys, selectedAttributes]);

  // Get missing attributes
  const missingAttributes = useMemo(() => {
    return attributeKeys.filter(key => !selectedAttributes[key]);
  }, [attributeKeys, selectedAttributes]);

  return {
    // State
    selectedAttributes,
    selectedVariant,
    isInitialized,
    
    // Computed values
    attributeKeys,
    allAttributesSelected,
    missingAttributes,
    
    // Methods
    selectAttribute,
    selectVariant,
    initializeDefaultVariant,
    computeAvailableOptions,
    isOptionDisabled,
    matchVariant,
    findMatchingVariants,
    clearSelection,
    
    // Helpers
    isColorAttribute,
    isColorValueAttribute,
    getVariantSummary,
  };
};
