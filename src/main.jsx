import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// import { GlobalStyles } from './shared/styles/GlobalStyles';

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
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
