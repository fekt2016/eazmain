/**
 * @deprecated This function is deprecated and no longer works with cookie-based authentication.
 * 
 * SECURITY: Tokens are now stored in httpOnly cookies, not localStorage.
 * This function cannot access httpOnly cookies from JavaScript.
 * 
 * Use the useAuth hook instead which uses cookie-based authentication:
 * 
 * ```jsx
 * import useAuth from './hooks/useAuth';
 * 
 * const { userData, isLoading } = useAuth();
 * ```
 * 
 * This function now always returns empty string to prevent errors.
 * It is kept for backward compatibility only.
 */
import logger from "./logger";

export const getCurrentUser = async () => {
  // SECURITY: With cookie-based authentication, we cannot access tokens from JavaScript.
  // Tokens are stored in httpOnly cookies which are only accessible by the server.
  // This function is deprecated and should not be used.
  
  if (import.meta.env.DEV) {
    logger.warn(
      "[getCurrentUser] This function is deprecated. " +
      "Use useAuth hook instead for cookie-based authentication."
    );
  }
  
  // Return empty string - use useAuth hook instead
  return "";
};
