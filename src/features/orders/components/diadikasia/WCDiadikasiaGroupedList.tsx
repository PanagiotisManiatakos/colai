"use client";

import React from "react";
import type { wcCalendar } from "@/types/wc";
import { wcCalendarTaskCode } from "@/types/wc";
import { CollapsibleAppTile } from "@/components/ui/CollapsibleAppTile";
import { formatUIDate } from "@/lib/utils/date";
import { formatCurrencyGR } from "@/lib/utils/number";
import { groupWcCalendarByLastOrderDate } from "@/features/orders/diadikasia/groupWcCalendarByLastOrderDate";

function WcCalendarRow({
    row,
    showDivider,
    showTurnover,
}: {
    row: wcCalendar;
    showDivider: boolean;
    showTurnover: boolean;
}) {
    const last = formatUIDate(row.lastPAEO);
    const next = formatUIDate(row.expectedNextOrderDate);
    const nextPart = next ? ` (${next})` : "";

    const body = (
        <div style={{ minWidth: 0 }}>
            <div className="fw-semibold" style={{ color: "var(--bs-body-color)", fontSize: 15 }}>
                {(row.customerName ?? "").trim() || "—"}
            </div>
            <div className="text-secondary small mt-1">{(row.doctoR_SINTAGHS ?? "").trim() || "—"}</div>
            <div className="small mt-1" style={{ color: "var(--bs-body-color)" }}>
                {last || "—"}
                <span className="text-secondary">{nextPart}</span>
            </div>
            <div className="text-secondary small mt-1">AMKA: {(row.amka ?? "").trim() || "—"}</div>
        </div>
    );

    return (
        <div
            className={`${showTurnover ? "d-flex justify-content-between align-items-start gap-3 " : ""}${showDivider ? "pb-3 mb-3" : "pb-1"}`}
            style={
                showDivider
                    ? { borderBottom: "1px solid var(--bs-border-color-translucent)" }
                    : undefined
            }
        >
            {body}
            {showTurnover ? (
                <div className="fw-semibold text-end flex-shrink-0" style={{ fontSize: 15, color: "var(--bs-body-color)" }}>
                    {formatCurrencyGR(row.totalTurnover)}€
                </div>
            ) : null}
        </div>
    );
}

export default function WCDiadikasiaGroupedList({ items }: { items: wcCalendar[] }) {
    const months = React.useMemo(() => groupWcCalendarByLastOrderDate(items), [items]);

    if (!months.length) {
        return (
            <div className="app-card p-4 text-center text-secondary">
                Δεν υπάρχουν εγγραφές με ημερομηνία τελευταίας παραγγελίας.
            </div>
        );
    }

    return (
        <div className="d-flex flex-column gap-2">
            {months.map((m) => (
                <CollapsibleAppTile
                    key={m.sortKey}
                    summary={(expanded) => (
                        <>
                            <div style={{ minWidth: 0 }}>
                                <div className="fw-semibold" style={{ color: "var(--bs-body-color)", fontSize: 16 }}>
                                    {m.monthTitle}
                                </div>
                                <div className="text-secondary small mt-1">
                                    {m.ordersCount} {m.ordersCount === 1 ? "εγγραφή" : "εγγραφές"}
                                </div>
                            </div>
                            <div className="text-end flex-shrink-0">
                                <div className="fw-semibold" style={{ fontSize: 15, color: "var(--bs-body-color)" }}>
                                    {formatCurrencyGR(m.totalTurnover)}€
                                </div>
                                <i
                                    className="bi bi-chevron-down text-secondary mt-1 d-inline-block"
                                    style={{
                                        fontSize: "1.1rem",
                                        transition: "transform 160ms ease",
                                        transform: expanded ? "rotate(-180deg)" : "none",
                                    }}
                                    aria-hidden
                                />
                            </div>
                        </>
                    )}
                >
                    <div className="d-flex flex-column gap-2">
                        {m.days.map((d) => (
                            <CollapsibleAppTile
                                key={`${m.sortKey}-${d.dayOfMonth}`}
                                inset="compact"
                                className="app-card-soft"
                                summary={(expanded) => (
                                    <>
                                        <div style={{ minWidth: 0 }}>
                                            <div className="fw-semibold" style={{ fontSize: 14, color: "var(--bs-body-color)" }}>
                                                {d.dayTitle}
                                            </div>
                                            <div className="text-secondary small mt-1">
                                                {d.items.length} {d.items.length === 1 ? "εγγραφή" : "εγγραφές"}
                                            </div>
                                        </div>
                                        <div className="text-end flex-shrink-0 align-self-start">
                                            <div className="fw-semibold" style={{ fontSize: 14, color: "var(--bs-body-color)" }}>
                                                {formatCurrencyGR(d.totalTurnover)}€
                                            </div>
                                            <i
                                                className="bi bi-chevron-down text-secondary mt-1 d-inline-block"
                                                style={{
                                                    fontSize: "1rem",
                                                    transition: "transform 160ms ease",
                                                    transform: expanded ? "rotate(-180deg)" : "none",
                                                }}
                                                aria-hidden
                                            />
                                        </div>
                                    </>
                                )}
                            >
                                {d.items.map((r, idx) => (
                                    <WcCalendarRow
                                        key={`${wcCalendarTaskCode(r)}-${r.customerCode}-${r.lastOrderDate}-${idx}`}
                                        row={r}
                                        showDivider={idx < d.items.length - 1}
                                        showTurnover={d.items.length > 1}
                                    />
                                ))}
                            </CollapsibleAppTile>
                        ))}
                    </div>
                </CollapsibleAppTile>
            ))}
        </div>
    );
}
