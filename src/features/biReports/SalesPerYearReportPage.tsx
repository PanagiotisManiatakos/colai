"use client";

import React from "react";

import AppLoader from "@/components/ui/AppLoader";
import {
  MetricCard,
  ReportError,
  ReportHeader,
  TargetBar,
  ValuePill,
} from "@/features/biReports/ReportShared";
import {
  formatNullableCurrency,
  formatNullableNumber,
  formatNullableRatioPercent,
} from "@/lib/bi-reports/reportUtils";
import { parseProxyJson } from "@/lib/api/client";
import type {
  SalesPerYearResponse,
  SalesPerYearRow,
} from "@/lib/bi-reports/biReports";

function SalesPerYearTargetPanel({
  title,
  subtitle,
  icon,
  accent,
  actualLabel,
  actual,
  target,
  forecast,
  coverage,
  formatValue,
}: {
  title: string;
  subtitle: string;
  icon: string;
  accent: string;
  actualLabel: string;
  actual: number | null;
  target: number | null;
  forecast?: number | null;
  coverage?: number | null;
  formatValue: (value: number | null) => string;
}) {
  const ratio =
    coverage ??
    (actual != null && target != null && target > 0 ? actual / target : null);
  const width = ratio == null ? 0 : Math.min(100, Math.max(0, ratio * 100));

  return (
    <div className="app-card p-3">
      <div className="d-flex align-items-start justify-content-between gap-3">
        <div className="min-w-0">
          <div className="d-flex align-items-center gap-2">
            <span
              className="d-inline-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
              style={{
                width: 36,
                height: 36,
                background: `${accent}1f`,
                color: accent,
              }}
            >
              <i className={`bi ${icon}`} aria-hidden />
            </span>
            <div className="min-w-0">
              <div className="fw-bold text-truncate">{title}</div>
              <div className="small text-secondary text-truncate">
                {subtitle}
              </div>
            </div>
          </div>
        </div>
        <span
          className="badge rounded-pill flex-shrink-0"
          style={{
            background: `${accent}1f`,
            color: accent,
            border: `1px solid ${accent}33`,
          }}
        >
          {formatNullableRatioPercent(ratio)}
        </span>
      </div>

      <div className="row g-2 mt-3">
        <div className="col-6">
          <ValuePill label={actualLabel} value={formatValue(actual)} />
        </div>
        <div className="col-6">
          <ValuePill label="Στόχος" value={formatValue(target)} />
        </div>
        {forecast !== undefined ? (
          <div className="col-12">
            <ValuePill label="Forecast" value={formatValue(forecast)} />
          </div>
        ) : null}
      </div>

      <div
        className="rounded-pill bg-body-tertiary mt-3"
        style={{ height: 9, overflow: "hidden" }}
        role="presentation"
      >
        <div
          className="rounded-pill h-100"
          style={{
            width: `${width}%`,
            background: ratio != null && ratio >= 1 ? "#16a34a" : accent,
          }}
        />
      </div>
    </div>
  );
}

function SalesPerYearProductCard({
  title,
  sales,
  target,
  coverage,
  accent,
}: {
  title: string;
  sales: number | null;
  target: number | null;
  coverage: number | null;
  accent: string;
}) {
  return (
    <div className="app-card p-3">
      <div className="d-flex align-items-start justify-content-between gap-3">
        <div className="min-w-0">
          <div className="fw-bold">{title}</div>
          <div className="small text-secondary">Πωλήσεις vs στόχος</div>
        </div>
        <span
          className="badge rounded-pill flex-shrink-0"
          style={{
            background: `${accent}1f`,
            color: accent,
            border: `1px solid ${accent}33`,
          }}
        >
          {formatNullableRatioPercent(coverage)}
        </span>
      </div>

      <div className="row g-2 mt-2">
        <div className="col-6">
          <ValuePill label="Πωλήσεις" value={formatNullableCurrency(sales)} />
        </div>
        <div className="col-6">
          <ValuePill label="Στόχος" value={formatNullableCurrency(target)} />
        </div>
      </div>

      <div className="mt-3">
        <TargetBar
          label="Κάλυψη"
          actual={sales}
          target={target}
          coverage={coverage}
          accent={accent}
          formatValue={formatNullableCurrency}
        />
      </div>
    </div>
  );
}

