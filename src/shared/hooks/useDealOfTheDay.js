import { useMemo } from 'react';
import {
  getProductDisplayPrice,
  getProductDiscountPercentage,
  hasProductDiscount,
  getProductImages,
} from '../utils/productHelpers';

/**
 * Returns end of current day (23:59:59.999) in local time for "deal of the day" countdown.
 * Used when the selected deal has no promotion end date.
 */
export function getEndOfDay() {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return end;
}

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

/**
 * Gets promotion end date from a product (availability.endDate or promotionEndDate).
 * @param {Object} product
 * @returns {Date|null}
 */
function getPromotionEndDate(product) {
  const end = product?.availability?.endDate || product?.promotionEndDate;
  if (!end) return null;
  const date = new Date(end);
  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * Picks the single "deal of the day" product from a list:
 * - Only products with promotionKey set are considered
 * - Prefer products with a promotion end date (availability.endDate) that expires in ~24 hours:
 *   choose the one whose time-to-expiry is closest to 24 hours (and not expired)
 * - If none have an end date or all are expired, fall back to lowest price among promotionKey products
 * @param {Array} products - Full product list (e.g. from homepage)
 * @returns {{ dealProduct: object | null, endDate: Date }} endDate is promotion end or end of day
 */
export function useDealOfTheDay(products) {
  const endOfDay = useMemo(() => getEndOfDay(), []);

  const result = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) {
      return { dealProduct: null, dealProducts: [], endDate: endOfDay };
    }

    const dealCandidates = products.filter((p) => {
      const hasPromotionKey =
        p?.promotionKey && String(p.promotionKey).trim() !== '';
      const hasDiscount = hasProductDiscount(p);
      const hasImageCover =
        typeof p?.imageCover === 'string' && p.imageCover.trim() !== '';
      const hasAnyImage =
        hasImageCover || (getProductImages(p) || []).length > 0;

      // Only consider products that (a) are promo/discounted AND (b) have at least one image to show
      return (hasPromotionKey || hasDiscount) && hasAnyImage;
    });
    if (dealCandidates.length === 0) {
      return { dealProduct: null, dealProducts: [], endDate: endOfDay };
    }

    const uniqueById = [];
    const seen = new Set();
    dealCandidates.forEach((product) => {
      const id = String(product?._id || product?.id || '');
      if (!id || seen.has(id)) return;
      seen.add(id);
      uniqueById.push(product);
    });

    const now = Date.now();

    const withMeta = uniqueById.map((product) => {
      const endDate = getPromotionEndDate(product);
      const hoursToExpiry = endDate
        ? (endDate.getTime() - now) / (1000 * 60 * 60)
        : null;
      const discount = getProductDiscountPercentage(product) || 0;
      const price = getProductDisplayPrice(product) ?? Infinity;
      return {
        product,
        endDate,
        hoursToExpiry,
        discount,
        price,
      };
    });

    const withActiveEndDate = withMeta
      .filter((item) => item.endDate && (item.hoursToExpiry || 0) > 0)
      .sort((a, b) => {
        const diffA = Math.abs((a.hoursToExpiry || 0) - 24);
        const diffB = Math.abs((b.hoursToExpiry || 0) - 24);
        if (diffA !== diffB) return diffA - diffB;
        if (b.discount !== a.discount) return b.discount - a.discount;
        return a.price - b.price;
      });

    const withoutActiveEndDate = withMeta
      .filter((item) => !item.endDate || (item.hoursToExpiry || 0) <= 0)
      .sort((a, b) => {
        if (b.discount !== a.discount) return b.discount - a.discount;
        return a.price - b.price;
      });

    const mergedDeals = [...withActiveEndDate, ...withoutActiveEndDate]
      .slice(0, 8)
      .map((item) => item.product);

    if (mergedDeals.length === 0) {
      return { dealProduct: null, dealProducts: [], endDate: endOfDay };
    }

    const firstExpiring = withActiveEndDate[0];
    return {
      dealProduct: mergedDeals[0] || null,
      dealProducts: mergedDeals,
      endDate: firstExpiring?.endDate || endOfDay,
    };
  }, [products, endOfDay]);

  return {
    dealProduct: result.dealProduct,
    dealProducts: result.dealProducts,
    endOfDay: result.endDate,
  };
}

export default useDealOfTheDay;
