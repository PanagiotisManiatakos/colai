"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";

import BottomNav from "@/components/shell/BottomNav";
import ThemeToggleButton from "@/components/shell/ThemeToggleButton";

const TITLE_BY_PATH: Array<{ test: (p: string) => boolean; title: string }> = [
  { test: (p) => p === "/", title: "Αρχική" },
  { test: (p) => p.startsWith("/orders/new"), title: "Νέα παραγγελία" }, // added
  { test: (p) => p.startsWith("/platform/eoppy"), title: "ΕΟΠΥΥ" },
  { test: (p) => p.startsWith("/platform/ektos-eoppy"), title: "Εκτός ΕΟΠΥΥ" },
  { test: (p) => p.startsWith("/orders"), title: "Παραγγελίες" },
  { test: (p) => p.startsWith("/discount-requests"), title: "Αιτήματα" },
  { test: (p) => p.startsWith("/settings"), title: "Ρυθμίσεις" },
  { test: (p) => p.startsWith("/offline"), title: "Offline" },
];

function getTitle(pathname: string): string {
  return TITLE_BY_PATH.find((x) => x.test(pathname))?.title ?? "Colai";
}

function shouldShowBack(pathname: string): boolean {
  return pathname !== "/";
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const title = getTitle(pathname);
  const showBack = shouldShowBack(pathname);

  return (
    <div className="app-viewport">
      <header className="app-header">
        <div className="px-3 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2" style={{ minWidth: 44 }}>
            {showBack ? (
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary app-pill"
                aria-label="Back"
                onClick={() => router.back()}
              >
                <i className="bi bi-chevron-left" />
              </button>
            ) : null}
          </div>

          <div className="text-center flex-grow-1">
            <div className="fw-semibold" style={{ letterSpacing: "-0.01em" }}>
              {title}
            </div>
          </div>

          <div className="d-flex align-items-center justify-content-end" style={{ minWidth: 44 }}>
            <ThemeToggleButton />
          </div>
        </div>
      </header>

      <main className="app-content">{children}</main>
      <BottomNav />
    </div>
  );
}
