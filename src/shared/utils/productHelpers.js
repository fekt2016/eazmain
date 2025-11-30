/**
 * Product utility functions
 * Centralized logic for product-related calculations and validations
 */

/**
 * Validates if a value is a color (named color or hex code)
 * @param {string} value - The value to validate
 * @returns {boolean} - True if the value is a valid color
 */
export const isColorValue = (value) => {
  if (!value || typeof value !== 'string') return false;

  const colorNames = [
    "black", "silver", "gray", "white", "maroon", "red", "purple",
    "fuchsia", "green", "lime", "olive", "yellow", "navy", "blue",
    "teal", "aqua", "orange",
  ];
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return colorNames.includes(value.toLowerCase()) || hexRegex.test(value);
};

/**
 * Calculates discount percentage from original and current price
 * @param {number} originalPrice - Original price
 * @param {number} currentPrice - Current/sale price
 * @returns {number} - Discount percentage (0-100)
 */
export const calculateDiscountPercentage = (originalPrice, currentPrice) => {
  if (!originalPrice || originalPrice <= 0 || !currentPrice || currentPrice <= 0) {
    return 0;
  }
  if (currentPrice >= originalPrice) {
    return 0;
  }
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

/**
 * Determines if a product has a discount
 * @param {Object} product - Product object
 * @param {Object} variant - Optional variant object
 * @returns {boolean} - True if product has discount
 */
export const hasProductDiscount = (product, variant = null) => {
  if (!product) return false;

  // Check if product explicitly states it's on sale
  if (product.isOnSale !== undefined) {
    return product.isOnSale;
  }

  // Calculate from prices
  const currentPrice = variant?.price || product?.defaultPrice || product?.price || product?.minPrice || 0;
  const originalPrice = product?.originalPrice || product?.defaultPrice || product?.price || product?.minPrice || 0;

  return originalPrice > 0 && currentPrice < originalPrice;
};

/**
 * Gets discount percentage for a product
 * @param {Object} product - Product object
 * @param {Object} variant - Optional variant object
 * @returns {number} - Discount percentage (0-100)
 */
export const getProductDiscountPercentage = (product, variant = null) => {
  if (!product) return 0;

  // Use pre-calculated sale percentage if available
  if (product.salePercentage !== undefined) {
    return product.salePercentage;
  }

  // Calculate from prices
  const currentPrice = variant?.price || product?.defaultPrice || product?.price || product?.minPrice || 0;
  const originalPrice = product?.originalPrice || product?.defaultPrice || product?.price || product?.minPrice || 0;

  return calculateDiscountPercentage(originalPrice, currentPrice);
};

/**
 * Gets display price for a product (with variant support)
 * @param {Object} product - Product object
 * @param {Object} variant - Optional variant object
 * @returns {number} - Display price
 */
export const getProductDisplayPrice = (product, variant = null) => {
  return variant?.price || product?.defaultPrice || product?.price || product?.minPrice || 0;
};

/**
 * Gets original price for a product
 * @param {Object} product - Product object
 * @returns {number} - Original price
 */
export const getProductOriginalPrice = (product) => {
  return product?.originalPrice || product?.defaultPrice || product?.price || product?.minPrice || 0;
};

/**
 * Extracts product images array from product object
 * @param {Object} product - Product object
 * @returns {Array<string>} - Array of image URLs
 */
export const getProductImages = (product) => {
  if (!product) return [];

  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    return product.images;
  }

  if (product.imageCover) {
    return [product.imageCover];
  }

  return [];
};

/**
 * Checks if product is trending (sold more than threshold)
 * @param {Object} product - Product object
 * @param {number} threshold - Minimum sales count (default: 50)
 * @returns {boolean} - True if product is trending
 */
export const isProductTrending = (product, threshold = 50) => {
  return (product.totalSold || 0) > threshold;
};

/**
 * Checks if product is new (created within specified days)
 * @param {Object} product - Product object
 * @param {number} days - Number of days to consider as "new" (default: 7)
 * @returns {boolean} - True if product is new
 */
export const isProductNew = (product, days = 7) => {
  if (!product.createdAt) return false;
  const createdTime = new Date(product.createdAt).getTime();
  const daysInMs = days * 24 * 60 * 60 * 1000;
  return Date.now() - createdTime < daysInMs;
};

/**
 * Calculates total stock from product variants
 * @param {Object} product - Product object
 * @returns {number} - Total stock count
 */
export const getProductTotalStock = (product) => {
  if (product.totalStock !== undefined) {
    return product.totalStock;
  }

  if (product.variants && Array.isArray(product.variants) && product.variants.length > 0) {
    return product.variants.reduce((sum, variant) => sum + (variant.stock || 0), 0);
  }

  return 0;
};

/**
 * Checks if product has price range (multiple variants with different prices)
 * @param {Object} product - Product object
 * @returns {boolean} - True if product has price range
 */
export const hasProductPriceRange = (product) => {
  return !!(product.minPrice && product.maxPrice && product.minPrice !== product.maxPrice);
};

/**
 * Gets product SKU (from variant or product)
 * @param {Object} product - Product object
 * @param {Object} variant - Optional variant object
 * @returns {string} - SKU string
 */
export const getProductSku = (product, variant = null) => {
  return variant?.sku || product?.sku || '';
};

/**
 * Gets stock count (from variant or product)
 * @param {Object} product - Product object
 * @param {Object} variant - Optional variant object
 * @returns {number} - Stock count
 */
export const getProductStock = (product, variant = null) => {
  return variant?.stock || product?.stock || 0;
};

/**
 * Checks if product/variant is in stock
 * @param {Object} product - Product object
 * @param {Object} variant - Optional variant object
 * @returns {boolean} - True if in stock
 */
export const isProductInStock = (product, variant = null) => {
  const stock = getProductStock(product, variant);
  return stock > 0;
};

