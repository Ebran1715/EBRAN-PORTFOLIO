import { initInteractions } from "./interactions.js";

let initialized = false;

function initializeApp() {
  if (initialized) return;
  initialized = true;
  initInteractions();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp, { once: true });
} else {
  initializeApp();
}
