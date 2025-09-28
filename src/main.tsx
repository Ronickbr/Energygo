import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary"; // Importar ErrorBoundary
import React from "react"; // Importar React para usar <React.StrictMode>

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);