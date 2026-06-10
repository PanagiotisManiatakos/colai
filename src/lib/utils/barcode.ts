export const BARCODE_LENGTH_MESSAGE = "Συμπληρώστε barcode (15 ψηφία).";

export function normalizeBarcodeDigits(
  value: string | null | undefined,
): string {
  return String(value ?? "").replace(/\D/g, "");
}

export function getBarcodeInlineFieldError(
  value: string | null | undefined,
): string | null {
  const digits = normalizeBarcodeDigits(value);
  if (!digits) return null;
  if (digits.length !== 15) return BARCODE_LENGTH_MESSAGE;
  return null;
}

export function hasInvalidBarcodeValue(
  value: string | null | undefined,
): boolean {
  return getBarcodeInlineFieldError(value) != null;
}
