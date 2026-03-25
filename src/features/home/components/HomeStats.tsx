"use client";

import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
import AppLoader from "@/components/ui/AppLoader";
import { fetchDashboardData } from "@/store/dashboard/slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { WcStoixoiMina } from "@/types/dashboard";
import {
    RecentOrdersByDayChart,
    WcDistributionCharts,
} from "@/features/home/components/DashboardCharts";
import Link from "next/link";
import React from "react";
import { Alert } from "react-bootstrap";

const intFmt = new Intl.NumberFormat("el-GR", { maximumFractionDigits: 0 });
const pctFmt = new Intl.NumberFormat("el-GR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

function formatInt(n: number): string {
    return intFmt.format(Number.isFinite(n) ? n : 0);
}

type MetricCardProps = {
    title: string;
    value: string;
    delta?: string | null;
    deltaDirection?: "up" | "down" | "neutral";
    icon: string;
    href?: string;
};

function MetricCard({ title, value, delta, deltaDirection = "neutral", icon, href }: MetricCardProps) {
    const showDelta = delta != null && delta !== "";

    let badgeClass = "text-bg-secondary";
    let arrowIcon = "bi-dash-lg";
    if (deltaDirection === "up") {
        badgeClass = "text-bg-success";
        arrowIcon = "bi-arrow-up";
    } else if (deltaDirection === "down") {
        badgeClass = "text-bg-danger";
        arrowIcon = "bi-arrow-down";
    }

    const body = (
        <div
            className={`app-card p-3 h-100${href ? " app-card-pressable" : ""}`}
            style={href ? { WebkitTapHighlightColor: "transparent" } : undefined}
        >
            <div className="d-flex align-items-start justify-content-between">
                <div
                    className="d-inline-flex align-items-center justify-content-center rounded-3 bg-body-tertiary"
                    style={{ width: 40, height: 40 }}
                >
                    <i className={`bi ${icon}`} style={{ fontSize: "1.15rem" }} />
                </div>
                {showDelta ? (
                    <span className={`badge ${badgeClass} app-pill`}>
                        {deltaDirection !== "neutral" ? <i className={`bi ${arrowIcon} me-1`} /> : null}
                        {delta}
                    </span>
                ) : href ? (
                    <i className="bi bi-chevron-right text-secondary" style={{ fontSize: "1.1rem" }} aria-hidden />
                ) : null}
            </div>

            <div className="mt-3">
                <div className="small text-secondary" style={{ lineHeight: 1.1 }}>
                    {title}
                </div>
                <div className="h5 fw-bold mb-0 mt-1" style={{ letterSpacing: "-0.02em" }}>
                    {value}
                </div>
            </div>
        </div>
    );

    return (
        <div className="col-6">
            {href ? (
                <Link
                    href={href}
                    className="text-decoration-none text-reset d-block h-100"
                    aria-label={`${title} — μετάβαση στο WC διαδικασία`}
                >
                    {body}
                </Link>
            ) : (
                body
            )}
        </div>
    );
}

function WcMonthCard({ wc }: { wc: WcStoixoiMina }) {
    return (
        <div className="app-card p-3">
            <div className="d-flex align-items-start justify-content-between">
                <div>
                    <div className="fw-semibold">WC — μήνας</div>
                    <div className="small text-secondary">Νέες και επαναλαμβανόμενες παραγγελίες</div>
                </div>
            </div>
            <WcDistributionCharts wc={wc} />
        </div>
    );
}

function MonthComparisonCard({
    current,
    previous,
    pendingReviews,
}: {
    current: number;
    previous: number;
    pendingReviews: number;
}) {
    const max = Math.max(current, previous, 1);
    const currPct = (current / max) * 100;
    const prevPct = (previous / max) * 100;

    return (
        <div className="app-card p-3">
            <div className="d-flex align-items-start justify-content-between">
                <div>
                    <div className="fw-semibold">Παραγγελίες & εκκρεμότητες</div>
                    <div className="small text-secondary">Τρέχων vs προηγούμενος μήνας</div>
                </div>
                <span
                    className={`badge app-pill ${pendingReviews > 0 ? "bg-warning-subtle text-warning-emphasis" : "bg-success-subtle text-success-emphasis"}`}
                >
                    {formatInt(pendingReviews)} εκκρεμείς
                </span>
            </div>

            <div className="mt-3">
                <div className="d-flex justify-content-between small text-secondary mb-1">
                    <span>Προηγούμενος μήνας</span>
                    <span className="fw-medium text-body">{formatInt(previous)}</span>
                </div>
                <div
                    className="rounded-pill bg-body-tertiary mb-3"
                    style={{ height: 8, overflow: "hidden" }}
                    role="presentation"
                >
                    <div
                        className="h-100 bg-secondary rounded-pill"
                        style={{ width: `${prevPct}%`, opacity: 0.45 }}
                    />
                </div>

                <div className="d-flex justify-content-between small text-secondary mb-1">
                    <span>Τρέχων μήνας</span>
                    <span className="fw-medium text-body">{formatInt(current)}</span>
                </div>
                <div className="rounded-pill bg-body-tertiary" style={{ height: 8, overflow: "hidden" }} role="presentation">
                    <div className="h-100 bg-primary rounded-pill" style={{ width: `${currPct}%` }} />
                </div>
            </div>
        </div>
    );
}

export default function HomeStats() {
    const dispatch = useAppDispatch();
    const dash = useAppSelector((s) => s.dashboard);

    React.useEffect(() => {
        void dispatch(fetchDashboardData());
    }, [dispatch]);

    const mom = dash.totalOrders_month_perc;
    const momDir: "up" | "down" | "neutral" = mom > 0 ? "up" : mom < 0 ? "down" : "neutral";
    const momLabel = `${pctFmt.format(Math.abs(mom))}%`;

    return (
        <div
            className="h-100 d-flex flex-column"
            style={{
                minHeight: 0,
                overflowX: "hidden",
                overflowY: "auto",
                WebkitOverflowScrolling: "touch",
            }}
        >
            {dash.error ? (
                <Alert variant="danger" className="mb-3 py-2">
                    {dash.error}
                </Alert>
            ) : null}

            {dash.loading && dash.lastFetchedAt === 0 ? (
                <AppLoader label="Φόρτωση αρχικής…" />
            ) : (
                <>
                    <div className="row g-3 mb-3">
                        <MetricCard
                            title="Παραγγελίες μήνα"
                            value={formatInt(dash.totalOrders_month)}
                            delta={momLabel}
                            deltaDirection={momDir}
                            icon="bi-box-seam"
                        />
                        <MetricCard
                            title="Συνταγές επόμενων 10 ημερών"
                            value={formatInt(dash.next10DaysSyntages)}
                            delta={null}
                            icon="bi-paperclip"
                            href="/diadikasia-wc"
                        />
                    </div>

                    <div className="d-grid gap-3">
                        {dash.wC_stoixoi_mina ? <WcMonthCard wc={dash.wC_stoixoi_mina} /> : null}
                        <MonthComparisonCard
                            current={dash.totalOrders_month}
                            previous={dash.totalOrders_prev_month}
                            pendingReviews={dash.pendingReviews}
                        />
                        <div className="app-card p-3">
                            <div className="fw-semibold">Πρόσφατες παραγγελίες (ανά ημέρα)</div>
                            <div className="small text-secondary">Τελευταίες 14 ημέρες</div>
                            <RecentOrdersByDayChart orders={dash.lastOrders} />
                        </div>
                    </div>
                </>
            )}

            <FloatingActionButton href="/orders/0" ariaLabel="Νέα παραγγελία" />
        </div>
    );
}
