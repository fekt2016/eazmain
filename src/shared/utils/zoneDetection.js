/**
 * Zone Detection Utility
 * Determines shipping zone based on region and city
 */

/**
 * Detect shipping zone from region and city
 * @param {String} region - Region name (e.g., "Greater Accra", "Ashanti")
 * @param {String} city - City name (e.g., "Accra", "Tema", "Kumasi")
 * @returns {String} Zone ID ('A', 'B', or 'C')
 */
export function detectZone(region, city) {
  const normalizedRegion = region ? region.toLowerCase().trim() : '';
  const normalizedCity = city ? city.toLowerCase().trim() : '';

  // If we have a city but no region, try to infer from city
  if (!normalizedRegion && normalizedCity) {
    if (normalizedCity === 'accra' || normalizedCity === 'tema') {
      return 'A'; // Accra/Tema cities are typically Zone A
    }
    return 'C'; // Default to Zone C for unknown cities
  }

  // Zone A: Greater Accra region AND (Accra or Tema city)
  if (
    normalizedRegion.includes('greater accra') ||
    normalizedRegion === 'greater accra' ||
    normalizedRegion === 'accra'
  ) {
    if (normalizedCity === 'accra' || normalizedCity === 'tema') {
      return 'A';
    }
    // Zone B: Greater Accra region but not Accra/Tema core
    return 'B';
  }

  // Zone C: All other regions or if no region provided
  return 'C';
}

