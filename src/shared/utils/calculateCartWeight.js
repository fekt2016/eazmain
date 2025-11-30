/**
 * Calculate total weight of cart items
 * @param {Array} items - Cart items with product and quantity
 * @returns {Number} Total weight in kg
 */
export const calculateCartWeight = (items) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return 0.5; // Default minimum weight
  }

  let totalWeight = 0;

  items.forEach((item) => {
    // Get weight from product (in kg)
    const productWeight = item.product?.weight || item.product?.shippingWeight || 0.5; // Default 0.5kg per item
    const quantity = item.quantity || 1;
    totalWeight += productWeight * quantity;
  });

  // Return minimum 0.5kg if calculated weight is too low
  return Math.max(0.5, totalWeight);
};

