import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ToastProvider } from "./context/ToastContext";
import { SignLanguageProvider } from "./context/SignLanguageContext";
import { ErrorBoundary } from "./components/ErrorBoundary";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <SignLanguageProvider>
          <App />
        </SignLanguageProvider>
      </ToastProvider>
    </ErrorBoundary>
  </StrictMode>,
);
