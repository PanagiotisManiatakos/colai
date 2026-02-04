export type DateFormatStyle = "date" | "datetime";

function pad2(n: number) {
    return String(n).padStart(2, "0");
}

/**
 * Formats a date-like value to UI-friendly string (default: dd/mm/yyyy).
 * Accepts: ISO string, "2026-01-31", Date, timestamp, null/undefined.
 */
export function formatUIDate(
    value: string | number | Date | null | undefined,
    style: DateFormatStyle = "date"
): string {
    if (value == null || value === "") return "";

    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);

    const dd = pad2(d.getDate());
    const mm = pad2(d.getMonth() + 1);
    const yyyy = d.getFullYear();

    if (style === "date") return `${dd}/${mm}/${yyyy}`;

    const hh = pad2(d.getHours());
    const min = pad2(d.getMinutes());
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

export function formatStringToISODDateTime(
    value: string,
): string | null {
    if (value == null || value === "") return null;

    const [dd, mm, yyyy] = value.split("/").map(Number);

    const now = new Date();
    const dt = new Date(
        yyyy,
        mm - 1,
        dd,
        now.getHours(),
        now.getMinutes(),
        now.getSeconds(),
        now.getMilliseconds()
    );

    const iso = dt.toISOString();

    return iso;
}


