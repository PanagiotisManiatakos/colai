"use client";

import Image from "next/image";
import React from "react";
import { Alert } from "react-bootstrap";

import AppLoader from "@/components/ui/AppLoader";
import { CollapsibleAppTile } from "@/components/ui/CollapsibleAppTile";
import PullToRefresh from "@/components/ui/PullToRefresh";
import { SearchBar } from "@/components/ui/SearchBar";
import { parseProxyJson } from "@/lib/api/client";
import { formatCurrencyGR } from "@/lib/utils/number";
import type { GetWcOrderListSuccess, SellerSalesWC } from "@/types/api";

const dateFmt = new Intl.DateTimeFormat("el-GR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

type SortMode = "date" | "newrep";

function textValue(value: unknown): string {
  const text = String(value ?? "").trim();
  return text || "-";
}

function getColaiMarkerKind(value: unknown): "manual" | "app" | null {
  const text = String(value ?? "").trim();
  if (!text) return null;

  const numeric = Number(text.replace(",", "."));
  if (Number.isFinite(numeric) && numeric === 0) return "manual";

  return "app";
}

function isZeroColai(value: unknown): boolean {
  const text = String(value ?? "").trim();
  const numeric = Number(text.replace(",", "."));
  return Number.isFinite(numeric) && numeric === 0;
}

function getNewRepKind(value: unknown): "new" | "repeat" | "other" {
  const text = String(value ?? "").trim();
  if (text === "Νέο") return "new";
  if (text === "Επαναληπτικό") return "repeat";
  return "other";
}

function getNewRepBadgeClass(kind: ReturnType<typeof getNewRepKind>): string {
  if (kind === "new") {
    return "bg-danger-subtle text-danger-emphasis border border-danger-subtle";
  }

  if (kind === "repeat") {
    return "bg-success-subtle text-success-emphasis border border-success-subtle";
  }

  return "bg-body-tertiary text-secondary border";
}

function getNewRepSortRank(value: unknown): number {
  const kind = getNewRepKind(value);
  if (kind === "new") return 0;
  if (kind === "repeat") return 1;
  return 2;
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

function parseTurnOverValue(value: string | number | null | undefined): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  const raw = String(value ?? "").trim();
  if (!raw) return 0;

  const compact = raw.replace(/[€\s]/g, "");
  const normalized =
    compact.includes(",") && compact.includes(".")
      ? compact.replace(/\./g, "").replace(",", ".")
      : compact.replace(",", ".");
  const amount = Number(normalized);

  return Number.isFinite(amount) ? amount : 0;
}

function formatTurnOver(value: string | number | null | undefined): string {
  const text = String(value ?? "").trim();
  if (!text) return "-";

  return `${formatCurrencyGR(parseTurnOverValue(value))}€`;
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
    sale.TurnOver,
  ]
    .map((value) => textValue(value).toLocaleLowerCase("el-GR"))
    .join(" ")
    .includes(q);
}

function getSaleTileKey(sale: SellerSalesWC, index: number): string {
  return [
    sale.ReferenceDocument,
    sale.TrackingNo,
    sale.ADCode,
    sale.RegistrationDate,
    sale.CustomerName,
    index,
  ]
    .map((value) => String(value ?? "").trim())
    .join("-");
}

function DetailRow({
  icon,
  label,
  value,
  showDivider,
}: {
  icon: string;
  label: string;
  value: unknown;
  showDivider: boolean;
}) {
  return (
    <div
      className="d-flex align-items-start justify-content-between gap-3 py-2"
      style={
        showDivider
          ? { borderBottom: "1px solid var(--bs-border-color-translucent)" }
          : undefined
      }
    >
      <div
        className="text-secondary d-flex align-items-center gap-1 flex-shrink-0"
        style={{ fontSize: 12 }}
      >
        <i className={`bi ${icon}`} aria-hidden />
        <span>{label}</span>
      </div>
      <div
        className="fw-medium text-break text-end"
        style={{ color: "var(--bs-body-color)", fontSize: 13, minWidth: 0 }}
      >
        {textValue(value)}
      </div>
    </div>
  );
}

