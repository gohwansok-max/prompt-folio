import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

// PWA install support -- production only, so dev never has to think about stale
// service-worker caches fighting Vite's own HMR.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      // Installability just degrades to "no offline shell" -- nothing else depends on this.
    });
  });
}
