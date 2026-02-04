"use client";

import React from "react";

type Props = {
    onRefresh: () => Promise<any> | void;
    isRefreshing?: boolean;
    threshold?: number; // px
    maxPull?: number; // px
    scrollSelector?: string; // default ".app-content"
    children: React.ReactNode;
    useSelfScroll?: boolean;
    style?: React.CSSProperties;
    className?: string;
};

export default function PullToRefresh({
    onRefresh,
    isRefreshing = false,
    threshold = 72,
    maxPull = 120,
    useSelfScroll = false,
    scrollSelector = ".app-content",
    children,
    style,
    className
}: Props) {
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const scrollElRef = React.useRef<HTMLElement | null>(null);

    const startYRef = React.useRef(0);
    const pullingRef = React.useRef(false);
    const canPullRef = React.useRef(false);

    const [pull, setPull] = React.useState(0);
    const [armed, setArmed] = React.useState(false);

    // Find the real scroll container (your <main className="app-content"> usually)
    React.useEffect(() => {
        scrollElRef.current =
            (document.querySelector(scrollSelector) as HTMLElement | null) ??
            (containerRef.current?.parentElement as HTMLElement | null) ??
            null;
    }, [scrollSelector]);

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
        return scrollElRef.current?.scrollTop ?? 0;
    }

    async function endPull() {
        pullingRef.current = false;

        if (armed && !isRefreshing) {
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

    // Native touch listeners (passive:false on move) so preventDefault works
    React.useEffect(() => {
        const scrollEl = scrollElRef.current;
        if (!scrollEl) return;

        const onTouchStart = (e: TouchEvent) => {
            if (isRefreshing) return;
            if (e.touches.length !== 1) return;

            // Only allow pull-to-refresh when scrolled to top
            canPullRef.current = getScrollTop() <= 0;
            if (!canPullRef.current) return;

            pullingRef.current = true;
            startYRef.current = e.touches[0].clientY;
        };

        const onTouchMove = (e: TouchEvent) => {
            if (!pullingRef.current) return;
            if (!canPullRef.current) return;

            const dy = e.touches[0].clientY - startYRef.current;

            // user is scrolling up -> let normal scroll happen
            if (dy <= 0) {
                setPull(0);
                setArmed(false);
                return;
            }

            // Critical: stop the scroll only while pulling down at top
            if (e.cancelable) e.preventDefault();

            // rubber band
            const eased = maxPull * (1 - Math.exp(-dy / 85));
            const next = Math.min(maxPull, Math.max(0, eased));

            setPull(next);
            setArmed(next >= threshold);
        };

        const onTouchEnd = () => {
            if (!pullingRef.current) return;
            void endPull();
        };

        scrollEl.addEventListener("touchstart", onTouchStart, { passive: true });
        scrollEl.addEventListener("touchmove", onTouchMove, { passive: false });
        scrollEl.addEventListener("touchend", onTouchEnd, { passive: true });
        scrollEl.addEventListener("touchcancel", onTouchEnd, { passive: true });

        return () => {
            scrollEl.removeEventListener("touchstart", onTouchStart);
            scrollEl.removeEventListener("touchmove", onTouchMove as any);
            scrollEl.removeEventListener("touchend", onTouchEnd);
            scrollEl.removeEventListener("touchcancel", onTouchEnd);
        };
    }, [isRefreshing, threshold, maxPull, onRefresh, armed]);

    const rotate = Math.min(180, (pull / threshold) * 180);
    const showSpinner = isRefreshing;

    return (
        <div
            ref={containerRef}
            className={`ptr-container ${className ?? ""}`}
            style={{
                // When using self scroll, this element is the scroll container
                ...(useSelfScroll
                    ? {
                        height: "100%",
                        minHeight: 0,
                        overflowY: "auto",
                        overflowX: "hidden",
                        WebkitOverflowScrolling: "touch",
                        overscrollBehavior: "contain",
                        touchAction: "pan-y",
                    }
                    : {}),
                ...style,
            }}
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