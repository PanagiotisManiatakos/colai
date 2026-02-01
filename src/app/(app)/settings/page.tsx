"use client";

import { toggleTheme } from "@/features/settings/settingsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((s) => s.settings.theme);

  return (
    <div>
      <div className="app-card p-4 mb-3">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <div className="fw-semibold">Theme</div>
            <div className="text-secondary small">Light / Dark</div>
          </div>
          <button
            type="button"
            className="btn btn-outline-primary app-pill"
            onClick={() => dispatch(toggleTheme())}
          >
            <i className={`bi ${theme === "dark" ? "bi-sun" : "bi-moon"} me-2`} />
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>
      </div>

      <div className="app-card p-4 mb-3">
        <div className="fw-semibold mb-2">Install</div>
        <div className="text-secondary small">
          Android/Chrome: menu → <span className="fw-semibold">Install app</span>. 
          iPhone/Safari: Share → <span className="fw-semibold">Add to Home Screen</span>.
        </div>
      </div>

      <div className="app-card p-4">
        <div className="fw-semibold mb-2">About</div>
        <div className="text-secondary small">
          Premium mobile-first PWA shell with Bootstrap and Redux Toolkit.
        </div>
      </div>
    </div>
  );
}
