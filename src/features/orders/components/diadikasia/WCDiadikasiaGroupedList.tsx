"use client";

import React from "react";
import type { SearchCustomerTelsData, wcCalendar } from "@/types/wc";
import { wcCalendarTaskCode, wcCustomerGid } from "@/types/wc";
import { fetchCustomerTelsCached } from "@/features/orders/diadikasia/fetchCustomerTels";
import { CollapsibleAppTile } from "@/components/ui/CollapsibleAppTile";
import { formatUIDate } from "@/lib/utils/date";
import { formatCurrencyGR } from "@/lib/utils/number";
import { groupWcCalendarByLastOrderDate } from "@/features/orders/diadikasia/groupWcCalendarByLastOrderDate";

function telHref(phone: string): string {
    const digits = phone.trim().replace(/[^\d+]/g, "");
    return digits ? `tel:${digits}` : "";
}

function WcCustomerContactSection({ row, fetchEnabled }: { row: wcCalendar; fetchEnabled: boolean }) {
    const amka = (row.amka ?? "").trim();
    const gid = wcCustomerGid(row);
    const [loading, setLoading] = React.useState(() => !!(amka && fetchEnabled));
    const [data, setData] = React.useState<SearchCustomerTelsData | null>(null);

    React.useEffect(() => {
        if (!amka || !fetchEnabled) {
            setLoading(false);
            return;
        }
        let cancelled = false;
        setLoading(true);
        setData(null);
        void fetchCustomerTelsCached(gid, amka)
            .then((d) => {
                if (!cancelled) setData(d);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [amka, gid, fetchEnabled]);

    if (!amka) return null;

    if (!fetchEnabled) return null;

    if (loading) {
        return (
            <div className="text-secondary small mt-2 d-flex align-items-center gap-1">
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden style={{ width: "0.85rem", height: "0.85rem" }} />
                Φόρτωση επαφών…
            </div>
        );
    }

    const phones = data?.telephones ?? [];
    const emails = data?.emails ?? [];
    if (!phones.length && !emails.length) {
        return null;
    }

    return (
        <div className="mt-2">
            {phones.length ? (
                <div className="d-flex flex-column gap-1">
                    {phones.map((t, i) => {
                        const href = telHref(t.phone);
                        const label = (t.name ?? "").trim();
                        const numberBlock = (
                            <>
                                <i className="bi bi-telephone-fill me-1 flex-shrink-0" aria-hidden />
                                <span className="text-break">{t.phone}</span>
                            </>
                        );
                        return (
                            <div key={`${t.phone}-${i}`} className="small d-flex align-items-center flex-wrap">
                                {href ? (
                                    <a href={href} className="d-inline-flex align-items-start text-decoration-none" style={{ color: "var(--bs-primary)" }}>
                                        {numberBlock}
                                    </a>
                                ) : (
                                    <span className="d-inline-flex align-items-start" style={{ color: "var(--bs-body-color)" }}>
                                        {numberBlock}
                                    </span>
                                )}
                                {label ? <span className="text-secondary small ms-1">({label})</span> : null}
                            </div>
                        );
                    })}
                </div>
            ) : null}
            {emails.length ? (
                <div className={`d-flex flex-column gap-1 ${phones.length ? "mt-2" : ""}`}>
                    {emails.map((email) => (
                        <a
                            key={email}
                            href={email.trim() ? `mailto:${email.trim()}` : undefined}
                            className="small d-inline-flex align-items-center gap-1 text-decoration-none text-break"
                            style={{ color: "var(--bs-primary)" }}
                        >
                            <i className="bi bi-envelope flex-shrink-0" aria-hidden />
                            {email}
                        </a>
                    ))}
                </div>
            ) : null}
        </div>
    );
}

function WcCalendarRow({
    row,
    showDivider,
    showTurnover,
    contactFetchEnabled,
}: {
    row: wcCalendar;
    showDivider: boolean;
    showTurnover: boolean;
    contactFetchEnabled: boolean;
}) {
    const last = formatUIDate(row.lastPAEO);
    const next = formatUIDate(row.lastOrderDate);
    const nextPart = next ? ` (${next})` : "";

    const body = (
        <div>
            <div className="fw-semibold" style={{ color: "var(--bs-body-color)", fontSize: 15 }}>
                {(row.customerName ?? "").trim() || "—"}
            </div>
            <div className="text-secondary small mt-1">{(row.doctoR_SINTAGHS ?? "").trim() || "—"}</div>
            <div className="small mt-1" style={{ color: "var(--bs-body-color)" }}>
                {last || "—"}
                <span className="text-secondary">{nextPart}</span>
            </div>
            <div className="text-secondary small mt-1">AMKA: {(row.amka ?? "").trim() || "—"}</div>
            <WcCustomerContactSection row={row} fetchEnabled={contactFetchEnabled} />
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

export default function WCDiadikasiaGroupedList({
    items,
    setAllOpenTo,
    onAllExpandedChange,
}: {
    items: wcCalendar[];
    setAllOpenTo?: boolean;
    onAllExpandedChange?: (expanded: boolean) => void;
}) {
    const months = React.useMemo(() => groupWcCalendarByLastOrderDate(items), [items]);
    const monthKeys = React.useMemo(() => months.map((m) => String(m.sortKey)), [months]);
    const dayKeys = React.useMemo(
        () => months.flatMap((m) => m.days.map((d) => `${m.sortKey}-${d.dayOfMonth}`)),
        [months]
    );
    const [openMonths, setOpenMonths] = React.useState<Record<string, boolean>>({});
    const [openDays, setOpenDays] = React.useState<Record<string, boolean>>({});

    const allExpanded =
        monthKeys.length > 0 &&
        dayKeys.length > 0 &&
        monthKeys.every((k) => !!openMonths[k]) &&
        dayKeys.every((k) => !!openDays[k]);

    const setAllTilesOpen = React.useCallback((nextOpen: boolean) => {
        const nextMonths: Record<string, boolean> = {};
        const nextDays: Record<string, boolean> = {};
        for (const key of monthKeys) nextMonths[key] = nextOpen;
        for (const key of dayKeys) nextDays[key] = nextOpen;
        setOpenMonths(nextMonths);
        setOpenDays(nextDays);
    }, [monthKeys, dayKeys]);

    React.useEffect(() => {
        if (typeof setAllOpenTo !== "boolean") return;
        setAllTilesOpen(setAllOpenTo);
    }, [setAllOpenTo, setAllTilesOpen]);

    React.useEffect(() => {
        onAllExpandedChange?.(allExpanded);
    }, [allExpanded, onAllExpandedChange]);

    if (!months.length) {
        return (
            <div className="app-card p-4 text-center text-secondary">
                Δεν υπάρχουν εγγραφές με αναμενόμενη ημερομηνία επόμενης παραγγελίας.
            </div>
        );
    }

    return (
        <div className="d-flex flex-column gap-2">
            {months.map((m) => (
                <CollapsibleAppTile
                    key={m.sortKey}
                    open={!!openMonths[String(m.sortKey)]}
                    onOpenChange={(open) =>
                        setOpenMonths((prev) => ({
                            ...prev,
                            [String(m.sortKey)]: open,
                        }))
                    }
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
                                open={!!openDays[`${m.sortKey}-${d.dayOfMonth}`]}
                                onOpenChange={(open) =>
                                    setOpenDays((prev) => ({
                                        ...prev,
                                        [`${m.sortKey}-${d.dayOfMonth}`]: open,
                                    }))
                                }
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
                                {d.items.map((r, idx) => {
                                    const monthOpen = !!openMonths[String(m.sortKey)];
                                    const dayKey = `${m.sortKey}-${d.dayOfMonth}`;
                                    const dayOpen = !!openDays[dayKey];
                                    const contactFetchEnabled = monthOpen && dayOpen;
                                    return (
                                        <WcCalendarRow
                                            key={`${wcCalendarTaskCode(r)}-${r.customerCode}-${r.expectedNextOrderDate}-${idx}`}
                                            row={r}
                                            showDivider={idx < d.items.length - 1}
                                            showTurnover={d.items.length > 1}
                                            contactFetchEnabled={contactFetchEnabled}
                                        />
                                    );
                                })}
                            </CollapsibleAppTile>
                        ))}
                    </div>
                </CollapsibleAppTile>
            ))}
        </div>
    );
}
