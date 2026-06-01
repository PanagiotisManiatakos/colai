export type SubmitOrderConfirmModalProps = {
  show: boolean;
  loading?: boolean;
  error?: string | null;
  otp?: string | null;
  amka?: string | null;
  barcode?: string | null;
  customerIsCompletelyNew?: boolean;
  suggestedDoctorName?: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export type NewRecipientConfirmModalProps = {
  show: boolean;
  onConfirmNewRecipient: () => void;
  onSelectExisting: () => void;
  onCancel: () => void;
};
