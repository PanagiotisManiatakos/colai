"use client";

import React from "react";

const ACTION_WIDTH = 88; // must match CSS delete width

export default function SwipeToDeleteYliko({
    children,
    onDelete,
    deleteAriaLabel = "Delete",
}: {
    children: React.ReactNode;
    onDelete: () => void;
    deleteAriaLabel?: string;
}) {
    const [x, setX] = React.useState(0); // 0..-ACTION_WIDTH
    const [dragging, setDragging] = React.useState(false);

    const startRef = React.useRef({
        x: 0,
        y: 0,
        baseX: 0,
        active: false,
        swiping: false,
    });

    const clamp = (v: number) => Math.max(-ACTION_WIDTH, Math.min(0, v));

    function shouldIgnoreSwipeTarget(target: EventTarget | null) {
        const el = target as HTMLElement | null;
        if (!el) return false;
        // Don't swipe when interacting with form controls
        return Boolean(el.closest("input, textarea, select, button, a, label"));
    }

    function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        if (shouldIgnoreSwipeTarget(e.target)) return;

        startRef.current = {
            x: e.clientX,
            y: e.clientY,
            baseX: x,
            active: true,
            swiping: false,
        };

        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        setDragging(true);
    }

    function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
        if (!startRef.current.active) return;

        const dx = e.clientX - startRef.current.x;
        const dy = e.clientY - startRef.current.y;

        if (!startRef.current.swiping) {
            const isHorizontal = Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy);
            if (!isHorizontal) return;
            startRef.current.swiping = true;
        }

        e.preventDefault();
        setX(clamp(startRef.current.baseX + dx));
    }

    function settle() {
        setDragging(false);
        startRef.current.active = false;

        const shouldOpen = x < -ACTION_WIDTH * 0.35;
        setX(shouldOpen ? -ACTION_WIDTH : 0);
    }

    function onPointerUp() {
        if (!startRef.current.active) return;
        settle();
    }

    function onPointerCancel() {
        if (!startRef.current.active) return;
        settle();
    }

    return (
        <div
            className="swipe-row"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            style={{ touchAction: "pan-y" }}
        >
            {/* behind */}
            <div className="swipe-actions">
                <button
                    type="button"
                    className="btn btn-danger swipe-delete"
                    onClick={onDelete}
                    aria-label={deleteAriaLabel}
                >
                    <i className="bi bi-trash3" />
                </button>
            </div>

            {/* front */}
            <div
                className={`swipe-content ${dragging ? "dragging" : ""}`}
                style={{ transform: `translateX(${x}px)` }}
            >
                {children}
            </div>
        </div>
    );
}
