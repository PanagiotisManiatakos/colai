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
  accentColors,
  formatCurrency,
  formatNullableCurrency,
  formatNullableInt,
  formatNullableNumber,
  formatNullableRatioPercent,
  getMonthLabel,
  sumNullable,
} from "@/lib/bi-reports/reportUtils";
import { parseProxyJson } from "@/lib/api/client";
import type {
  AkrateiaResponse,
  AkrateiaRow,
} from "@/lib/bi-reports/biReports";
import { formatIntGR } from "@/lib/utils/number";

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
          <ValuePill
            label="CC NEW sales"
            value={formatNullableCurrency(row.ccNewSales)}
          />
        </div>
        <div className="col-6">
          <ValuePill
            label="CC REP sales"
            value={formatNullableCurrency(row.ccRepSales)}
          />
        </div>
        <div className="col-6">
          <ValuePill
            label="CC New PERi"
            value={formatNullableInt(row.ccNewPeri)}
          />
        </div>
        <div className="col-6">
          <ValuePill label="CC EKTEL" value={formatNullableInt(row.ccEktel)} />
        </div>
      </div>

      <div className="d-flex flex-column mt-3 gap-3">
        <TargetBar
          label="CC Sales Target"
          actual={ccSales}
          target={row.ccSalesTarget}
          coverage={row.ccSalesCoverCM}
          accent="#dc2626"
          formatValue={formatNullableCurrency}
        />
        <TargetBar
          label="CC NEW PER Target"
          actual={row.ccNewPeri}
          target={row.ccNewPerTarget}
          coverage={row.ccNewPerCoverCM}
          accent="#7c3aed"
          formatValue={(value) => formatNullableNumber(value)}
        />
        <TargetBar
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
      <ReportHeader
        title="Ακράτεια"
        subtitle={sellerLabel}
        icon="bi-droplet-half"
        badgeClassName="bg-danger-subtle text-danger-emphasis"
      />

      {loading ? (
        <AppLoader label="Φόρτωση Power BI..." />
      ) : error ? (
        <ReportError message={error} onRetry={() => void loadAkrateia()} />
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
