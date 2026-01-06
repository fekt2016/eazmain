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

export const getProductTotalStock = jest.fn((product) => {
  if (product.variants && product.variants.length > 0) {
    return product.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
  }
  return product.stock || 0;
});


