"use client";

import { Alert, Button, Modal } from "react-bootstrap";

type LeaveOrderWizardConfirmModalProps = {
  show: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onTempSave: () => void;
  tempSaveLoading?: boolean;
  tempSaveError?: string | null;
};

export default function LeaveOrderWizardConfirmModal({
  show,
  onCancel,
  onConfirm,
  onTempSave,
  tempSaveLoading = false,
  tempSaveError = null,
}: LeaveOrderWizardConfirmModalProps) {
  const busy = tempSaveLoading;

  return (
    <Modal
      show={show}
      onHide={busy ? undefined : onCancel}
      centered
      contentClassName="premium-modal"
      backdrop={busy ? "static" : true}
      keyboard={!busy}
    >
      <Modal.Header closeButton={!busy}>
        <Modal.Title className="fw-semibold h6 mb-0">
          Αποχώρηση από παραγγελία
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p className="mb-0">
          Είστε σίγουροι ότι θέλετε να αποχωρήσετε; Τα μη αποθηκευμένα στοιχεία
          της παραγγελίας θα χαθούν.
        </p>
        {tempSaveError ? (
          <Alert variant="danger" className="mb-0 mt-3">
            {tempSaveError}
          </Alert>
        ) : null}
      </Modal.Body>

      <Modal.Footer className="flex-wrap gap-2">
        <Button variant="outline-secondary" onClick={onCancel} disabled={busy}>
          Ακύρωση
        </Button>
        <Button
          variant="outline-primary"
          onClick={onTempSave}
          disabled={busy}
        >
          {busy ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden
              />
              Αποθήκευση…
            </>
          ) : (
            "Προσωρινή αποθήκευση"
          )}
        </Button>
        <Button variant="primary" onClick={onConfirm} disabled={busy}>
          Αποχώρηση
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
