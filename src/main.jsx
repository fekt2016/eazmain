import React from "react";
import ReactDOM from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.jsx";

// import { GlobalStyles } from './shared/styles/GlobalStyles';

// Suppress noisy Google GSI FedCM AbortError (harmless; from their script)
if (typeof window !== "undefined" && import.meta.env.DEV) {
  const origError = console.error;
  console.error = (...args) => {
    const msg = args[0] != null ? String(args[0]) : "";
    if (msg.includes("[GSI_LOGGER]") && msg.includes("FedCM") && msg.includes("AbortError")) return;
    origError.apply(console, args);
  };
}

// Polyfill for __DEV__ in Vite-based React apps
// In Vite, use import.meta.env.DEV, but some libraries expect __DEV__
if (typeof window !== "undefined" && typeof window.__DEV__ === "undefined") {
  window.__DEV__ = import.meta.env.DEV;
}
// Also set it globally for compatibility
if (typeof globalThis !== "undefined" && typeof globalThis.__DEV__ === "undefined") {
  globalThis.__DEV__ = import.meta.env.DEV;
}

// IMPORTANT: App must NOT be lazy loaded to ensure React Router is initialized
// immediately when Paystack redirects, otherwise routes won't match
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={clientId}>
    <App />
  </GoogleOAuthProvider>
);
