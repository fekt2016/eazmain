import api from './api';

export const shippingRateService = {
  // Calculate shipping fee using the new ShippingRate system
  // POST /api/v1/shipping-rates/calculate
  // 
  // IMPORTANT: Origin is always the fixed warehouse location (backend handles this).
  // Frontend should only pass destination coordinates or destinationAddress.
  // Supports both old format (weight, shippingType, zone) and new format (destination, destinationAddress, weight, type)
  calculateFee: async ({ weight, shippingType, zone, destination, destinationAddress, type, distanceKm, fragile, orderTime }) => {
    const payload = {
      weight,
    };

    // Use new distance-based format if destination provided
    // NOTE: Origin is always the fixed warehouse - backend uses WAREHOUSE_LOCATION
    if (destination || destinationAddress) {
      if (destination) {
        payload.destination = destination; // { lat, lng }
      }
      if (destinationAddress) {
        payload.destinationAddress = destinationAddress; // Address string for geocoding
      }
      payload.type = type || shippingType || 'standard';
    } else if (distanceKm !== undefined) {
      payload.distanceKm = distanceKm;
      payload.type = type || shippingType || 'standard';
    } else {
      // Old zone-based format (backward compatibility)
      payload.shippingType = shippingType || type || 'standard';
      payload.zone = zone;
    }

    // Add surcharge parameters
    if (fragile !== undefined) payload.fragile = fragile;
    if (orderTime) payload.orderTime = orderTime;

    const response = await api.post('/shipping-rates/calculate', payload);
    return response.data;
  },
};

