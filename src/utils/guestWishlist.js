export const generateSessionId = () => {
  let sessionId = localStorage.getItem("guestSessionId");

  if (!sessionId) {
    sessionId = `guest_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    localStorage.setItem("guestSessionId", sessionId);
  }

  return sessionId;
};

// Get session ID
export const getSessionId = () => {
  return localStorage.getItem("guestSessionId");
};

// Clear session ID (after login and sync)
export const clearSessionId = () => {
  localStorage.removeItem("guestSessionId");
};
