import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// import { GlobalStyles } from './shared/styles/GlobalStyles';

// IMPORTANT: App must NOT be lazy loaded to ensure React Router is initialized
// immediately when Paystack redirects, otherwise routes won't match
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
