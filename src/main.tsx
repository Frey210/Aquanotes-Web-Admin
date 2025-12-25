import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { Providers } from "@/app/Providers";
import App from "@/app/App";
import "@/styles/globals.css";
import { Toaster } from "sonner";
import { ErrorFallback } from "@/components/layout/ErrorFallback";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Providers>
      <BrowserRouter>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <App />
          <Toaster richColors position="top-right" />
        </ErrorBoundary>
      </BrowserRouter>
    </Providers>
  </React.StrictMode>
);
