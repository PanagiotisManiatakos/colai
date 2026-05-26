"use client";

import React from "react";
import { Alert, Button, Modal } from "react-bootstrap";

type Props = {
  show: boolean;
  loading?: boolean;
  error?: string | null;
  otp?: string | null;
  amka?: string | null;
  barcode?: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  const displayValue = value?.trim() ? value.trim() : "—";

  return (
    <div className="d-flex justify-content-between border-bottom gap-3 py-2">
      <span className="text-secondary">{label}</span>
      <span className="fw-semibold text-break text-end">{displayValue}</span>
    </div>
  );
}

export default function SubmitOrderConfirmModal({
  show,
  loading = false,
  error,
  otp,
  amka,
  barcode,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      backdrop={loading ? "static" : true}
      keyboard={!loading}
      contentClassName="premium-modal"
    >
      <Modal.Header
        closeButton={!loading}
        style={{ borderBottom: "1px solid var(--bs-border-color-translucent)" }}
      >
        <Modal.Title className="fw-semibold h6 mb-0">
          Επιβεβαίωση αποθήκευσης
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="d-flex align-items-start gap-3">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
            style={{
              width: 44,
              height: 44,
              background: "rgba(var(--bs-success-rgb), .12)",
              border: "1px solid rgba(var(--bs-success-rgb), .18)",
            }}
          >
            <i className="bi bi-check2-circle text-success" />
          </div>

          <div style={{ minWidth: 0 }}>
            <div className="fw-semibold mb-1">
              Είστε σίγουροι ότι θέλετε να υποβάλετε την παραγγελία;
            </div>
            <div className="text-secondary small">
              Βεβαιωθείτε ότι όλα τα πεδία της παραγγελίας έχουν συμπληρωθεί
              σωστά.
            </div>
          </div>
        </div>

        <div className="app-card-soft mt-3 p-3">
          <SummaryRow label="OTP" value={otp} />
          <SummaryRow label="ΑΜΚΑ παραλήπτη" value={amka} />
          <SummaryRow label="Barcode" value={barcode} />
        </div>

        {error ? (
          <Alert className="mt-3 mb-0" variant="danger">
            {error}
          </Alert>
        ) : null}
      </Modal.Body>

      <Modal.Footer
        style={{ borderTop: "1px solid var(--bs-border-color-translucent)" }}
      >
        <Button
          variant="outline-secondary"
          onClick={onClose}
          disabled={loading}
          style={{ borderRadius: 12 }}
        >
          Ακύρωση
        </Button>
        <Button
          variant="success"
          onClick={onConfirm}
          disabled={loading}
          style={{ borderRadius: 12 }}
        >
          {loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden
              />
              Αποθήκευση…
            </>
          ) : (
            "Αποθήκευση"
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
