"use client";

import React from "react";

type Props = {
    onRefresh: () => Promise<any> | void;
    isRefreshing?: boolean;
    threshold?: number;       // px
    maxPull?: number;         // px
    children: React.ReactNode;
};

export default function PullToRefresh({
    onRefresh,
    isRefreshing = false,
    threshold = 72,
    maxPull = 120,
    children,
}: Props) {
    const containerRef = React.useRef<HTMLDivElement | null>(null);

    const startYRef = React.useRef(0);
    const pullingRef = React.useRef(false);
    const canPullRef = React.useRef(false);

    const [pull, setPull] = React.useState(0);     // current pull distance
    const [armed, setArmed] = React.useState(false);

    // If parent sets isRefreshing, keep UI pinned a bit while refreshing
    React.useEffect(() => {
        if (isRefreshing) {
            setPull(threshold);
            setArmed(true);
        } else {
            setPull(0);
            setArmed(false);
        }
    }, [isRefreshing, threshold]);

    function getScrollTop() {
        // Your list likely lives inside .app-content; this wrapper should be inside that.
        const el = containerRef.current;
        return el ? el.scrollTop : 0;
    }

    function onPointerDown(e: React.PointerEvent) {
        if (isRefreshing) return;
        if (e.pointerType === "mouse" && e.button !== 0) return;

        // only allow pull-to-refresh when scrolled to top
        canPullRef.current = getScrollTop() <= 0;

        // ignore if not at top
        if (!canPullRef.current) return;

        pullingRef.current = true;
        startYRef.current = e.clientY;
    }

    function onPointerMove(e: React.PointerEvent) {
        if (!pullingRef.current) return;
        if (!canPullRef.current) return;

        const dy = e.clientY - startYRef.current;
        if (dy <= 0) {
            setPull(0);
            setArmed(false);
            return;
        }

        // prevent native overscroll bounce interference
        e.preventDefault();

        // "rubber band" feel (ease out)
        const eased = maxPull * (1 - Math.exp(-dy / 85));
        const next = Math.min(maxPull, Math.max(0, eased));

        setPull(next);
        setArmed(next >= threshold);
    }

    async function endPull() {
        pullingRef.current = false;

        if (armed && !isRefreshing) {
            // lock indicator at threshold and refresh
            setPull(threshold);
            try {
                await onRefresh();
            } finally {
                // If parent doesn't control isRefreshing, close here
                setPull(0);
                setArmed(false);
            }
        } else {
            setPull(0);
            setArmed(false);
        }
    }

    function onPointerUp() {
        if (!pullingRef.current) return;
        void endPull();
    }

    function onPointerCancel() {
        if (!pullingRef.current) return;
        void endPull();
    }

    const rotate = Math.min(180, (pull / threshold) * 180);
    const showSpinner = isRefreshing;

    return (
        <div
            ref={containerRef}
            className="ptr-container"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            style={{ touchAction: "pan-x pan-y" }} // allow scroll; we preventDefault only when pulling down at top
        >
            {/* Indicator */}
            <div
                className="ptr-indicator"
                style={{
                    height: pull,
                    opacity: pull > 2 ? 1 : 0,
                }}
            >
                <div className="ptr-pill">
                    {showSpinner ? (
                        <div
                            className="premium-loader ptr-premium-loader"
                            style={{ width: 22, height: 22 }}
                            aria-label="Ανανέωση…"
                            role="status"
                        />
                    ) : (
                        <i
                            className="bi bi-arrow-down"
                            style={{
                                transform: `rotate(${rotate}deg)`,
                                transition: pullingRef.current ? "none" : "transform 160ms ease",
                            }}
                        />
                    )}

                    <span className="ptr-text">
                        {showSpinner ? "Ανανέωση…" : armed ? "Άφησε για ανανέωση" : "Τράβηξε προς τα κάτω"}
                    </span>
                </div>
            </div>

            {/* Content shifts down smoothly */}
            <div
                className="ptr-content"
                style={{
                    transform: `translateY(${pull}px)`,
                    transition: pullingRef.current ? "none" : "transform 220ms cubic-bezier(.2,.8,.2,1)",
                }}
            >
                {children}
            </div>
        </div>
    );
}
