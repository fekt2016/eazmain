/**
 * Centralized variant logic for the Product Detail Page.
 * Treats each purchasable variant as a single SKU (complete variant combination).
 * Used for: default selection, option derivation, matching, disabling, and image sync.
 */

/**
 * Returns the first in-stock variant, else first active, else first variant.
 * Used as default selection on page load.
 * @param {Array} variants - Product variants array
 * @returns {Object|null} - Default variant or null
 */
export function getDefaultVariant(variants) {
  if (!Array.isArray(variants) || variants.length === 0) return null;
  const withStock = variants.find((v) => (v.stock || 0) > 0 && v.status !== 'inactive');
  if (withStock) return withStock;
  const active = variants.find((v) => v.status !== 'inactive');
  return active || variants[0] || null;
}

/**
 * Unique attribute keys (e.g. ['Color', 'Size']) derived from all variants.
 * Scalable for 1, 2, or 3+ variant types.
 * @param {Array} variants
 * @returns {string[]}
 */
export function getVariantAttributeKeys(variants) {
  const keys = new Set();
  (variants || []).forEach((v) => {
    (v.attributes || []).forEach((attr) => {
      if (attr?.key) keys.add(attr.key);
    });
  });
  return Array.from(keys);
}

/**
 * Find the single variant that matches all selected attributes (exact match).
 * Used when user selects options: resolve to one variant for price/stock/images.
 * @param {Array} variants
 * @param {Object} selectedAttributes - e.g. { Color: 'Red', Size: 'M' }
 * @returns {Object|null}
 */
export function findVariantByAttributes(variants, selectedAttributes) {
  if (!Array.isArray(variants) || !selectedAttributes || typeof selectedAttributes !== 'object') return null;
  const entries = Object.entries(selectedAttributes).filter(([, v]) => v != null && v !== '');
  if (entries.length === 0) return null;
  return variants.find((variant) => {
    const attrs = variant.attributes || [];
    return entries.every(([key, value]) =>
      attrs.some((a) => a.key === key && a.value === value)
    );
  }) || null;
}

/**
 * Variants that match the given attributes (subset match).
 * Used to determine which options remain valid when some attributes are selected.
 * @param {Array} variants
 * @param {Object} selectedAttributes
 * @returns {Array}
 */
export function getMatchingVariants(variants, selectedAttributes) {
  if (!Array.isArray(variants) || !selectedAttributes || typeof selectedAttributes !== 'object') return [];
  const entries = Object.entries(selectedAttributes).filter(([, v]) => v != null && v !== '');
  if (entries.length === 0) return [...(variants || [])];
  return (variants || []).filter((variant) => {
    const attrs = variant.attributes || [];
    return entries.every(([key, value]) =>
      attrs.some((a) => a.key === key && a.value === value)
    );
  });
}

/**
 * Whether an option (attribute value) should be disabled.
 * Disabled when: no variant matches that combination, all matching inactive, or all matching out of stock.
 * @param {Array} variants
 * @param {string} attributeKey
 * @param {string} value
 * @param {Object} selectedAttributes - current partial selection
 * @returns {boolean}
 */
export function isOptionDisabled(variants, attributeKey, value, selectedAttributes) {
  const potential = { ...(selectedAttributes || {}), [attributeKey]: value };
  const matching = getMatchingVariants(variants, potential);
  if (matching.length === 0) return true;
  if (matching.every((v) => v.status === 'inactive')) return true;
  // Stock handling: disable option if all matching variants are out of stock
  if (matching.every((v) => (v.stock || 0) === 0)) return true;
  return false;
}

/**
 * Images to show in the main gallery for the current selection.
 * Variant images drive selection: when a variant has images, gallery shows them.
 * @param {Object|null} selectedVariant
 * @param {Array} productImages - fallback from product (product.images or imageCover)
 * @returns {Array} - Array of image URLs
 */
export function getGalleryImagesForVariant(selectedVariant, productImages) {
  const fallback = Array.isArray(productImages) ? productImages : [];
  if (selectedVariant?.images && selectedVariant.images.length > 0) {
    return selectedVariant.images;
  }
  return fallback;
}

/**
 * Check if variant is in stock and active (for Add to Cart and option availability).
 * @param {Object} variant
 * @returns {boolean}
 */
export function isVariantInStock(variant) {
  if (!variant) return false;
  if (variant.status === 'inactive') return false;
  return (variant.stock || 0) > 0;
}
