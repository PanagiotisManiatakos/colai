"use client";

import React from "react";
import AppLoader from "@/components/ui/AppLoader";
import { formatLastCustomerWebOrderRow } from "@/lib/customerUtils";
import {
  getAmkaInlineFieldError,
  isValidAmka,
  normalizeAmka,
} from "@/lib/utils/amka";
import { useAppDispatch } from "@/store/hooks";
import { setCustomerAmkaGateCompleted } from "@/store/orders/ordersSlice";
import type { CustomerSearchResult } from "@/types/api/responses";
import {
  applyCompletelyNewCustomerFromAmka,
  applyCustomerFromSearch,
  applyLastCustomerWebOrderFromSearch,
  searchCustomersByQuery,
} from "../modals/customerSearchActions";

export default function CustomerAmkaGate() {
  const dispatch = useAppDispatch();
  const [amka, setAmka] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [applying, setApplying] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [results, setResults] = React.useState<CustomerSearchResult[]>([]);
  const [lastCustomerWebOrder, setLastCustomerWebOrder] = React.useState<
    Record<string, unknown> | null
  >(null);
  const [hasSearched, setHasSearched] = React.useState(false);

  const normalizedAmka = normalizeAmka(amka);
  const amkaError = getAmkaInlineFieldError(amka);
  const amkaIsValid = isValidAmka(amka);

  React.useEffect(() => {
    if (!amkaIsValid) {
      setResults([]);
      setLastCustomerWebOrder(null);
      setHasSearched(false);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const query = normalizedAmka;

    (async () => {
      setLoading(true);
      setError(null);
      setHasSearched(false);
      try {
        const outcome = await searchCustomersByQuery(query);
        if (cancelled) return;
        setResults(outcome.results);
        setLastCustomerWebOrder(outcome.lastCustomerWebOrder);
        setError(outcome.error);
        setHasSearched(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [amkaIsValid, normalizedAmka]);

  const completeGate = React.useCallback(() => {
    dispatch(setCustomerAmkaGateCompleted(true));
  }, [dispatch]);

  async function handleSelectCustomer(c: CustomerSearchResult) {
    setApplying(true);
    try {
      await applyCustomerFromSearch(dispatch, c);
      completeGate();
    } finally {
      setApplying(false);
    }
  }

  async function handleSelectLastWebOrder(lwo: Record<string, unknown>) {
    setApplying(true);
    try {
      await applyLastCustomerWebOrderFromSearch(dispatch, lwo);
      completeGate();
    } finally {
      setApplying(false);
    }
  }

  function handleContinueAsNew() {
    applyCompletelyNewCustomerFromAmka(dispatch, normalizedAmka);
    completeGate();
  }

  const lastWebOrderRow = lastCustomerWebOrder
    ? formatLastCustomerWebOrderRow(lastCustomerWebOrder)
    : null;
  const showNoResults =
    hasSearched && !loading && !error && results.length === 0 && !lastWebOrderRow;

  return (
    <div className="app-card p-4">
      <div
        className="rounded-4 border p-4 text-center"
        style={{
          background:
            "linear-gradient(180deg, rgba(var(--bs-primary-rgb), 0.08) 0%, rgba(var(--bs-primary-rgb), 0.02) 100%)",
          borderColor: "rgba(var(--bs-primary-rgb), 0.15)",
        }}
      >
        <div
          className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
          style={{
            width: 56,
            height: 56,
            background: "rgba(var(--bs-primary-rgb), 0.12)",
            border: "1px solid rgba(var(--bs-primary-rgb), 0.18)",
          }}
        >
          <i className="bi bi-person-vcard fs-4 text-primary" />
        </div>

        <div className="fw-semibold fs-5 mb-2">Αναζητήστε με ΑΜΚΑ</div>
        <div className="text-secondary small mx-auto mb-4" style={{ maxWidth: 420 }}>
          Πριν συμπληρώσετε τα στοιχεία του ασθενή, εισάγετε τον ΑΜΚΑ για να
          ελέγξουμε αν υπάρχει ήδη στο σύστημα.
        </div>

        <div className="mx-auto text-start" style={{ maxWidth: 360 }}>
          <label className="form-label fw-semibold" htmlFor="customer-amka-gate">
            ΑΜΚΑ
          </label>
          <input
            id="customer-amka-gate"
            className={`form-control form-control-lg${amkaError ? " is-invalid" : amkaIsValid ? " is-valid" : ""}`}
            inputMode="numeric"
            autoComplete="off"
            placeholder="11 ψηφία"
            value={amka}
            aria-invalid={!!amkaError}
            onChange={(e) => setAmka(e.target.value.replace(/\D/g, "").slice(0, 11))}
          />
          {amkaError ? (
            <div className="invalid-feedback d-block">{amkaError}</div>
          ) : (
            <div className="form-text">Η αναζήτηση ξεκινά αυτόματα με έγκυρο ΑΜΚΑ.</div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="mt-4">
          <AppLoader label="Αναζήτηση ασθενή…" card={false} />
        </div>
      ) : null}

      {error ? (
        <div className="alert alert-danger small mt-4 mb-0 py-2">{error}</div>
      ) : null}

      {!loading && results.length > 0 ? (
        <div className="mt-4">
          <div className="small text-secondary mb-2">Επιλέξτε ασθενή</div>
          <div className="list-group">
            {results.map((r, idx) => (
              <button
                key={`${r.tR_GID ?? idx}`}
                type="button"
                className="list-group-item list-group-item-action"
                onClick={() => void handleSelectCustomer(r)}
                disabled={applying}
              >
                <div className="fw-semibold">{r.pE_NAME || "—"}</div>
                <div className="small text-secondary">
                  AMKA: {r.tR_StringField5 || "—"}
                </div>
                <div className="small text-secondary">
                  Διέυθυνση: {`${r.peS_CityCode ?? ""} ${r.peS_Address1 ?? ""}`}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {!loading && lastWebOrderRow && lastCustomerWebOrder ? (
        <div className="mt-4">
          <div className="small text-secondary mb-2">Προηγούμενη παραγγελία</div>
          <div className="list-group">
            <button
              type="button"
              className="list-group-item list-group-item-action"
              onClick={() => void handleSelectLastWebOrder(lastCustomerWebOrder)}
              disabled={applying}
            >
              <div className="d-flex align-items-center flex-wrap gap-2">
                <div className="fw-semibold">{lastWebOrderRow.name}</div>
                <span className="badge text-bg-success">Νέος/Προς EBS</span>
              </div>
              <div className="small text-secondary">
                AMKA: {lastWebOrderRow.amka}
              </div>
              <div className="small text-secondary">
                Διέυθυνση: {lastWebOrderRow.addressLine}
              </div>
            </button>
          </div>
        </div>
      ) : null}

      {showNoResults ? (
        <div className="mt-4 text-center">
          <div className="text-secondary small mb-3">
            Δεν βρέθηκε υπάρχων ασθενής με αυτόν τον ΑΜΚΑ.
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleContinueAsNew}
            disabled={applying}
          >
            Συνέχεια ως νέος ασθενής
          </button>
        </div>
      ) : null}

      {applying ? (
        <div className="small text-secondary d-flex align-items-center justify-content-center mt-3 gap-2">
          <span className="spinner-border spinner-border-sm" aria-hidden />
          Φόρτωση στοιχείων…
        </div>
      ) : null}
    </div>
  );
}
