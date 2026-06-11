"use client";

import { Button, Modal } from "react-bootstrap";

type LeaveOrderWizardConfirmModalProps = {
  show: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function LeaveOrderWizardConfirmModal({
  show,
  onCancel,
  onConfirm,
}: LeaveOrderWizardConfirmModalProps) {
  return (
    <Modal
      show={show}
      onHide={onCancel}
      centered
      contentClassName="premium-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title className="fw-semibold h6 mb-0">
          Αποχώρηση από παραγγελία
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        Είστε σίγουροι ότι θέλετε να αποχωρήσετε; Τα μη αποθηκευμένα στοιχεία
        της παραγγελίας θα χαθούν.
      </Modal.Body>

      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onCancel}>
          Ακύρωση
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          Αποχώρηση
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