function SalesPerYearDetailsTable({ row }: { row: SalesPerYearRow }) {
  const details = [
    {
      label: "Total Coloplast Sales",
      value: formatNullableCurrency(row.totalColoplastSales),
    },
    {
      label: "Total CLP Target",
      value: formatNullableCurrency(row.totalClpTarget),
    },
    {
      label: "Total CLP Sales Forecast",
      value: formatNullableCurrency(row.totalClpSalesForecast),
    },
    {
      label: "% Total CLP Cover",
      value: formatNullableRatioPercent(row.totalClpCover),
    },
    { label: "OC PER", value: formatNullableNumber(row.ocPer) },
    { label: "OC PER Target", value: formatNullableNumber(row.ocPerTarget) },
    {
      label: "OC PER Forecast",
      value: formatNullableNumber(row.ocPerForecast),
    },
    { label: "% OC Cover", value: formatNullableRatioPercent(row.ocCover) },
    { label: "IC PER NEW", value: formatNullableNumber(row.icPerNew) },
    {
      label: "IC PER Target New",
      value: formatNullableNumber(row.icPerTargetNew),
    },
    {
      label: "Genadyne Sales",
      value: formatNullableCurrency(row.genadyneSales),
    },
    {
      label: "GENADYNE Target",
      value: formatNullableCurrency(row.genadyneTarget),
    },
    {
      label: "% COVER GENADYNE",
      value: formatNullableRatioPercent(row.genadyneCover),
    },
    { label: "UNO Sales", value: formatNullableCurrency(row.unoSales) },
    {
      label: "UNO Target Sales",
      value: formatNullableCurrency(row.unoTargetSales),
    },
    { label: "% COVER UNO", value: formatNullableRatioPercent(row.unoCover) },
  ];

  return (
    <div className="app-card p-3">
      <div className="d-flex align-items-start justify-content-between gap-3">
        <div>
          <div className="fw-semibold">Αναλυτικά στοιχεία</div>
          <div className="small text-secondary">Ετήσιες τιμές από Power BI</div>
        </div>
        <i className="bi bi-table text-secondary" aria-hidden />
      </div>

      <div className="d-flex flex-column mt-3 gap-2">
        {details.map((item) => (
          <div
            key={item.label}
            className="rounded-4 bg-body-tertiary d-flex align-items-center justify-content-between gap-3 p-2"
          >
            <span className="small text-secondary">{item.label}</span>
            <span className="fw-semibold text-end">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SalesPerYearReportPage() {
  const [records, setRecords] = React.useState<SalesPerYearRow[]>([]);
  const [sellerCode, setSellerCode] = React.useState("");
  const [sellerName, setSellerName] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadSalesPerYear = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/bi-reports/sales-per-year", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      const data = await parseProxyJson<SalesPerYearResponse>(
        res,
        "Failed to load Power BI sales per year",
      );

      setRecords(data.records ?? []);
      setSellerCode(data.sellerCode ?? "");
      setSellerName(data.sellerName ?? "");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load Power BI sales per year";
      setError(message);
      setRecords([]);
      setSellerCode("");
      setSellerName("");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadSalesPerYear();
  }, [loadSalesPerYear]);

  const row = records[0] ?? null;
  const sellerLabel =
    sellerName || sellerCode
      ? `${sellerName || "Πωλητής"}${sellerCode ? ` • ${sellerCode}` : ""}`
      : "Ετήσια εικόνα πωλήσεων";

  return (
    <div className="d-flex flex-column gap-3">
      <ReportHeader
        title="Πωλήσεις ανά έτος"
        subtitle={sellerLabel}
        icon="bi-graph-up-arrow"
      />

      {loading ? (
        <AppLoader label="Φόρτωση Power BI..." />
      ) : error ? (
        <ReportError message={error} onRetry={() => void loadSalesPerYear()} />
      ) : row ? (
        <>
          <section className="row g-3">
            <MetricCard
              label="Total Coloplast"
              value={formatNullableCurrency(row.totalColoplastSales)}
              icon="bi-cash-stack"
              accent="#7c3aed"
            />
            <MetricCard
              label="CLP Cover"
              value={formatNullableRatioPercent(row.totalClpCover)}
              icon="bi-bullseye"
              accent="#16a34a"
            />
            <MetricCard
              label="OC Cover"
              value={formatNullableRatioPercent(row.ocCover)}
              icon="bi-pie-chart"
              accent="#2563eb"
            />
            <MetricCard
              label="IC PER NEW"
              value={formatNullableNumber(row.icPerNew)}
              icon="bi-person-plus"
              accent="#f97316"
            />
          </section>

          <SalesPerYearTargetPanel
            title="Total Coloplast"
            subtitle="Sales, target και forecast"
            icon="bi-cash-stack"
            accent="#7c3aed"
            actualLabel="Sales"
            actual={row.totalColoplastSales}
            target={row.totalClpTarget}
            forecast={row.totalClpSalesForecast}
            coverage={row.totalClpCover}
            formatValue={formatNullableCurrency}
          />

          <SalesPerYearTargetPanel
            title="OC PER"
            subtitle="PER, target και forecast"
            icon="bi-activity"
            accent="#2563eb"
            actualLabel="OC PER"
            actual={row.ocPer}
            target={row.ocPerTarget}
            forecast={row.ocPerForecast}
            coverage={row.ocCover}
            formatValue={(value) => formatNullableNumber(value)}
          />

          <SalesPerYearTargetPanel
            title="IC PER NEW"
            subtitle="Νέο PER σε σχέση με target"
            icon="bi-person-plus"
            accent="#f97316"
            actualLabel="IC PER NEW"
            actual={row.icPerNew}
            target={row.icPerTargetNew}
            coverage={undefined}
            formatValue={(value) => formatNullableNumber(value)}
          />

          <section className="d-flex flex-column gap-2">
            <SalesPerYearProductCard
              title="Genadyne"
              sales={row.genadyneSales}
              target={row.genadyneTarget}
              coverage={row.genadyneCover}
              accent="#0891b2"
            />
            <SalesPerYearProductCard
              title="UNO"
              sales={row.unoSales}
              target={row.unoTargetSales}
              coverage={row.unoCover}
              accent="#dc2626"
            />
          </section>

          <SalesPerYearDetailsTable row={row} />
        </>
      ) : (
        <div className="app-card text-secondary p-3 text-center">
          Δεν βρέθηκαν ετήσια στοιχεία πωλήσεων.
        </div>
      )}
    </div>
  );
}
