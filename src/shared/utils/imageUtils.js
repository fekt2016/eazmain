/**
 * Image utility functions for handling image loading errors and fallbacks
 */

/**
 * Default fallback image - using a data URI to avoid external dependencies
 * This is a simple 1x1 transparent PNG that will be replaced by CSS or a better fallback
 */
const DEFAULT_FALLBACK_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="600" height="600"%3E%3Crect width="600" height="600" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="24" fill="%23999" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';

/**
 * Product placeholder image - can be replaced with a local image file
 */
const PRODUCT_PLACEHOLDER = '/img/products/placeholder.png';

/**
 * User avatar placeholder
 */
const AVATAR_PLACEHOLDER = '/img/users/default.jpg';

/**
 * Handle image load error with fallback
 * @param {Event} event - The error event from img onError
 * @param {string} fallback - Optional custom fallback image URL
 * @returns {void}
 */
export const handleImageError = (event, fallback = null) => {
  const img = event.target;
  
  // Prevent infinite loop if fallback also fails
  if (img.dataset.fallbackAttempted === 'true') {
    img.src = DEFAULT_FALLBACK_IMAGE;
    return;
  }
  
  // Try custom fallback first, then default
  const fallbackImage = fallback || PRODUCT_PLACEHOLDER || DEFAULT_FALLBACK_IMAGE;
  
  // Mark that we've attempted fallback
  img.dataset.fallbackAttempted = 'true';
  
  // Set fallback image
  img.src = fallbackImage;
  
  // If fallback also fails, use data URI
  img.onerror = () => {
    img.src = DEFAULT_FALLBACK_IMAGE;
  };
};

/**
 * Get product image with fallback handling
 * @param {string} imageUrl - The product image URL
 * @param {string} fallback - Optional custom fallback
 * @returns {string} - Image URL or fallback
 */
export const getProductImage = (imageUrl, fallback = null) => {
  if (!imageUrl) {
    return fallback || PRODUCT_PLACEHOLDER || DEFAULT_FALLBACK_IMAGE;
  }
  
  // If it's a placeholder.com URL and might fail, return fallback immediately
  if (imageUrl.includes('via.placeholder.com') || imageUrl.includes('placeholder.com')) {
    return fallback || PRODUCT_PLACEHOLDER || DEFAULT_FALLBACK_IMAGE;
  }
  
  return imageUrl;
};

/**
 * Get avatar image with fallback
 * @param {string} avatarUrl - The avatar URL
 * @returns {string} - Avatar URL or fallback
 */
export const getAvatarImage = (avatarUrl) => {
  if (!avatarUrl) {
    return AVATAR_PLACEHOLDER;
  }
  
  return avatarUrl;
};

/**
 * Create an image error handler for React components
 * @param {string} fallback - Optional custom fallback image URL
 * @returns {Function} - Error handler function
 */
export const createImageErrorHandler = (fallback = null) => {
  return (event) => handleImageError(event, fallback);
};

export default {
  handleImageError,
  getProductImage,
  getAvatarImage,
  createImageErrorHandler,
  DEFAULT_FALLBACK_IMAGE,
  PRODUCT_PLACEHOLDER,
  AVATAR_PLACEHOLDER,
};

