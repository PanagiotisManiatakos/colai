/** True when value is null/undefined or whitespace-only (after trim). */
export function isBlank(value: unknown): boolean {
  return value == null || String(value).trim() === "";
}

/** True when value has non-whitespace text. */
export function hasText(value: unknown): boolean {
  return !isBlank(value);
}

/** Trimmed string, or "" when blank. */
export function trimmedString(value: unknown): string {
  return isBlank(value) ? "" : String(value).trim();
}

/** First non-blank value as trimmed string, or "". */
export function pickFirstNonBlankString(...values: unknown[]): string {
  for (const value of values) {
    if (hasText(value)) return String(value).trim();
  }
  return "";
}
