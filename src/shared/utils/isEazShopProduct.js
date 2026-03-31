const EAZSHOP_SELLER_ID = '6970b22eaba06cadfd4b8035';

/**
 * Determine if a product should be treated as EazShop (Saiisai official store).
 *
 * "Use only eazshop": we intentionally do NOT rely on seller.role strings
 * (like "eazshop_store" / "official_store"). Instead we rely on:
 * - backend-provided `isEazShopProduct`, and
 * - fallback to the platform seller id when `isEazShopProduct` is missing/false.
 *
 * @param {object} product
 * @returns {boolean}
 */
export const isEazShopProduct = (product) => {
  if (!product || typeof product !== 'object') return false;

  if (product.isEazShopProduct === true) return true;

  const seller = product.seller;
  if (!seller) return false;

  // seller can be either an object or an id string
  if (typeof seller === 'string') {
    return seller === EAZSHOP_SELLER_ID;
  }

  const sellerId =
    seller._id ?? seller.id ?? seller.sellerId ?? seller.seller_id ?? null;

  if (!sellerId) return false;
  return String(sellerId) === EAZSHOP_SELLER_ID;
};

