/**
 * Warehouse Configuration (Frontend)
 * FIXED EazShop HQ Location - This matches the backend warehouse location
 * 
 * IMPORTANT: This warehouse location is FIXED and NEVER changes.
 * All distance calculations use this location as the origin point.
 * Only the customer's destination address is geocoded.
 * 
 * Address: HRH2+R22, Al-Waleed bin Talal Highway, Accra, Ghana
 * Coordinates: lat: 5.582930, lng: -0.171870
 */

// Fixed warehouse location - EazShop HQ
// This must match the backend WAREHOUSE_LOCATION
export const WAREHOUSE_LOCATION = {
  lat: 5.582930, // EazShop HQ latitude
  lng: -0.171870, // EazShop HQ longitude
  address: 'HRH2+R22, Al-Waleed bin Talal Highway, Accra, Ghana',
};

