"use client";

import React from "react";
import { Alert } from "react-bootstrap";

import { CollapsibleAppTile } from "@/components/ui/CollapsibleAppTile";
import { parseProxyJson } from "@/lib/api/client";
import { formatElGRDateTime } from "@/lib/utils/date";
import { displayValue } from "@/lib/utils/string";
import type { Checkpoint, GetGtTrackAndTraceSuccess } from "@/types/api";

type TraceState = {
  loading: boolean;
  error: string | null;
  data: GetGtTrackAndTraceSuccess | null;
};

const TRACK_STATUS_DELIVERED = "ΠΑΡΑΔΟΜΕΝΟ";
const TRACK_STATUS_PENDING = "ΠΡΟΣ ΠΑΡΑΔΟΣΗ";

function normalizeTrackStatus(value: string | null | undefined): string {
  return String(value ?? "")
    .trim()
    .toLocaleUpperCase("el-GR");
}

function resolveTrackStatusLabel(
  status: string | null | undefined,
  statusCode: string | null | undefined,
): string {
  const normalizedStatus = normalizeTrackStatus(status);
  if (normalizedStatus) return normalizedStatus;

  return normalizeTrackStatus(statusCode);
}

function getStatusTone(
  status: string | null | undefined,
  statusCode: string | null | undefined,
): string {
  const label = resolveTrackStatusLabel(status, statusCode);

  if (label === TRACK_STATUS_PENDING) return "warning";
  if (label === TRACK_STATUS_DELIVERED) return "success";

  return "secondary";
}

function getStatusIcon(tone: string): string {
  if (tone === "success") return "bi-check-circle-fill";
  if (tone === "warning") return "bi-hourglass-split";
  return "bi-clock-history";
}

function sortCheckpoints(items: Checkpoint[]): Checkpoint[] {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.statusDate).getTime();
    const bTime = new Date(b.statusDate).getTime();
    return (
      (Number.isFinite(bTime) ? bTime : 0) -
      (Number.isFinite(aTime) ? aTime : 0)
    );
  });
}

function SummaryItem({
  icon,
  label,
  value,
  copyable = false,
}: {
  icon: string;
  label: string;
  value: unknown;
  copyable?: boolean;
}) {
  const [copied, setCopied] = React.useState(false);
  const text = String(value ?? "").trim();
  const showCopy = copyable && text !== "";

  async function handleCopy() {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="track-trace-summary__item">
      <div className="track-trace-summary__label">
        <i className={`bi ${icon}`} aria-hidden />
        <span>{label}</span>
      </div>
      <div className="track-trace-summary__value d-flex align-items-center gap-2">
        <span className="text-break">{displayValue(value)}</span>
        {showCopy ? (
          <button
            type="button"
            className="btn btn-outline-secondary track-trace-copy-btn"
            aria-label={copied ? "Αντιγράφηκε" : "Αντιγραφή voucher"}
            title={copied ? "Αντιγράφηκε" : "Αντιγραφή"}
            onClick={() => void handleCopy()}
          >
            <i
              className={`bi ${copied ? "bi-check2" : "bi-clipboard"}`}
              aria-hidden
            />
          </button>
        ) : null}
      </div>
    </div>
  );
}

