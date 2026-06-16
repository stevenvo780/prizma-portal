import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "prizma-ui";
import "prizma-ui/styles.css";
import { SessionProvider } from "./session";
import { App } from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <SessionProvider>
        <App />
      </SessionProvider>
    </ThemeProvider>
  </React.StrictMode>
);
