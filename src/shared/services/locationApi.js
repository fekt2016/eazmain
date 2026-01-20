import api from './api';

/**
 * Location API Service
 * Handles GPS location and digital address conversion
 */
const locationApi = {
  /**
   * Convert GPS coordinates to GhanaPostGPS digital address
   * GET /api/v1/location/convert-coordinates?lat=...&lng=...
   */
  convertCoordinatesToDigitalAddress: async (lat, lng) => {
    const response = await api.get('/location/convert-coordinates', {
      params: { lat, lng },
    });
    return response.data;
  },

  /**
   * Reverse geocode GPS coordinates to physical address
   * POST /api/v1/location/reverse-geocode
   * Body: { lat, lng }
   */
  reverseGeocode: async (lat, lng) => {
    const response = await api.post('/location/reverse-geocode', {
      lat,
      lng,
    });
    return response.data;
  },

  /**
   * Lookup full address details from GhanaPostGPS digital address
   * POST /api/v1/location/lookup-digital-address
   */
  lookupDigitalAddressFull: async (digitalAddress) => {
    const response = await api.post('/location/lookup-digital-address', {
      digitalAddress,
    });
    return response.data;
  },

  /**
   * Hybrid location lookup using GPS coordinates
   * Combines GhanaPostGPS and Google Maps for accurate address resolution
   * GET /api/v1/location/hybrid-lookup?lat=...&lng=...
   */
  hybridLocationLookup: async (lat, lng) => {
    const response = await api.get('/location/hybrid-lookup', {
      params: { lat, lng },
    });
    return response.data;
  },
};

export default locationApi;

