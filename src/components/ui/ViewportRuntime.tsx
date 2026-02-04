"use client";

import { useEffect } from "react";

function setViewportHeightVar() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
}

function setPwaAttr() {
  const standalone =
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.matchMedia?.("(display-mode: fullscreen)")?.matches ||
    (window.navigator as any)?.standalone === true;

  document.documentElement.setAttribute("data-pwa", standalone ? "true" : "false");
}

export function ViewportRuntime() {
  useEffect(() => {
    setViewportHeightVar();
    setPwaAttr();

    const onResize = () => {
      setViewportHeightVar();
      setPwaAttr();
    };

    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("orientationchange", onResize, { passive: true });

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  return null;
}
