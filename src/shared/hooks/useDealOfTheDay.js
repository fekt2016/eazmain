import { useMemo } from 'react';
import { getProductDisplayPrice } from '../utils/productHelpers';

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
      return { dealProduct: null, endDate: endOfDay };
    }

    const withPromoKey = products.filter(
      (p) => p.promotionKey && String(p.promotionKey).trim() !== ''
    );
    if (withPromoKey.length === 0) {
      return { dealProduct: null, endDate: endOfDay };
    }

    const now = Date.now();

    const withEndDate = withPromoKey
      .map((p) => {
        const end = getPromotionEndDate(p);
        if (!end) return { product: p, endDate: null, hoursToExpiry: null };
        const hoursToExpiry = (end.getTime() - now) / (1000 * 60 * 60);
        return { product: p, endDate: end, hoursToExpiry };
      })
      .filter((x) => x.endDate != null && x.hoursToExpiry > 0);

    if (withEndDate.length > 0) {
      const closestTo24h = withEndDate.reduce((best, curr) => {
        const bestDiff = Math.abs((best.hoursToExpiry ?? 0) - 24);
        const currDiff = Math.abs((curr.hoursToExpiry ?? 0) - 24);
        return currDiff < bestDiff ? curr : best;
      });
      return {
        dealProduct: closestTo24h.product,
        endDate: closestTo24h.endDate,
      };
    }

    const byLowestPrice = [...withPromoKey].sort((a, b) => {
      const priceA = getProductDisplayPrice(a) ?? Infinity;
      const priceB = getProductDisplayPrice(b) ?? Infinity;
      return priceA - priceB;
    });
    return {
      dealProduct: byLowestPrice[0] || null,
      endDate: endOfDay,
    };
  }, [products, endOfDay]);

  return {
    dealProduct: result.dealProduct,
    endOfDay: result.endDate,
  };
}

export default useDealOfTheDay;
