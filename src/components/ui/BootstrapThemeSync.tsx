"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setTheme, ThemeMode } from "@/features/settings/settingsSlice";

const STORAGE_KEY = "colai_theme";

export function BootstrapThemeSync() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((s) => s.settings.theme);

  useEffect(() => {
    // Initialize from localStorage or system preference
    const stored = (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)) as ThemeMode | null;
    if (stored === "light" || stored === "dark") {
      dispatch(setTheme(stored));
      return;
    }

    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
    dispatch(setTheme(prefersDark ? "dark" : "light"));
  }, [dispatch]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-bs-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return null;
}
