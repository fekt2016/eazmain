/**
 * SECURITY: Session ID utility for guest features only
 * NOTE: This is NOT for authentication - auth uses httpOnly cookies
 * This sessionId is only for guest wishlist, cart, and analytics tracking
 * It's stored in sessionStorage (not localStorage) to reduce XSS risk
 * Session IDs should NOT be used for authentication or sensitive operations
 */
export const getOrCreateSessionId = () => {
  // SECURITY: Use sessionStorage (not localStorage) for guest session ID
  // This is only for guest features (wishlist, cart, analytics)
  // Authentication uses httpOnly cookies managed by backend
  let sessionId = sessionStorage.getItem("guestSessionId");

  if (!sessionId) {
    // Fallback for SSR/SSG environments
    if (typeof crypto !== "undefined") {
      sessionId = crypto.randomUUID();
    } else {
      // Simple fallback for non-browser environments
      sessionId = `guest_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
    }
    sessionStorage.setItem("guestSessionId", sessionId);
  }

  return sessionId;
};
