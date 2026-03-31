/**
 * Manual mock for productHelpers
 */
export const hasProductDiscount = jest.fn((product) => 
  product.originalPrice && product.originalPrice > product.price
);

export const getProductDiscountPercentage = jest.fn((product) => {
  if (!product.originalPrice || !product.price) return 0;
  return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
});

export const isProductTrending = jest.fn(() => false);
export const isProductNew = jest.fn(() => false);
export const hasProductPriceRange = jest.fn(() => false);

export const getProductPriceForDisplay = jest.fn((product) => {
  if (!product) return { displayPrice: 0, originalPrice: null };
  const base = Number(product.price) || 0;
  const original = product.originalPrice != null ? Number(product.originalPrice) : null;
  return {
    displayPrice: base,
    originalPrice: original != null && original > base ? original : null,
  };
});

export const getProductTotalStock = jest.fn((product) => {
  if (product.variants && product.variants.length > 0) {
    return product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
  }
  return product.stock || 0;
});


