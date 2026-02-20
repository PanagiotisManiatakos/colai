"use client";

import { useEffect } from "react";
import PwaInstallTopBanner from "./PwaInstallTopBanner";

function getViewportHeight() {
  return window.visualViewport?.height ?? window.innerHeight;
}

function setViewportHeightVar() {
  const vh = getViewportHeight() * 0.01;
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
    const update = () => {
      setViewportHeightVar();
      setPwaAttr();
    };

    update();

    window.addEventListener("resize", update, { passive: true });
    window.addEventListener("orientationchange", update, { passive: true });

    const vv = window.visualViewport;
    vv?.addEventListener("resize", update, { passive: true } as any);
    vv?.addEventListener("scroll", update, { passive: true } as any);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      vv?.removeEventListener("resize", update as any);
      vv?.removeEventListener("scroll", update as any);
    };
  }, []);

  return <PwaInstallTopBanner />;
}
