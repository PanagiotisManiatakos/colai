"use client";

import React from "react";

type Inset = "default" | "compact";

const summaryPadding: Record<Inset, string> = {
    default: "14px 14px 12px",
    compact: "11px 12px 9px",
};

const contentPadding: Record<Inset, string> = {
    default: "14px 14px 14px",
    compact: "10px 12px 12px",
};

export type CollapsibleAppTileSummary = React.ReactNode | ((open: boolean) => React.ReactNode);

type CollapsibleAppTileProps = {
    summary: CollapsibleAppTileSummary;
    children: React.ReactNode;
    className?: string;
    contentClassName?: string;
    inset?: Inset;
};

/**
 * Expandable tile using `app-card` + theme-aware borders (same pattern as OrderCard / DiscountRequestCard).
 */
export function CollapsibleAppTile({
    summary,
    children,
    className = "",
    contentClassName = "",
    inset = "default",
}: CollapsibleAppTileProps) {
    const [open, setOpen] = React.useState(false);
    const summaryNode = typeof summary === "function" ? summary(open) : summary;

    return (
        <details
            className={`app-card ${className}`.trim()}
            style={{ overflow: "hidden" }}
            onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
        >
            <summary
                className="d-flex align-items-center justify-content-between gap-2 w-100"
                style={{
                    padding: summaryPadding[inset],
                    borderBottom: open ? "1px solid var(--bs-border-color-translucent)" : "1px solid transparent",
                    listStyle: "none",
                    cursor: "pointer",
                    WebkitTapHighlightColor: "transparent",
                }}
            >
                {summaryNode}
            </summary>
            <div className={contentClassName} style={{ padding: contentPadding[inset] }}>
                {children}
            </div>
        </details>
    );
}
