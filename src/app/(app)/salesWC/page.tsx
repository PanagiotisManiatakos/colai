"use client";

import React from "react";
import { Alert } from "react-bootstrap";

import AppLoader from "@/components/ui/AppLoader";
import PullToRefresh from "@/components/ui/PullToRefresh";
import { SearchBar } from "@/components/ui/SearchBar";
import { parseProxyJson } from "@/lib/api/client";
import type { GetWcOrderListSuccess, SellerSalesWC } from "@/types/api";

const dateFmt = new Intl.DateTimeFormat("el-GR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function textValue(value: unknown): string {
  const text = String(value ?? "").trim();
  return text || "-";
}

function getColaiBadgeValue(value: unknown): string | null {
  const text = String(value ?? "").trim();
  if (!text) return null;

  const numeric = Number(text.replace(",", "."));
  if (Number.isFinite(numeric) && numeric === 0) return null;

  return text;
}

function getNewRepKind(value: unknown): "new" | "repeat" | "other" {
  const text = String(value ?? "").trim();
  if (text === "Νέο") return "new";
  if (text === "Επαναληπτικό") return "repeat";
  return "other";
}

function getNewRepBadgeClass(kind: ReturnType<typeof getNewRepKind>): string {
  if (kind === "new") {
    return "bg-primary-subtle text-primary-emphasis border border-primary-subtle";
  }

  if (kind === "repeat") {
    return "bg-warning-subtle text-warning-emphasis border border-warning-subtle";
  }

  return "bg-body-tertiary text-secondary border";
}

function parseSalesDate(value: string | null | undefined): number {
  const raw = String(value ?? "").trim();
  const match = raw.match(
    /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}):(\d{2}))?/,
  );
  if (!match) return 0;

  const [, year, month, day, hour = "0", minute = "0", second = "0"] = match;
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  );

  return Number.isFinite(date.getTime()) ? date.getTime() : 0;
}

function formatSalesDate(value: string | null | undefined): string {
  const raw = String(value ?? "").trim();
  if (!raw) return "-";

  const timestamp = parseSalesDate(raw);
  if (!timestamp) return raw;

  return dateFmt.format(new Date(timestamp));
}

function matchesQuery(sale: SellerSalesWC, query: string): boolean {
  const q = query.trim().toLocaleLowerCase("el-GR");
  if (!q) return true;

  return [
    sale.RegistrationDate,
    sale.SellerCode,
    sale.NEWREP,
    sale.ADCode,
    sale.ReferenceDocument,
    sale.TrackingNo,
    sale.Doctor,
    sale.CustomerName,
    sale.COLAI,
  ]
    .map((value) => textValue(value).toLocaleLowerCase("el-GR"))
    .join(" ")
    .includes(q);
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: unknown;
}) {
  return (
    <div className="col-6">
      <div className="app-card-soft h-100 p-3">
        <div
          className="text-secondary d-flex align-items-center gap-1"
          style={{ fontSize: 12 }}
        >
          <i className={`bi ${icon}`} aria-hidden />
          <span>{label}</span>
        </div>
        <div className="fw-medium text-break mt-1" style={{ fontSize: 13 }}>
          {textValue(value)}
        </div>
      </div>
    </div>
  );
}

function SalesWCCard({ sale }: { sale: SellerSalesWC }) {
  const colai = getColaiBadgeValue(sale.COLAI);
  const newRepKind = getNewRepKind(sale.NEWREP);
  const newRepLabel = textValue(sale.NEWREP);

  return (
    <article className="app-card p-3">
      <div className="d-flex align-items-start justify-content-between gap-2">
        <div style={{ minWidth: 0 }}>
          <div
            className="fw-semibold text-break"
            style={{ color: "var(--bs-body-color)", fontSize: 15 }}
          >
            {textValue(sale.CustomerName)}
          </div>
          <div className="mt-2">
            <span
              className={`badge ${getNewRepBadgeClass(newRepKind)}`}
              style={{ fontSize: 12 }}
            >
              {newRepLabel}
            </span>
          </div>
        </div>
        <div className="text-end flex-shrink-0">
          {colai ? (
            <div className="badge text-bg-primary" style={{ fontSize: 12 }}>
              COLAI {colai}
            </div>
          ) : null}
          <div className="text-secondary mt-1" style={{ fontSize: 12 }}>
            {formatSalesDate(sale.RegistrationDate)}
          </div>
        </div>
      </div>

      <div className="row g-2 mt-2">
        <DetailItem icon="bi-person-vcard" label="Γιατρός" value={sale.Doctor} />
        <DetailItem
          icon="bi-file-earmark-text"
          label="Παραστατικό"
          value={sale.ReferenceDocument}
        />
        <DetailItem icon="bi-truck" label="Tracking" value={sale.TrackingNo} />
        <DetailItem icon="bi-upc-scan" label="AD Code" value={sale.ADCode} />
      </div>
    </article>
  );
}

export default function SalesWCPage() {
  const [records, setRecords] = React.useState<SellerSalesWC[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [q, setQ] = React.useState("");

  const loadSales = React.useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    setError(null);

    try {
      const res = await fetch("/api/wc/order-list", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      const data = await parseProxyJson<GetWcOrderListSuccess>(
        res,
        "Failed to load seller sales",
      );

      setRecords(data.records ?? []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load seller sales";
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    void loadSales();
  }, [loadSales]);

  const visibleRecords = React.useMemo(
    () =>
      records
        .filter((sale) => matchesQuery(sale, q))
        .sort(
          (a, b) =>
            parseSalesDate(b.RegistrationDate) -
            parseSalesDate(a.RegistrationDate),
        ),
    [q, records],
  );

  const showInitialLoader = loading && records.length === 0;

  return (
    <>
      <div className="app-card mb-3 p-3">
        <div className="d-flex align-items-start justify-content-between gap-3">
          <div style={{ minWidth: 0 }}>
            <div className="h5 fw-bold mb-1">Πωλήσεις WC</div>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary flex-shrink-0"
            onClick={() => void loadSales(true)}
            disabled={loading || refreshing}
            aria-label="Ανανέωση πωλήσεων"
          >
            {refreshing ? (
              <span className="spinner-border spinner-border-sm" aria-hidden />
            ) : (
              <i className="bi bi-arrow-clockwise" aria-hidden />
            )}
          </button>
        </div>

      </div>

      <div className="d-flex align-items-center mb-2 flex-wrap gap-2">
        <div className="app-card flex-grow-1">
          <SearchBar
            placeholder="Αναζήτηση"
            value={q}
            onChange={setQ}
            onClear={() => setQ("")}
          />
        </div>
      </div>

      <PullToRefresh onRefresh={() => loadSales(true)} isRefreshing={refreshing}>
        {error ? (
          <Alert variant="danger" className="mb-3">
            <div>{error}</div>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger mt-2"
              onClick={() => void loadSales(true)}
            >
              Δοκιμή ξανά
            </button>
          </Alert>
        ) : showInitialLoader ? (
          <AppLoader label="Φόρτωση πωλήσεων..." />
        ) : visibleRecords.length ? (
          <div className="d-flex flex-column gap-2">
            {visibleRecords.map((sale, index) => (
              <SalesWCCard
                key={`${sale.ReferenceDocument}-${sale.TrackingNo}-${sale.ADCode}-${index}`}
                sale={sale}
              />
            ))}
          </div>
        ) : (
          <div className="app-card text-secondary p-3 text-center">
            Δεν βρέθηκαν πωλήσεις.
          </div>
        )}
      </PullToRefresh>
    </>
  );
}
