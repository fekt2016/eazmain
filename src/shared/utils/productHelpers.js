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
 * Finds the first variant that has a discount (e.g. from Ramadan/campaign via applyDiscounts).
 * @param {Object} product - Product object with variants
 * @returns {{ price: number, originalPrice: number } | null}
 */
const getFirstVariantWithDiscount = (product) => {
  const variants = product?.variants;
  if (!Array.isArray(variants) || variants.length === 0) return null;
  const v = variants.find(
    (variant) =>
      variant?.originalPrice != null &&
      variant.originalPrice > 0 &&
      (variant.price ?? 0) < variant.originalPrice
  );
  if (!v) return null;
  return {
    price: Number(v.price) || 0,
    originalPrice: Number(v.originalPrice) || 0,
  };
};

/**
 * Determines if a product has a discount
 * @param {Object} product - Product object
 * @param {Object} variant - Optional variant object
 * @returns {boolean} - True if product has discount
 */
export const hasProductDiscount = (product, variant = null) => {
  if (!product) return false;

  // Backend-set promo price (when promotionKey applies, calculated from variant price + discount)
  if (product.promoPrice != null && Number(product.promoPrice) > 0) {
    return true;
  }

  // Check if product explicitly states it's on sale (API virtual)
  if (product.isOnSale === true) {
    return true;
  }

  // Campaign/variant discount (e.g. Ramadan): any variant has originalPrice > price
  if (getFirstVariantWithDiscount(product)) {
    return true;
  }

  // Top-level or single-price product
  const currentPrice = variant?.price || product?.defaultPrice || product?.price || product?.minPrice || 0;
  const originalPrice = product?.originalPrice ?? product?.defaultPrice ?? product?.price ?? product?.minPrice ?? 0;

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

  // Backend-set promo price: use originalPrice (or price) and promoPrice for percentage
  const promoPrice = product.promoPrice != null ? Number(product.promoPrice) : 0;
  if (promoPrice > 0) {
    const orig = product.originalPrice != null ? Number(product.originalPrice) : Number(product?.price ?? 0) || 0;
    if (orig > promoPrice) return calculateDiscountPercentage(orig, promoPrice);
  }

  // Use pre-calculated sale percentage if available (API virtual)
  if (product.salePercentage != null && product.salePercentage > 0) {
    return Math.round(Number(product.salePercentage));
  }

  // Campaign/variant discount (e.g. Ramadan)
  const variantDiscount = getFirstVariantWithDiscount(product);
  if (variantDiscount) {
    return calculateDiscountPercentage(variantDiscount.originalPrice, variantDiscount.price);
  }

  // Top-level prices
  const currentPrice = variant?.price || product?.defaultPrice || product?.price || product?.minPrice || 0;
  const originalPrice = product?.originalPrice ?? product?.defaultPrice ?? product?.price ?? product?.minPrice ?? 0;

  return calculateDiscountPercentage(originalPrice, currentPrice);
};

/**
 * Gets display price for a product (with variant support)
 * @param {Object} product - Product object
 * @param {Object} variant - Optional variant object
 * @returns {number} - Display price
 */
/** Dual VAT: customer sees VAT-inclusive price only; prefer priceInclVat when present */
export const getProductDisplayPrice = (product, variant = null) => {
  const incl = variant?.priceInclVat ?? product?.priceInclVat ?? variant?.price;
  if (incl != null && incl !== '') return Number(incl);
  return product?.defaultPrice || product?.price || product?.minPrice || 0;
};

/**
 * Gets original price for a product (pre-discount). Prefer inclusive for display.
 */
export const getProductOriginalPrice = (product) => {
  const first = product?.originalPrice ?? product?.priceInclVat;
  if (first != null && first !== '') return Number(first);
  return product?.defaultPrice || product?.price || product?.minPrice || 0;
};

/**
 * Gets the price to display as "current" on the card.
 * When product has a discount: returns the discounted (sale) price and original struck through.
 * Supports campaign/variant discounts (e.g. Ramadan) where only variants have originalPrice.
 * @param {Object} product - Product object
 * @returns {{ displayPrice: number, originalPrice: number | null }} - displayPrice = price to show as main; originalPrice = price to show struck through, or null
 */
export const getProductPriceForDisplay = (product) => {
  if (!product) {
    return { displayPrice: 0, originalPrice: null };
  }
  // Always use VAT-inclusive price for display on product cards
  const base = Number(getProductDisplayPrice(product)) || 0;
  const original = product?.originalPrice != null ? Number(product.originalPrice) : null;
  const discountPrice = product?.discountPrice != null ? Number(product.discountPrice) : null;

  const promoPrice = product?.promoPrice != null ? Number(product.promoPrice) : 0;
  if (promoPrice > 0 && (original != null ? promoPrice < original : true)) {
    return {
      displayPrice: promoPrice,
      originalPrice: original != null && original > promoPrice ? original : base,
    };
  }

  const variantDiscount = getFirstVariantWithDiscount(product);
  if (variantDiscount && variantDiscount.price > 0 && variantDiscount.originalPrice > variantDiscount.price) {
    return {
      displayPrice: variantDiscount.priceInclVat ?? variantDiscount.price,
      originalPrice: variantDiscount.originalPrice,
    };
  }

  if (hasProductDiscount(product)) {
    // Top-level discount fields
    if (discountPrice != null && discountPrice < base) {
      return { displayPrice: discountPrice, originalPrice: base };
    }
    if (original != null && original > base) {
      return { displayPrice: base, originalPrice: original };
    }
    if (original != null && original > 0 && original !== base) {
      return { displayPrice: base, originalPrice: original };
    }
  }
  return { displayPrice: base, originalPrice: null };
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
 * Checks if product has price range (multiple variants with different prices).
 * When product has a discount, we do not show a price range — only discount + original struck through.
 * @param {Object} product - Product object
 * @returns {boolean} - True if product has price range (and no discount)
 */
export const hasProductPriceRange = (product) => {
  if (!product) return false;
  if (hasProductDiscount(product)) return false;
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
  // If variant is provided and active, return variant stock
  if (variant && variant.status !== 'inactive') {
    return variant.stock || 0;
  }
  
  // If variant is inactive, return 0
  if (variant && variant.status === 'inactive') {
    return 0;
  }
  
  // Fallback to product stock or calculate from variants
  if (product?.stock !== undefined) {
    return product.stock;
  }
  
  // If product has variants, sum up active variant stocks
  if (product?.variants && Array.isArray(product.variants) && product.variants.length > 0) {
    return product.variants
      .filter((v) => v.status !== 'inactive')
      .reduce((sum, v) => sum + (v.stock || 0), 0);
  }
  
  return 0;
};

/**
 * Checks if product/variant is in stock
 * @param {Object} product - Product object
 * @param {Object} variant - Optional variant object
 * @returns {boolean} - True if in stock
 */
export const isProductInStock = (product, variant = null) => {
  // If variant is provided, check variant stock and status
  if (variant) {
    // Variant must have stock > 0 AND status must be 'active'
    const isActive = variant.status !== 'inactive';
    const hasStock = (variant.stock || 0) > 0;
    return isActive && hasStock;
  }
  
  // If no variant, check product stock
  const stock = product?.stock || 0;
  return stock > 0;
};

