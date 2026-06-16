"use client";

import React from "react";
import Link from "next/link";

import AppLoader from "@/components/ui/AppLoader";
import { parseProxyJson } from "@/lib/api/client";
import type {
  AkrateiaResponse,
  AkrateiaRow,
  MonthlySalesRow,
  ReportTile,
  SalesPerMonthResponse,
} from "@/lib/biReports";
import {
  formatCurrencyGR,
  formatIntGR,
  formatPercentGR,
} from "@/lib/utils/number";
import { Alert } from "react-bootstrap";

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

function formatNullableCurrency(value: number | null) {
  return value == null ? "-" : formatCurrency(value);
}

function formatNullableNumber(value: number | null, fractionDigits = 2) {
  if (value == null || !Number.isFinite(value)) return "-";

  return new Intl.NumberFormat("el-GR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

function formatNullableInt(value: number | null) {
  return value == null ? "-" : formatIntGR(value);
}

function formatNullableRatioPercent(value: number | null) {
  return value == null ? "-" : `${formatPercentGR(value * 100)}%`;
}

function getMonthLabel(month: string) {
  const trimmed = month.trim();
  const numericPrefix = trimmed.match(/^0?([1-9]|1[0-2])\b/);
  if (numericPrefix) {
    return greekMonthNames[Number(numericPrefix[1]) - 1];
  }

  const monthPart = trimmed
    .replace(/^\d+\s*/, "")
    .replace(".", "")
    .trim();
  const englishIndex = englishMonthIndex[monthPart.toLowerCase()];
  if (englishIndex != null) return greekMonthNames[englishIndex];

  return monthPart || trimmed;
}

function getDelta(current: number, previous?: number) {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}

function sumNullable<T>(rows: T[], selector: (row: T) => number | null) {
  return rows.reduce((sum, row) => sum + (selector(row) ?? 0), 0);
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

function ReportSelector({ reports }: { reports: ReportTile[] }) {
  return (
    <div className="app-card p-2">
      <div className="d-flex flex-column gap-2">
        {reports.map((report) => (
          <Link
            key={report.key}
            href={report.href}
            className="rounded-4 bg-body-tertiary d-flex align-items-center text-decoration-none gap-3 p-2 text-start"
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
    key: "akrateia",
    title: "Ακράτεια",
    subtitle: "CC sales, PER και εκτελέσεις",
    icon: "bi-droplet-half",
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
                  className="rounded-pill h-100"
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
        <div className="d-flex align-items-center min-w-0 gap-3">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-3 fw-bold flex-shrink-0"
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
        <div className="flex-shrink-0 text-end">
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
          className="rounded-pill h-100"
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

function AkrateiaValuePill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-4 bg-body-tertiary p-2">
      <div className="small text-secondary" style={{ lineHeight: 1.1 }}>
        {label}
      </div>
      <div className="fw-semibold text-truncate mt-1">{value}</div>
    </div>
  );
}

function AkrateiaTargetBar({
  label,
  actual,
  target,
  coverage,
  accent,
  formatValue,
}: {
  label: string;
  actual: number | null;
  target: number | null;
  coverage: number | null;
  accent: string;
  formatValue: (value: number | null) => string;
}) {
  const ratio =
    coverage ??
    (actual != null && target != null && target > 0 ? actual / target : null);
  const width = ratio == null ? 0 : Math.min(100, Math.max(0, ratio * 100));

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between small gap-2">
        <span className="fw-semibold">{label}</span>
        <span className="text-secondary flex-shrink-0">
          {formatNullableRatioPercent(ratio)}
        </span>
      </div>
      <div className="d-flex align-items-center justify-content-between small text-secondary mt-1 gap-2">
        <span>{formatValue(actual)}</span>
        <span>στόχος {formatValue(target)}</span>
      </div>
      <div
        className="rounded-pill bg-body-tertiary mt-2"
        style={{ height: 8, overflow: "hidden" }}
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

function AkrateiaMonthCard({
  row,
  index,
}: {
  row: AkrateiaRow;
  index: number;
}) {
  const accent = accentColors[(index + 2) % accentColors.length];
  const ccSales =
    row.ccNewSales == null && row.ccRepSales == null
      ? null
      : (row.ccNewSales ?? 0) + (row.ccRepSales ?? 0);

  return (
    <div className="app-card p-3">
      <div className="d-flex align-items-start justify-content-between gap-3">
        <div className="min-w-0">
          <div className="fw-bold">{getMonthLabel(row.month)}</div>
          <div className="small text-secondary">CC sales και targets</div>
        </div>
        <span
          className="badge rounded-pill flex-shrink-0"
          style={{
            background: `${accent}1f`,
            color: accent,
            border: `1px solid ${accent}33`,
          }}
        >
          {formatNullableRatioPercent(row.ccSalesCoverCM)}
        </span>
      </div>

      <div className="row g-2 mt-2">
        <div className="col-6">
          <AkrateiaValuePill
            label="CC NEW sales"
            value={formatNullableCurrency(row.ccNewSales)}
          />
        </div>
        <div className="col-6">
          <AkrateiaValuePill
            label="CC REP sales"
            value={formatNullableCurrency(row.ccRepSales)}
          />
        </div>
        <div className="col-6">
          <AkrateiaValuePill
            label="CC New PERi"
            value={formatNullableInt(row.ccNewPeri)}
          />
        </div>
        <div className="col-6">
          <AkrateiaValuePill
            label="CC EKTEL"
            value={formatNullableInt(row.ccEktel)}
          />
        </div>
      </div>

      <div className="d-flex flex-column mt-3 gap-3">
        <AkrateiaTargetBar
          label="CC Sales Target"
          actual={ccSales}
          target={row.ccSalesTarget}
          coverage={row.ccSalesCoverCM}
          accent="#dc2626"
          formatValue={formatNullableCurrency}
        />
        <AkrateiaTargetBar
          label="CC NEW PER Target"
          actual={row.ccNewPeri}
          target={row.ccNewPerTarget}
          coverage={row.ccNewPerCoverCM}
          accent="#7c3aed"
          formatValue={(value) => formatNullableNumber(value)}
        />
        <AkrateiaTargetBar
          label="CC Ektel Target"
          actual={row.ccEktel}
          target={row.ccEktelTarget}
          coverage={row.ccEktelTotalPerRunning}
          accent="#0891b2"
          formatValue={(value) => formatNullableNumber(value)}
        />
      </div>
    </div>
  );
}

function AkrateiaCompactTable({ rows }: { rows: AkrateiaRow[] }) {
  return (
    <div className="app-card p-3">
      <div className="d-flex align-items-start justify-content-between gap-3">
        <div>
          <div className="fw-semibold">Αναλυτικά στοιχεία</div>
          <div className="small text-secondary">
            Μηνιαίες τιμές από Power BI
          </div>
        </div>
        <i className="bi bi-table text-secondary" aria-hidden />
      </div>

      <div className="table-responsive mt-3">
        <table className="table-sm mb-0 table align-middle">
          <thead>
            <tr className="small text-secondary">
              <th>Μήνας</th>
              <th className="text-end">CC NEW</th>
              <th className="text-end">CC REP</th>
              <th className="text-end">Sales</th>
              <th className="text-end">EKTEL</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.month}>
                <td className="fw-semibold">{getMonthLabel(row.month)}</td>
                <td className="text-end">
                  {formatNullableCurrency(row.ccNewSales)}
                </td>
                <td className="text-end">
                  {formatNullableCurrency(row.ccRepSales)}
                </td>
                <td className="text-end">
                  {formatNullableCurrency(row.sales)}
                </td>
                <td className="text-end">{formatNullableInt(row.ccEktel)}</td>
              </tr>
            ))}
          </tbody>
        </table>
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

export function AkrateiaReportPage() {
  const [records, setRecords] = React.useState<AkrateiaRow[]>([]);
  const [sellerCode, setSellerCode] = React.useState("");
  const [sellerName, setSellerName] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadAkrateia = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/bi-reports/akrateia", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      const data = await parseProxyJson<AkrateiaResponse>(
        res,
        "Failed to load Power BI akrateia report",
      );

      setRecords(data.records ?? []);
      setSellerCode(data.sellerCode ?? "");
      setSellerName(data.sellerName ?? "");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load Power BI akrateia report";
      setError(message);
      setRecords([]);
      setSellerCode("");
      setSellerName("");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadAkrateia();
  }, [loadAkrateia]);

  const totalCcNewSales = sumNullable(records, (row) => row.ccNewSales);
  const totalCcRepSales = sumNullable(records, (row) => row.ccRepSales);
  const totalCcSales = totalCcNewSales + totalCcRepSales;
  const totalCcSalesTarget = sumNullable(records, (row) => row.ccSalesTarget);
  const totalSalesCover =
    totalCcSalesTarget > 0 ? totalCcSales / totalCcSalesTarget : null;
  const totalSales = sumNullable(records, (row) => row.sales);
  const totalEktel = sumNullable(records, (row) => row.ccEktel);
  const sellerLabel =
    sellerName || sellerCode
      ? `${sellerName || "Πωλητής"}${sellerCode ? ` • ${sellerCode}` : ""}`
      : "CC sales, PER και εκτελέσεις ανά μήνα";

  return (
    <div className="d-flex flex-column gap-3">
      <section className="app-card p-3">
        <div className="d-flex align-items-start justify-content-between gap-3">
          <div className="min-w-0">
            <div className="d-flex align-items-center flex-wrap gap-2">
              <h1 className="h4 fw-bold mb-0">Ακράτεια</h1>
              <span className="badge rounded-pill bg-danger-subtle text-danger-emphasis">
                BI Reports
              </span>
            </div>
            <div className="text-secondary mt-1" style={{ fontSize: 13 }}>
              {sellerLabel}
            </div>
          </div>
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-4 bg-body-tertiary flex-shrink-0"
            style={{ width: 48, height: 48 }}
          >
            <i className="bi bi-droplet-half" aria-hidden />
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
            onClick={() => void loadAkrateia()}
          >
            Δοκιμή ξανά
          </button>
        </Alert>
      ) : records.length ? (
        <>
          <section className="row g-3">
            <MetricCard
              label="CC Sales"
              value={formatCurrency(totalCcSales)}
              icon="bi-cash-stack"
              accent="#dc2626"
            />
            <MetricCard
              label="Κάλυψη στόχου"
              value={formatNullableRatioPercent(totalSalesCover)}
              icon="bi-bullseye"
              accent="#16a34a"
            />
            <MetricCard
              label="Sales"
              value={formatCurrency(totalSales)}
              icon="bi-graph-up-arrow"
              accent="#2563eb"
            />
            <MetricCard
              label="CC EKTEL"
              value={formatIntGR(totalEktel)}
              icon="bi-check2-circle"
              accent="#0891b2"
            />
          </section>

          <section className="d-flex flex-column gap-2">
            {records.map((row, index) => (
              <AkrateiaMonthCard
                key={`${row.month}-${index}`}
                row={row}
                index={index}
              />
            ))}
          </section>

          <AkrateiaCompactTable rows={records} />
        </>
      ) : (
        <div className="app-card text-secondary p-3 text-center">
          Δεν βρέθηκαν στοιχεία ακράτειας.
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
