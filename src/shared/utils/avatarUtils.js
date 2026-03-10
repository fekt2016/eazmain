import { getOptimizedImageUrl, IMAGE_SLOTS } from './cloudinaryConfig';

/**
 * Constructs the full URL for a user avatar/photo
 * Handles both full URLs (Cloudinary) and local filenames
 * 
 * @param {string} photo - The photo field from user object (can be URL or filename)
 * @returns {string} - The full URL to the avatar image
 */
export const getAvatarUrl = (photo) => {
  if (!photo) {
    return "/img/users/default.jpg";
  }

  return getOptimizedImageUrl(photo, IMAGE_SLOTS.AVATAR);
};

/**
 * Gets the avatar URL with fallback handling
 * @param {string} photo - The photo field from user object
 * @param {string} fallback - Fallback URL (default: "/img/users/default.jpg")
 * @returns {string} - The full URL to the avatar image
 */
export const getAvatarUrlWithFallback = (photo, fallback = "/img/users/default.jpg") => {
  return photo ? getAvatarUrl(photo) : fallback;
};

