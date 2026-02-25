"use client";

import * as React from "react";

type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function usePwaInstallPrompt() {
    const [deferred, setDeferred] = React.useState<BeforeInstallPromptEvent | null>(null);
    const [installed, setInstalled] = React.useState(false);

    React.useEffect(() => {
        const isStandalone =
            window.matchMedia?.("(display-mode: standalone)")?.matches ||
            // @ts-ignore (older iOS/Safari)
            (window.navigator as any).standalone === true;

        setInstalled(!!isStandalone);

        const onBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferred(e as BeforeInstallPromptEvent);
        };

        const onAppInstalled = () => {
            setInstalled(true);
            setDeferred(null);
        };

        window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
        window.addEventListener("appinstalled", onAppInstalled);

        return () => {
            window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
            window.removeEventListener("appinstalled", onAppInstalled);
        };
    }, []);

    const canInstall = !!deferred && !installed;

    const promptInstall = async () => {
        if (!deferred) return { outcome: "dismissed" as const };
        await deferred.prompt();
        const res = await deferred.userChoice;
        if (res.outcome === "accepted") setDeferred(null);
        return res;
    };

    return { canInstall, installed, promptInstall };
}