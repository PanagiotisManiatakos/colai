export function formatCurrencyGR(
  value: number | string | null | undefined,
): string {
  const n = typeof value === "string" ? Number(value) : (value ?? 0);
  const safe = Number.isFinite(n) ? n : 0;

  return new Intl.NumberFormat("el-GR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safe);
}

export function parseGreekDecimal(
  value: number | string | null | undefined,
): number {
  if (value == null || value === "") return NaN;
  if (typeof value === "number") return value;

  const normalized = String(value)
    .trim()
    .replaceAll(".", "")
    .replaceAll(",", ".");
  return parseFloat(normalized);
}
