import { jwtDecode } from "jwt-decode";
import logger from './logger';

export const formatCurrency = (value, currency = "USD") =>
  new Intl.NumberFormat("en", { style: "currency", currency: currency }).format(
    value
  );

export function formatDate(dateStr) {
  const date = new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));

  return date;
}

export const randomOrderId = () => {
  const seq = (Math.floor(Math.random() * 100000) + 100000)
    .toString()
    .substring(1);
  const orderId = `EW${seq}`;
  return orderId;
};

export function formatTime(date) {
  const at = Number(new Date(date));
  const dateNow = Number(new Date());

  const calcDayspassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDayspassed(dateNow, at);

  if (daysPassed === 0) return "Today";
  if (daysPassed === 1) return "Yesterday";
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  // else {
  // 	// const now = new Date(date);
  // 	// const day = `${now.getDate()}`.padStart(2, 0);
  // 	// const month = `${now.getMonth() + 1}`.padStart(2, 0);
  // 	// const year = now.getFullYear();
  // 	// return `${day}/${month}/${year}`;
  // }
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

/**
 * Extract role from a JWT token string
 * 
 * @param {string} token - JWT token string (not from localStorage)
 * @returns {string} - User role or empty string
 * 
 * @deprecated This function is deprecated. Use useAuth hook instead:
 * ```jsx
 * import useAuth from './hooks/useAuth';
 * const { userData } = useAuth();
 * const role = userData?.data?.data?.role || userData?.data?.user?.role;
 * ```
 * 
 * SECURITY: This function does not access localStorage.
 * It only decodes a token string if provided as a parameter.
 * With cookie-based auth, tokens are not accessible from JavaScript.
 */
export function returnRole(token) {
  // SECURITY: This function no longer accesses localStorage.
  // It only decodes a token string if provided as parameter.
  // With cookie-based auth, tokens are in httpOnly cookies and not accessible from JS.
  
  if (!token || typeof token !== 'string') {
    return "";
  }
  
  try {
    const decodeToken = jwtDecode(token);
    const expireTime = new Date(decodeToken.exp) * 1000;
    
    if (import.meta.env.DEV) {
      logger.log("expireTime", expireTime);
    }

    if (new Date(Date.now()) > expireTime) {
      // Token is expired - but we don't remove from localStorage (we don't use it)
      return "";
    } else {
      return decodeToken.role;
    }
  } catch (error) {
    logger.error("Error decoding token in returnRole:", error);
    return "";
  }
}

export const generateSKU = ({ user, variants, category }) => {
  logger.log("Category for SKU:", category);
  const cate = category.slice(0, 3).toUpperCase();
  // Ensure we have valid values for all required fields
  if (!user?.id || !category || !variants) {
    logger.error("Missing required fields for SKU generation:", {
      user,
      category,
      variants,
    });
    return `ERR-${Date.now().toString().slice(-4)}`;
  }

  // Clean and format the variant string
  const variantString = Object.entries(variants)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
    .map(([, value]) => String(value).trim())
    .join("-")
    .replace(/\s+/g, "")
    .substring(0, 3)
    .toUpperCase();

  // Generate a more robust SKU format
  const userId = user.id.slice(-3);
  // const categoryCode = category.slice(0, 3).toUpperCase();
  const timestamp = Date.now().toString().slice(-4);

  return `${userId}-${cate}-${variantString || "DEF"}-${timestamp}`;
};

export const getParentName = (parentId, categories) => {
  if (!parentId) return "None";
  const parent = categories.find((cat) => cat._id === parentId);
  return parent ? parent.name : "Unknown";
};

// utils/phoneValidation.js
const networks = {
  MTN: ["24", "54", "55", "59", "50"],
  Telecel: ["27", "57", "28", "20"],
  AirtelTigo: ["26", "56", "23"],
};

export const validateGhanaPhone = (phone) => {
  const cleanedPhone = phone.replace(/\D/g, "");
  logger.log("cleanedPhone", cleanedPhone);

  // Validate length
  if (cleanedPhone.length < 10 || cleanedPhone.length > 12) {
    return { valid: false, message: "Number must be 10 digits" };
  }

  // Handle both local (0xx) and intl (233xx) formats
  let localNumber = cleanedPhone;

  if (cleanedPhone.startsWith("233")) {
    localNumber = "0" + cleanedPhone.substring(3);
  }

  // Validate Ghanaian format
  if (!/^0(24|54|55|59|20|50|27|57|26|56|23|28|57)\d{7}$/.test(localNumber)) {
    return { valid: false, message: "Invalid Ghanaian number format" };
  }

  // Extract prefix
  const prefix = localNumber.substring(1, 3);

  // Identify network
  let network = "";
  for (const [net, prefixes] of Object.entries(networks)) {
    if (prefixes.includes(prefix)) {
      network = net;
      break;
    }
  }

  if (!network) {
    return { valid: false, message: "Unsupported network provider" };
  }

  // Format to E.164 standard
  const formattedPhone = `+233${localNumber.substring(1)}`;

  return {
    valid: true,
    formatted: formattedPhone,
    network,
  };
};
export const validateGhanaPhoneNumberOnly = (phone) => {
  // Remove all non-digit characters except leading '+'
  const cleanedPhone = phone.replace(/\D/g, "");

  // Check for valid Ghana formats:
  // 1. Local format: 0XXXXXXXXX (10 digits)
  // 2. International format: 233XXXXXXXXX (12 digits)
  // 3. International format with +: +233XXXXXXXXX (13 characters including '+')
  const localRegex = /^0\d{9}$/; // 0 followed by 9 digits
  const intlRegex = /^233\d{9}$/; // 233 followed by 9 digits
  const intlPlusRegex = /^\+233\d{9}$/; // +233 followed by 9 digits

  if (
    !localRegex.test(cleanedPhone) &&
    !intlRegex.test(cleanedPhone) &&
    !intlPlusRegex.test(phone)
  ) {
    return "Please enter a valid Ghana phone number";
  }

  return "";
};
