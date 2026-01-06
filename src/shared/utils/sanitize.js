/**
 * Input sanitization utilities for security
 * Prevents XSS attacks and injection vulnerabilities
 * 
 * NOTE: For production, consider installing DOMPurify for more robust XSS protection:
 * npm install dompurify
 * import DOMPurify from 'dompurify';
 */

// SECURITY: Basic HTML tag removal (for simple cases)
// For production, replace with DOMPurify.sanitize() for better protection
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove HTML tags and script content
  return input.replace(/<[^>]*>/g, '')
              .replace(/javascript:/gi, '')
              .replace(/on\w+\s*=/gi, '')
              .trim();
};

// SECURITY: Sanitize coupon code (alphanumeric only, uppercase)
export const sanitizeCouponCode = (code) => {
  if (typeof code !== 'string') return '';
  
  return code.trim()
             .toUpperCase()
             .replace(/[^A-Z0-9]/g, '')
             .substring(0, 50); // Max length
};

// SECURITY: Sanitize email (removes dangerous content, but allows incomplete emails while typing)
export const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return '';
  
  // Only sanitize dangerous content, don't validate format (validation happens on submit)
  const sanitized = email
                         .replace(/<[^>]*>/g, '') // Remove HTML tags
                         .replace(/javascript:/gi, '') // Remove javascript: protocol
                         .replace(/on\w+\s*=/gi, '') // Remove event handlers
                         .substring(0, 255); // Max email length
  
  // Don't trim or convert to lowercase while typing - let user type freely
  // Don't validate format - that happens on form submission
  return sanitized;
};

// SECURITY: Sanitize phone number (digits only)
export const sanitizePhone = (phone) => {
  if (typeof phone !== 'string') return '';
  
  return phone.replace(/\D/g, '')
              .substring(0, 15); // Max phone length
};

// SECURITY: Sanitize text input (remove HTML, limit length)
export const sanitizeText = (text, maxLength = 1000) => {
  if (typeof text !== 'string') return '';
  
  return text.replace(/<[^>]*>/g, '')
             .replace(/javascript:/gi, '')
             .replace(/on\w+\s*=/gi, '')
             .trim()
             .substring(0, maxLength);
};

// SECURITY: Sanitize numeric input
export const sanitizeNumber = (value, min = 0, max = Number.MAX_SAFE_INTEGER) => {
  const num = parseFloat(value);
  if (isNaN(num)) return min;
  
  return Math.max(min, Math.min(max, num));
};

// SECURITY: Sanitize integer input
export const sanitizeInteger = (value, min = 0, max = Number.MAX_SAFE_INTEGER) => {
  const num = parseInt(value, 10);
  if (isNaN(num)) return min;
  
  return Math.max(min, Math.min(max, num));
};

// SECURITY: Validate and sanitize address input
export const sanitizeAddress = (address) => {
  if (typeof address !== 'string') return '';
  
  return address.replace(/<[^>]*>/g, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '')
                .trim()
                .substring(0, 500); // Max address length
};

// SECURITY: Validate quantity (must be positive integer)
export const validateQuantity = (value, maxStock = 999) => {
  const quantity = sanitizeInteger(value, 1, maxStock);
  return quantity > 0 && quantity <= maxStock ? quantity : 1;
};

// SECURITY: Sanitize name input (letters, spaces, hyphens, apostrophes only)
export const sanitizeName = (name) => {
  if (typeof name !== 'string') return '';
  
  return name.replace(/<[^>]*>/g, '')
              .replace(/[^a-zA-Z\s\-']/g, '')
              .trim()
              .substring(0, 100); // Max name length
};

// SECURITY: Sanitize URL input (basic validation)
export const sanitizeUrl = (url) => {
  if (typeof url !== 'string') return '';
  
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return '';
    }
    return url.substring(0, 2048); // Max URL length
  } catch {
    return '';
  }
};

// SECURITY: Sanitize digital address (Ghana postal code format: XX-XXXX-XXXX)
export const sanitizeDigitalAddress = (address) => {
  if (typeof address !== 'string') return '';
  
  // Remove all non-alphanumeric characters, then format
  const cleaned = address.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  return cleaned.substring(0, 9); // Max 9 characters for Ghana digital address
};
