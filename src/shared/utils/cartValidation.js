/**
 * Cart Validation Utilities
 * Ensures cart items are valid before being added or restored
 */

import logger from './logger';

/**
 * Resolve default SKU for a product
 * @param {Object} product - Product object
 * @returns {string|null} - Default SKU or null
 */
export function resolveDefaultSku(product) {
  if (!product?.variants || !Array.isArray(product.variants) || product.variants.length === 0) {
    return null;
  }

  // Priority: active variant with SKU > in-stock variant with SKU > first variant with SKU
  const defaultVariant = 
    product.variants.find(v => v.status === 'active' && v.sku) ||
    product.variants.find(v => (v.stock || 0) > 0 && v.sku) ||
    product.variants.find(v => v.sku) ||
    product.variants[0];

  if (defaultVariant?.sku) {
    return defaultVariant.sku.trim().toUpperCase();
  }

  return null;
}

