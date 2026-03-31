/**
 * Order status badge colors aligned with admin (eazadmin) order UI.
 * Background + text for high contrast on light surfaces.
 */
export const ORDER_STATUS_BADGE_COLORS = {
  pending_payment: { bg: '#fef3c7', color: '#b45309' },
  payment_completed: { bg: '#e0f2fe', color: '#0369a1' },
  processing: { bg: '#e0f2fe', color: '#0369a1' },
  preparing: { bg: '#e0f2fe', color: '#0369a1' },
  ready_for_dispatch: { bg: '#e0f2fe', color: '#0369a1' },
  confirmed: { bg: '#f3e8ff', color: '#7e22ce' },
  out_for_delivery: { bg: '#fce7f3', color: '#be185d' },
  /** Buyer coarse label "Shipped" — same as admin out-for-delivery */
  shipped: { bg: '#fce7f3', color: '#be185d' },
  delivery_attempted: { bg: '#ffe4e6', color: '#be123c' },
  delivered: { bg: '#dcfce7', color: '#15803d' },
  completed: { bg: '#dcfce7', color: '#15803d' },
  cancelled: { bg: '#fee2e2', color: '#b91c1c' },
  refunded: { bg: '#e2e8f0', color: '#475569' },
  /** Legacy list/detail badge bucket */
  paid: { bg: '#dcfce7', color: '#15803d' },
};

/**
 * @param {string} statusKey
 * @returns {{ bg: string, color: string }}
 */
export function getOrderBadgeColors(statusKey) {
  const k = (statusKey || 'pending_payment').toString().toLowerCase();
  return ORDER_STATUS_BADGE_COLORS[k] || ORDER_STATUS_BADGE_COLORS.pending_payment;
}

/**
 * Map an order document to a palette key (matches admin normalization intent).
 * @param {object|null} order
 * @returns {string}
 */
export function getOrderStatusColorKey(order) {
  if (!order) return 'pending_payment';

  const payment = (order.paymentStatus || '').toString().toLowerCase();
  const current = (order.currentStatus || '').toString().toLowerCase();
  const status = (order.status || '').toString().toLowerCase();
  const orderStatus = (order.orderStatus || '').toString().toLowerCase();

  const raw = current || orderStatus || status;
  const isPaid =
    payment === 'paid' ||
    payment === 'completed' ||
    order.isPaid === true ||
    !!order.paidAt;

  if (raw === 'delivered' || status === 'completed' || orderStatus === 'completed') {
    return 'delivered';
  }

  if (raw === 'cancelled' || status === 'cancelled' || orderStatus === 'cancelled') {
    if (isPaid) return 'confirmed';
    return 'cancelled';
  }

  if (raw === 'refunded' || raw === 'partial_refund') return 'refunded';
  if (raw === 'delivery_attempted') return 'delivery_attempted';

  if (
    raw === 'out_for_delivery' ||
    raw === 'shipped' ||
    raw === 'partially_shipped'
  ) {
    return 'out_for_delivery';
  }

  if (raw === 'confirmed') return 'confirmed';

  if (['processing', 'preparing', 'ready_for_dispatch'].includes(raw)) {
    return 'processing';
  }

  const processingLike = new Set([
    'supplier_confirmed',
    'awaiting_dispatch',
    'international_shipped',
    'customs_clearance',
    'arrived_destination',
    'local_dispatch',
  ]);
  if (processingLike.has(raw)) return 'processing';

  if (raw === 'payment_completed') return 'payment_completed';
  if (raw === 'pending_payment') return 'pending_payment';

  if (!raw) {
    return isPaid ? 'processing' : 'pending_payment';
  }

  if (!isPaid && (raw === 'pending' || raw === 'failed')) {
    return 'pending_payment';
  }

  if (isPaid && raw === 'pending') {
    return 'processing';
  }

  return 'pending_payment';
}
