"use client";

import * as React from "react";
import { usePwaInstallPrompt } from "@/hooks/usePWAInstallPrompt";

const LS_KEY = "pwa_install_banner_dismissed_at";
const COOLDOWN_DAYS = 7;

function isInCooldown() {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (!Number.isFinite(ts)) return false;
    const days = (Date.now() - ts) / (1000 * 60 * 60 * 24);
    return days < COOLDOWN_DAYS;
}

export default function PwaInstallTopBanner() {
    const { canInstall, promptInstall } = usePwaInstallPrompt();
    const [hidden, setHidden] = React.useState(true);

    React.useEffect(() => {
        // Only decide on client
        const cooldown = isInCooldown();
        setHidden(cooldown);
    }, []);

    React.useEffect(() => {
        // Show banner only when install is actually available
        if (canInstall && !isInCooldown()) setHidden(false);
    }, [canInstall]);

    if (hidden || !canInstall) return null;

    const dismiss = () => {
        localStorage.setItem(LS_KEY, String(Date.now()));
        setHidden(true);
    };

    const install = async () => {
        const res = await promptInstall();
        if (res.outcome === "dismissed") {
            // Optional: avoid re-showing immediately after dismiss
            localStorage.setItem(LS_KEY, String(Date.now()));
            setHidden(true);
        }
    };

    return (
        <div
            className="position-fixed top-0 start-0 end-0 p-2"
            style={{ zIndex: 2000, backgroundColor: "var(--app-surface)" }}
        >
            <div
                className="d-flex align-items-center justify-content-between gap-2 shadow-sm border rounded-3 px-3 py-2"
                style={{ maxWidth: 720, margin: "0 auto", backgroundColor: "var(--app-surface)" }}
            >
                <div className="d-flex align-items-center gap-2" style={{ backgroundColor: "var(--app-surface)" }}>
                    <i className="bi bi-download" aria-hidden="true" />
                    <div className="small">
                        <div className="fw-semibold">Install this app</div>
                    </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                    <button type="button" className="btn btn-sm btn-outline-secondary" onClick={dismiss}>
                        Not now
                    </button>
                    <button type="button" className="btn btn-sm btn-primary" onClick={install}>
                        Install
                    </button>
                </div>
            </div>
        </div>
    );
}