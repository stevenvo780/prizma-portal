import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "prizma-ui";
import "prizma-ui/styles.css";
import { SessionProvider } from "./session";
import { App } from "./App";
import { Landing } from "./Landing";

/**
 * Enrutado del Portal Prizma:
 *   /        → Landing pública de captación de clientes (sin datos mock).
 *   /demo    → Cockpit de demostración (app-launcher + salud + admin), con
 *              banner "DEMO — datos de ejemplo".
 *   /demo?gallery, /demo?view=… → deep-links del cockpit (los gestiona <App/>).
 *
 * La SPA necesita el rewrite a index.html en vercel.json para que /demo y
 * cualquier ruta cliente resuelvan al cargar directo (deep-link / refresh).
 */
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/demo"
            element={
              <SessionProvider>
                <App />
              </SessionProvider>
            }
          />
          {/* Cualquier otra ruta cae a la landing pública. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);
