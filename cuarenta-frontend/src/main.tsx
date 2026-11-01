import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { loadLang } from "./storage";
import "./styles.css";

document.documentElement.lang = loadLang();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
