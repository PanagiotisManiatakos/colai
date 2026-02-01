export function formatCurrencyGR(value: number | string | null | undefined): string {
    const n = typeof value === "string" ? Number(value) : (value ?? 0);
    const safe = Number.isFinite(n) ? n : 0;

    return new Intl.NumberFormat("el-GR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(safe);
}