"use client";

import React from "react";
import Link from "next/link";

import AppLoader from "@/components/ui/AppLoader";
import { parseProxyJson } from "@/lib/api/client";
import {
  formatCurrencyGR,
  formatIntGR,
  formatPercentGR,
} from "@/lib/utils/number";
import { Alert } from "react-bootstrap";

type MonthlySalesRow = {
  sellerCode: string;
  sellerName: string;
  month: string;
  sales: number;
};

type ReportTile = {
  key: string;
  title: string;
  subtitle: string;
  icon: string;
  accent: string;
  href: string;
};

type SalesPerMonthResponse = {
  ok: true;
  sellerCode: string;
  sellerName: string;
  records: MonthlySalesRow[];
};

const accentColors = [
  "#2563eb",
  "#16a34a",
  "#f97316",
  "#7c3aed",
  "#0f766e",
  "#dc2626",
];

const greekMonthNames = [
  "Ιανουάριος",
  "Φεβρουάριος",
  "Μάρτιος",
  "Απρίλιος",
  "Μάιος",
  "Ιούνιος",
  "Ιούλιος",
  "Αύγουστος",
  "Σεπτέμβριος",
  "Οκτώβριος",
  "Νοέμβριος",
  "Δεκέμβριος",
];

const englishMonthIndex: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

function formatCurrency(value: number) {
  return `${formatCurrencyGR(value)}€`;
}

function getMonthLabel(month: string) {
  const trimmed = month.trim();
  const numericPrefix = trimmed.match(/^0?([1-9]|1[0-2])\b/);
  if (numericPrefix) {
    return greekMonthNames[Number(numericPrefix[1]) - 1];
  }

  const monthPart = trimmed.replace(/^\d+\s*/, "").replace(".", "").trim();
  const englishIndex = englishMonthIndex[monthPart.toLowerCase()];
  if (englishIndex != null) return greekMonthNames[englishIndex];

  return monthPart || trimmed;
}

function getDelta(current: number, previous?: number) {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}

function MetricCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon: string;
  accent: string;
}) {
  return (
    <div className="col-6">
      <div className="app-card h-100 p-3">
        <div className="d-flex align-items-start justify-content-between gap-2">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-3"
            style={{
              width: 38,
              height: 38,
              background: `${accent}1f`,
              color: accent,
            }}
          >
            <i className={`bi ${icon}`} aria-hidden />
          </div>
        </div>
        <div className="mt-3">
          <div className="small text-secondary" style={{ lineHeight: 1.1 }}>
            {label}
          </div>
          <div
            className="fw-bold mt-1"
            style={{ fontSize: "1.05rem", letterSpacing: "-0.01em" }}
          >
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportSelector({
  reports,
}: {
  reports: ReportTile[];
}) {
  return (
    <div className="app-card p-2">
      <div className="d-flex flex-column gap-2">
        {reports.map((report) => (
          <Link
            key={report.key}
            href={report.href}
            className="rounded-4 bg-body-tertiary d-flex align-items-center gap-3 p-2 text-start text-decoration-none"
            style={{ color: "var(--bs-body-color)" }}
          >
            <span
              className="d-inline-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
              style={{
                width: 42,
                height: 42,
                background: `${report.accent}18`,
                color: report.accent,
                border: `1px solid ${report.accent}33`,
              }}
            >
              <i className={`bi ${report.icon}`} aria-hidden />
            </span>
            <span className="min-w-0 flex-grow-1">
              <span className="d-flex align-items-center justify-content-between gap-2">
                <span className="fw-semibold text-truncate">
                  {report.title}
                </span>
              </span>
              <span
                className="d-block small text-secondary text-truncate"
                style={{ lineHeight: 1.2 }}
              >
                {report.subtitle}
              </span>
            </span>
            <i
              className="bi bi-chevron-right text-secondary flex-shrink-0"
              aria-hidden
            />
          </Link>
        ))}
      </div>
    </div>
  );
}

const reportTiles: ReportTile[] = [
  {
    key: "sales-per-month",
    title: "Πωλήσεις ανά μήνα",
    subtitle: "Sales measure ανά Calendar month",
    icon: "bi-bar-chart-line",
    accent: "#2563eb",
    href: "/bi-reports/sales-per-month",
  },
  {
    key: "sales-per-date",
    title: "Πωλήσεις ανά ημέρα",
    subtitle: "Ετήσια εικόνα πωλήσεων",
    icon: "bi-calendar3",
    accent: "#0891b2",
    href: "/bi-reports/sales-per-date",
  },
  {
    key: "sales-per-year",
    title: "Πωλήσεις ανά έτος",
    subtitle: "Ετήσια εικόνα πωλήσεων",
    icon: "bi-calendar3",
    accent: "#7c3aed",
    href: "/bi-reports/sales-per-year",
  },
  {
    key: "akrateia",
    title: "Ακράτεια",
    subtitle: "Ανάλυση κατηγορίας και πελατών",
    icon: "bi-droplet",
    accent: "#dc2626",
    href: "/bi-reports/akrateia",
  },
];

function MonthlySalesChart({ rows }: { rows: MonthlySalesRow[] }) {
  const maxSales = Math.max(...rows.map((row) => row.sales), 1);

  return (
    <div className="app-card p-3">
      <div className="d-flex align-items-start justify-content-between gap-3">
        <div>
          <div className="fw-semibold">Πωλήσεις ανά μήνα</div>
          <div className="small text-secondary">Power BI dataset</div>
        </div>
        <span className="badge rounded-pill bg-body-tertiary text-body border">
          {formatIntGR(rows.length)} μήνες
        </span>
      </div>

      <div className="d-flex flex-column mt-3 gap-3">
        {rows.map((row, index) => {
          const width = Math.max(8, (row.sales / maxSales) * 100);
          const accent = accentColors[index % accentColors.length];

          return (
            <div key={row.month}>
              <div className="d-flex align-items-center justify-content-between small mb-1 gap-2">
                <span className="fw-semibold">{getMonthLabel(row.month)}</span>
                <span className="text-body fw-semibold">
                  {formatCurrency(row.sales)}
                </span>
              </div>
              <div
                className="rounded-pill bg-body-tertiary"
                style={{ height: 11, overflow: "hidden" }}
                role="presentation"
              >
                <div
                  className="h-100 rounded-pill"
                  style={{
                    width: `${width}%`,
                    background: accent,
                    boxShadow: `0 6px 16px ${accent}40`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MonthSalesCard({
  row,
  index,
  total,
  previous,
}: {
  row: MonthlySalesRow;
  index: number;
  total: number;
  previous?: MonthlySalesRow;
}) {
  const share = total > 0 ? (row.sales / total) * 100 : 0;
  const delta = getDelta(row.sales, previous?.sales);
  const accent = accentColors[index % accentColors.length];
  const deltaClass =
    delta == null
      ? "bg-body text-secondary border"
      : delta >= 0
        ? "text-bg-success"
        : "text-bg-danger";

  return (
    <div className="app-card p-3">
      <div className="d-flex align-items-start justify-content-between gap-3">
        <div className="d-flex align-items-center gap-3 min-w-0">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-3 flex-shrink-0 fw-bold"
            style={{
              minWidth: 116,
              height: 46,
              background: `${accent}1f`,
              color: accent,
              paddingInline: 12,
              whiteSpace: "nowrap",
            }}
          >
            {getMonthLabel(row.month)}
          </div>
        </div>
        <div className="text-end flex-shrink-0">
          <div className="fw-bold">{formatCurrency(row.sales)}</div>
          <span
            className={`badge rounded-pill mt-1 ${deltaClass}`}
            style={{ fontSize: 11 }}
          >
            {delta == null
              ? "βάση"
              : `${delta > 0 ? "+" : ""}${formatPercentGR(delta)}%`}
          </span>
        </div>
      </div>

      <div className="d-flex align-items-center justify-content-between small text-secondary mt-3">
        <span>Μερίδιο περιόδου</span>
        <span className="fw-semibold text-body">{formatPercentGR(share)}%</span>
      </div>
      <div
        className="rounded-pill bg-body-tertiary mt-1"
        style={{ height: 7, overflow: "hidden" }}
        role="presentation"
      >
        <div
          className="h-100 rounded-pill"
          style={{ width: `${share}%`, background: accent }}
        />
      </div>
    </div>
  );
}

function DataRows({ rows }: { rows: MonthlySalesRow[] }) {
  return (
    <div className="app-card p-3">
      <div className="d-flex align-items-start justify-content-between gap-3">
        <div>
          <div className="fw-semibold">Αναλυτικές γραμμές</div>
          <div className="small text-secondary">Πωλήσεις ανά μήνα</div>
        </div>
        <i className="bi bi-table text-secondary" aria-hidden />
      </div>

      <div className="d-flex flex-column mt-3 gap-2">
        {rows.map((row) => (
          <div
            key={`${row.sellerCode}-${row.month}`}
            className="rounded-4 bg-body-tertiary p-2"
          >
            <div className="d-flex align-items-center justify-content-between gap-2">
              <div className="min-w-0">
               
                <div className="small text-secondary">{row.month}</div>
              </div>
              <div className="fw-semibold flex-shrink-0">
                {formatCurrency(row.sales)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SalesPerMonthReportPage() {
  const [records, setRecords] = React.useState<MonthlySalesRow[]>([]);
  const [sellerCode, setSellerCode] = React.useState("");
  const [sellerName, setSellerName] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadSalesPerMonth = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/bi-reports/sales-per-month", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      const data = await parseProxyJson<SalesPerMonthResponse>(
        res,
        "Failed to load Power BI sales per month",
      );

      setRecords(data.records ?? []);
      setSellerCode(data.sellerCode ?? "");
      setSellerName(data.sellerName ?? "");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load Power BI sales per month";
      setError(message);
      setRecords([]);
      setSellerCode("");
      setSellerName("");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadSalesPerMonth();
  }, [loadSalesPerMonth]);

  const totalSales = records.reduce((sum, row) => sum + row.sales, 0);
  const averageSales = records.length ? totalSales / records.length : 0;
  const bestMonth = records.reduce<MonthlySalesRow | null>(
    (best, row) => (!best || row.sales > best.sales ? row : best),
    null,
  );
  const latestMonth = records.at(-1);

  return (
    <div className="d-flex flex-column gap-3">
      <section className="app-card p-3">
        <div className="d-flex align-items-start justify-content-between gap-3">
          <div className="min-w-0">
            <div className="d-flex align-items-center flex-wrap gap-2">
              <h1 className="h4 fw-bold mb-0">Πωλήσεις ανά μήνα</h1>
              <span className="badge rounded-pill bg-primary-subtle text-primary-emphasis">
                BI Reports
              </span>
            </div>
            <div className="text-secondary mt-1" style={{ fontSize: 13 }}>
              Πωλήσεις πωλητή ανά μήνα
            </div>
          </div>
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-4 bg-body-tertiary flex-shrink-0"
            style={{ width: 48, height: 48 }}
          >
            <i className="bi bi-clipboard-data" aria-hidden />
          </div>
        </div>
      </section>

      {loading ? (
        <AppLoader label="Φόρτωση Power BI..." />
      ) : error ? (
        <Alert variant="danger" className="mb-0">
          <div>{error}</div>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger mt-2"
            onClick={() => void loadSalesPerMonth()}
          >
            Δοκιμή ξανά
          </button>
        </Alert>
      ) : records.length ? (
        <>
          <section className="row g-3">
            <MetricCard
              label="Σύνολο περιόδου"
              value={formatCurrency(totalSales)}
              icon="bi-cash-stack"
              accent="#2563eb"
            />
            <MetricCard
              label="Μέσος μήνας"
              value={formatCurrency(averageSales)}
              icon="bi-activity"
              accent="#16a34a"
            />
            <MetricCard
              label="Καλύτερος μήνας"
              value={bestMonth ? getMonthLabel(bestMonth.month) : "-"}
              icon="bi-stars"
              accent="#f97316"
            />
            <MetricCard
              label="Τελευταίος μήνας"
              value={latestMonth ? formatCurrency(latestMonth.sales) : "-"}
              icon="bi-calendar2-week"
              accent="#7c3aed"
            />
          </section>

          <MonthlySalesChart rows={records} />

          <section className="d-flex flex-column gap-2">
            {records.map((row, index) => (
              <MonthSalesCard
                key={`${row.sellerCode}-${row.month}`}
                row={row}
                index={index}
                total={totalSales}
                previous={records[index - 1]}
              />
            ))}
          </section>

          <DataRows rows={records} />
        </>
      ) : (
        <div className="app-card text-secondary p-3 text-center">
          Δεν βρέθηκαν στοιχεία πωλήσεων.
        </div>
      )}
    </div>
  );
}

export default function BiReportsPage() {
  return (
    <div className="d-flex flex-column gap-3">
      <section className="app-card p-3">
        <div className="d-flex align-items-start justify-content-between gap-3">
          <div className="min-w-0">
            <div className="d-flex align-items-center flex-wrap gap-2">
              <h1 className="h4 fw-bold mb-0">BI Reports</h1>
              <span className="badge rounded-pill bg-primary-subtle text-primary-emphasis">
                Power BI
              </span>
            </div>
            <div className="text-secondary mt-1" style={{ fontSize: 13 }}>
              Επιλογή αναφοράς πωλήσεων
            </div>
          </div>
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-4 bg-body-tertiary flex-shrink-0"
            style={{ width: 48, height: 48 }}
          >
            <i className="bi bi-clipboard-data" aria-hidden />
          </div>
        </div>
      </section>

      <ReportSelector reports={reportTiles} />
    </div>
  );
}
