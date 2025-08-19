export const getOrCreateSessionId = () => {
  // Use sessionStorage instead of localStorage
  let sessionId = sessionStorage.getItem("sessionId");

  if (!sessionId) {
    // Fallback for SSR/SSG environments
    if (typeof crypto !== "undefined") {
      sessionId = crypto.randomUUID();
    } else {
      // Simple fallback for non-browser environments
      sessionId = `temp-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
    }
    sessionStorage.setItem("sessionId", sessionId);
  }

  return sessionId;
};
