"use client";

import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";

function setPwaAttr() {
  const standalone =
    window.matchMedia?.("(display-mode: standalone)")?.matches ||
    window.matchMedia?.("(display-mode: fullscreen)")?.matches ||
    (window.navigator as Navigator & { standalone?: boolean })?.standalone ===
      true;

  document.documentElement.setAttribute(
    "data-pwa",
    standalone ? "true" : "false",
  );
}

function setNativeAttrs() {
  const native = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform();

  document.documentElement.setAttribute(
    "data-native",
    native ? "true" : "false",
  );
  document.documentElement.setAttribute("data-platform", platform);
}

export function ViewportRuntime() {
  useEffect(() => {
    setPwaAttr();
    setNativeAttrs();

    const mq = window.matchMedia("(display-mode: standalone)");
    const onDisplayModeChange = () => setPwaAttr();
    mq.addEventListener("change", onDisplayModeChange);

    return () => mq.removeEventListener("change", onDisplayModeChange);
  }, []);

  return null;
}