function CheckpointItem({
  checkpoint,
  isLatest,
  isLast,
}: {
  checkpoint: Checkpoint;
  isLatest: boolean;
  isLast: boolean;
}) {
  const tone = getStatusTone(checkpoint.status, checkpoint.statusCode);

  return (
    <div
      className={`track-trace-step${isLast ? "track-trace-step--last" : ""}`}
    >
      <div className={`track-trace-step__dot track-trace-step__dot--${tone}`}>
        <i className={`bi ${getStatusIcon(tone)}`} aria-hidden />
      </div>
      <div className="track-trace-step__body">
        <div className="d-flex align-items-start justify-content-between gap-2">
          <div style={{ minWidth: 0 }}>
            <div className="fw-semibold">{displayValue(checkpoint.status)}</div>
          </div>
          {isLatest ? (
            <span className="badge rounded-pill text-bg-primary flex-shrink-0">
              Τελευταίο
            </span>
          ) : null}
        </div>
        <div className="text-secondary small mt-1">
          <i className="bi bi-calendar3 me-1" aria-hidden />
          {formatElGRDateTime(checkpoint.statusDate)}
        </div>
        {checkpoint.shop ? (
          <div className="text-secondary small mt-1">
            <i className="bi bi-shop me-1" aria-hidden />
            {checkpoint.shop}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function TrackingTraceContent({
  state,
  onRetry,
}: {
  state: TraceState;
  onRetry: () => void;
}) {
  if (!state.data && !state.error) {
    return (
      <div className="d-flex align-items-center text-secondary gap-2 py-1">
        <span className="spinner-border spinner-border-sm" aria-hidden />
        <span style={{ fontSize: 13 }}>Φόρτωση ιστορικού αποστολής...</span>
      </div>
    );
  }

  if (state.error) {
    return (
      <Alert variant="danger" className="mb-0 py-2">
        <div style={{ fontSize: 13 }}>{state.error}</div>
        <button
          type="button"
          className="btn btn-sm btn-outline-danger mt-2"
          onClick={onRetry}
        >
          Δοκιμή ξανά
        </button>
      </Alert>
    );
  }

  const info = state.data?.tracking_info;
  if (!state.data?.isSuccess || !info) {
    return (
      <Alert variant="warning" className="mb-0 py-2" style={{ fontSize: 13 }}>
        {displayValue(
          state.data?.errorMessage ||
            state.data?.message ||
            "Δεν βρέθηκαν στοιχεία παρακολούθησης.",
        )}
      </Alert>
    );
  }

  const checkpoints = sortCheckpoints(info.checkpoints ?? []);
  const statusTone = getStatusTone(info.status, String(info.result ?? ""));

  return (
    <div className="d-flex flex-column gap-3">
      <div className={`track-trace-status track-trace-status--${statusTone}`}>
        <div className="track-trace-status__icon">
          <i className={`bi ${getStatusIcon(statusTone)}`} aria-hidden />
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="text-secondary small">Τρέχουσα κατάσταση</div>
          <div className="fw-semibold">{displayValue(info.status)}</div>
        </div>
      </div>

      <div className="track-trace-summary">
        <SummaryItem
          icon="bi-person"
          label="Παραλήπτης"
          value={info.consignee}
        />
        <SummaryItem
          icon="bi-calendar-check"
          label="Ημ. παράδοσης"
          value={formatElGRDateTime(info.deliveryDate)}
        />
        {info.returningServiceVoucher ? (
          <SummaryItem
            icon="bi-arrow-return-left"
            label="Voucher επιστροφής"
            value={info.returningServiceVoucher}
            copyable
          />
        ) : null}
      </div>

      {checkpoints.length ? (
        <div>
          <div className="fw-semibold mb-2" style={{ fontSize: 13 }}>
            Ιστορικό κινήσεων
          </div>
          <div className="track-trace-timeline">
            {checkpoints.map((checkpoint, index) => (
              <CheckpointItem
                key={`${checkpoint.statusCode}-${checkpoint.statusDate}-${index}`}
                checkpoint={checkpoint}
                isLatest={index === 0}
                isLast={index === checkpoints.length - 1}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-secondary small">
          Δεν υπάρχουν καταχωρημένα σημεία.
        </div>
      )}

      {state.loading ? (
        <div className="text-secondary small">Ενημέρωση...</div>
      ) : null}
    </div>
  );
}

export default function TrackingTraceAccordion({
  voucher,
}: {
  voucher: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [state, setState] = React.useState<TraceState>({
    loading: false,
    error: null,
    data: null,
  });

  const fetchedVoucherRef = React.useRef<string | null>(null);

  const loadTrace = React.useCallback(
    async (force = false) => {
      const trimmed = voucher.trim();
      if (!trimmed || trimmed === "-") return;
      if (force) {
        fetchedVoucherRef.current = null;
      } else if (fetchedVoucherRef.current === trimmed) {
        return;
      }

      setState((prev) => ({
        loading: true,
        error: null,
        data: force ? null : prev.data,
      }));

      try {
        const params = new URLSearchParams({ voucher: trimmed });
        const res = await fetch(
          `/api/gt-track-and-trace?${params.toString()}`,
          {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          },
        );
        const data = await parseProxyJson<GetGtTrackAndTraceSuccess>(
          res,
          "Failed to load tracking info",
        );

        fetchedVoucherRef.current = trimmed;
        setState({
          loading: false,
          error: null,
          data,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load tracking info";
        setState((prev) => ({
          loading: false,
          error: message,
          data: prev.data,
        }));
      }
    },
    [voucher],
  );

  React.useEffect(() => {
    if (open) void loadTrace();
  }, [open, loadTrace]);

  return (
    <CollapsibleAppTile
      inset="compact"
      className="app-card-soft mt-1"
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen && fetchedVoucherRef.current !== voucher.trim()) {
          setState({ loading: true, error: null, data: null });
        }
      }}
      summary={(expanded) => (
        <div
          className="d-flex align-items-center w-100 gap-2"
          style={{ minWidth: 0 }}
        >
          <div
            className="text-primary d-flex align-items-center flex-shrink-0 gap-1"
            style={{ fontSize: 15 }}
          >
            <i className="bi bi-truck" aria-hidden />
            <span>Tracking Voucher Γεν.Ταχ.</span>
          </div>
          <div
            className="fw-medium text-break ms-auto text-end"
            style={{ color: "var(--bs-body-color)", fontSize: 13, minWidth: 0 }}
          >
            {voucher}
          </div>
          <i
            className="bi bi-chevron-down text-secondary d-inline-block flex-shrink-0"
            style={{
              fontSize: "1rem",
              transition: "transform 160ms ease",
              transform: expanded ? "rotate(-180deg)" : "none",
            }}
            aria-hidden
          />
        </div>
      )}
    >
      {open ? (
        <TrackingTraceContent
          state={state}
          onRetry={() => void loadTrace(true)}
        />
      ) : null}
    </CollapsibleAppTile>
  );
}
