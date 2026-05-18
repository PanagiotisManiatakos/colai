"use client";

import { useEffect } from "react";

function setPwaAttr() {
  const standalone =
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.matchMedia?.("(display-mode: fullscreen)")?.matches ||
    (window.navigator as Navigator & { standalone?: boolean })?.standalone === true;

  document.documentElement.setAttribute("data-pwa", standalone ? "true" : "false");
}

/** Standalone/PWA display-mode styling only (no install prompts — app is on App Store / Play Store). */
export function ViewportRuntime() {
  useEffect(() => {
    setPwaAttr();

    const mq = window.matchMedia("(display-mode: standalone)");
    const onDisplayModeChange = () => setPwaAttr();
    mq.addEventListener("change", onDisplayModeChange);

    return () => mq.removeEventListener("change", onDisplayModeChange);
  }, []);

  return null;
}
