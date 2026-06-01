import greeceAmka from "greece-amka";

export const AMKA_ERROR_MESSAGE = "Μη έγκυρος ΑΜΚΑ";
export const AMKA_LENGTH_MESSAGE = "Συμπληρώστε ΑΜΚΑ (11 ψηφία).";

export function normalizeAmka(value: string | null | undefined): string {
  return String(value ?? "").replace(/\D/g, "");
}

export function isValidAmka(value: string | null | undefined): boolean {
  const digits = normalizeAmka(value);
  if (digits.length !== 11) return false;
  return greeceAmka.validate(digits);
}

export function getAmkaInlineFieldError(
  value: string | null | undefined,
): string | null {
  const digits = normalizeAmka(value);
  if (!digits) return null;
  if (digits.length !== 11) return AMKA_LENGTH_MESSAGE;
  return isValidAmka(digits) ? null : AMKA_ERROR_MESSAGE;
}

export function getRequiredAmkaError(
  value: string | null | undefined,
  emptyMessage: string | null = AMKA_LENGTH_MESSAGE,
): string | null {
  const digits = normalizeAmka(value);
  if (!digits) return emptyMessage;
  if (digits.length !== 11) return AMKA_LENGTH_MESSAGE;
  return isValidAmka(digits) ? null : AMKA_ERROR_MESSAGE;
}

export function getAmkaErrorIfPresent(
  value: string | null | undefined,
): string | null {
  return getAmkaInlineFieldError(value);
}

export function hasInvalidAmkaValue(
  value: string | null | undefined,
  required = false,
): boolean {
  if (required) return getRequiredAmkaError(value) != null;
  return getAmkaErrorIfPresent(value) != null;
}