function SalesWCCard({
  sale,
  open,
  onOpenChange,
}: {
  sale: SellerSalesWC;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const colaiMarker = getColaiMarkerKind(sale.COLAI);
  const newRepKind = getNewRepKind(sale.NEWREP);
  const newRepLabel = textValue(sale.NEWREP);
  const turnOver = formatTurnOver(sale.TurnOver);
  const details = [
    {
      icon: "bi-calendar3",
      label: "Ημερομηνία",
      value: formatSalesDate(sale.RegistrationDate),
    },
    {
      icon: "bi-file-earmark-text",
      label: "Παραστατικό",
      value: sale.ReferenceDocument,
    },
    { icon: "bi-truck", label: "Tracking", value: sale.TrackingNo },
    { icon: "bi-upc-scan", label: "AD Code", value: sale.ADCode },
    ...(isZeroColai(sale.COLAI)
      ? []
      : [{ icon: "bi-phone", label: "COLAI", value: sale.COLAI }]),
  ];

  return (
    <CollapsibleAppTile
      open={open}
      onOpenChange={onOpenChange}
      summary={(expanded) => (
        <div className="w-100" style={{ minWidth: 0 }}>
          <div
            className="d-flex align-items-center flex-nowrap gap-1"
            style={{ minWidth: 0 }}
          >
            <span
              className="fw-semibold text-truncate"
              style={{
                color: "var(--bs-body-color)",
                fontSize: 15,
                minWidth: 0,
              }}
            >
              {textValue(sale.CustomerName)}
            </span>
            <span className="text-secondary flex-shrink-0">-</span>
            <span
              className="text-secondary text-truncate"
              style={{ fontSize: 13, minWidth: 0 }}
            >
              {textValue(sale.Doctor)}
            </span>
          </div>
          <div className="mt-2 d-flex align-items-center gap-2">
            <div
              className="d-flex align-items-center flex-wrap gap-1"
              style={{ minWidth: 0 }}
            >
              {colaiMarker ? (
                <span
                  className="badge rounded-pill bg-body-tertiary text-secondary border d-inline-flex align-items-center justify-content-center flex-shrink-0"
                  title={
                    colaiMarker === "app"
                      ? "Παραγγελία από την εφαρμογή"
                      : "Χωρίς COLAI"
                  }
                  aria-label={
                    colaiMarker === "app"
                      ? "Παραγγελία από την εφαρμογή"
                      : "COLAI 0"
                  }
                  style={{
                    fontSize: 12,
                    minWidth: 22,
                    minHeight: 20,
                    paddingInline: colaiMarker === "app" ? 3 : 7,
                  }}
                >
                  {colaiMarker === "app" ? (
                    <Image
                      src="/logo-icon.svg"
                      alt=""
                      width={16}
                      height={16}
                      aria-hidden
                    />
                  ) : (
                    "@"
                  )}
                </span>
              ) : null}
              <span
                className={`badge rounded-pill ${getNewRepBadgeClass(newRepKind)}`}
                style={{ fontSize: 12 }}
              >
                {newRepLabel}
              </span>
              <span
                className="badge rounded-pill bg-body-tertiary text-body border d-inline-flex align-items-center gap-1"
                style={{ fontSize: 12 }}
              >
                <i className="bi bi-cash-coin text-secondary" aria-hidden />
                <span className="text-secondary fw-medium">Ποσό:</span>
                <span className="fw-semibold">{turnOver}</span>
              </span>
            </div>
            <i
              className="bi bi-chevron-down text-secondary d-inline-block flex-shrink-0 ms-auto"
              style={{
                fontSize: "1rem",
                transition: "transform 160ms ease",
                transform: expanded ? "rotate(-180deg)" : "none",
              }}
              aria-hidden
            />
          </div>
        </div>
      )}
    >
      <div className="d-flex flex-column">
        {details.map((detail, index) => (
          <DetailRow
            key={detail.label}
            icon={detail.icon}
            label={detail.label}
            value={detail.value}
            showDivider={index < details.length - 1}
          />
        ))}
      </div>
    </CollapsibleAppTile>
  );
}

export default function SalesWCPage() {
  const [records, setRecords] = React.useState<SellerSalesWC[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [q, setQ] = React.useState("");
  const [sortMode, setSortMode] = React.useState<SortMode>("newrep");
  const [openTiles, setOpenTiles] = React.useState<Record<string, boolean>>({});

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
        .sort((a, b) => {
          if (sortMode === "newrep") {
            const byNewRep =
              getNewRepSortRank(a.NEWREP) - getNewRepSortRank(b.NEWREP);
            if (byNewRep !== 0) return byNewRep;
          }

          return (
            parseSalesDate(b.RegistrationDate) -
            parseSalesDate(a.RegistrationDate)
          );
        }),
    [q, records, sortMode],
  );

  const summary = React.useMemo(() => {
    return records.reduce(
      (acc, sale) => {
        const kind = getNewRepKind(sale.NEWREP);
        if (kind === "new") acc.newCount += 1;
        if (kind === "repeat") acc.repeatCount += 1;
        acc.turnOverTotal += parseTurnOverValue(sale.TurnOver);
        return acc;
      },
      { newCount: 0, repeatCount: 0, turnOverTotal: 0 },
    );
  }, [records]);

  const visibleTileKeys = React.useMemo(
    () => visibleRecords.map((sale, index) => getSaleTileKey(sale, index)),
    [visibleRecords],
  );
  const allTilesExpanded =
    visibleTileKeys.length > 0 &&
    visibleTileKeys.every((key) => !!openTiles[key]);

  const toggleVisibleTiles = React.useCallback(() => {
    const nextOpen = !allTilesExpanded;
    setOpenTiles((prev) => {
      const next = { ...prev };
      for (const key of visibleTileKeys) next[key] = nextOpen;
      return next;
    });
  }, [allTilesExpanded, visibleTileKeys]);

  const showInitialLoader = loading && records.length === 0;

  return (
    <>
      <div className="app-card mb-3 p-3">
        <div className="d-flex align-items-start gap-3">
          <div className="w-100" style={{ minWidth: 0 }}>
            <div
              className="d-flex align-items-center flex-nowrap gap-2"
              style={{ minWidth: 0, overflowX: "auto" }}
            >
              <div className="h5 fw-bold mb-0 flex-shrink-0">Sales WC</div>
              <div className="ms-auto d-flex align-items-center gap-1 flex-shrink-0">
                <span
                  className="badge rounded-pill bg-danger-subtle text-danger-emphasis border border-danger-subtle d-inline-flex align-items-center gap-1"
                  aria-label={`Νέο ${summary.newCount}`}
                  style={{ fontSize: 12 }}
                >
                  <span className="fw-medium">N:</span>
                  <span className="fw-semibold">{summary.newCount}</span>
                </span>
                <span
                  className="badge rounded-pill bg-success-subtle text-success-emphasis border border-success-subtle d-inline-flex align-items-center gap-1"
                  aria-label={`Επαναληπτικό ${summary.repeatCount}`}
                  style={{ fontSize: 12 }}
                >
                  <span className="fw-medium">E:</span>
                  <span className="fw-semibold">{summary.repeatCount}</span>
                </span>
                <span
                  className="badge rounded-pill bg-body-tertiary text-body border d-inline-flex align-items-center gap-1"
                  aria-label={`Σύνολο ${formatCurrencyGR(summary.turnOverTotal)} ευρώ`}
                  style={{ fontSize: 12 }}
                >
                  <span className="text-secondary fw-medium">Σύνολο:</span>
                  <span className="fw-semibold">
                    {formatCurrencyGR(summary.turnOverTotal)}€
                  </span>
                </span>
              </div>
            </div>
          </div>
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
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary flex-shrink-0"
          onClick={toggleVisibleTiles}
          disabled={!visibleTileKeys.length}
        >
          <i
            className={`bi ${allTilesExpanded ? "bi-arrows-collapse" : "bi-arrows-expand"}`}
            aria-hidden
          />
          <span className="visually-hidden">
            {allTilesExpanded ? "Σύμπτυξη όλων" : "Ανάπτυξη όλων"}
          </span>
        </button>
        <button
          type="button"
          className={`btn btn-sm flex-shrink-0 d-inline-flex align-items-center gap-1 ${
            sortMode === "newrep" ? "btn-primary" : "btn-outline-secondary"
          }`}
          onClick={() =>
            setSortMode((current) => (current === "newrep" ? "date" : "newrep"))
          }
          aria-pressed={sortMode === "newrep"}
          aria-label={
            sortMode === "newrep"
              ? "Ταξινόμηση ανά ημερομηνία"
              : "Ταξινόμηση ανά NEWREP"
          }
          title={
            sortMode === "newrep"
              ? "Πατήστε για ταξινόμηση ανά ημερομηνία"
              : "Πατήστε για ταξινόμηση ανά NEWREP"
          }
        >
          <i
            className={`bi ${sortMode === "newrep" ? "bi-filter" : "bi-sort-down"}`}
            aria-hidden
          />
          <span className="text-nowrap">
            {sortMode === "newrep" ? "Πρόσφατες" : "Ημερομηνία"}
          </span>
        </button>
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
            {visibleRecords.map((sale, index) => {
              const tileKey = getSaleTileKey(sale, index);
              return (
                <SalesWCCard
                  key={tileKey}
                  sale={sale}
                  open={!!openTiles[tileKey]}
                  onOpenChange={(open) =>
                    setOpenTiles((prev) => ({ ...prev, [tileKey]: open }))
                  }
                />
              );
            })}
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
