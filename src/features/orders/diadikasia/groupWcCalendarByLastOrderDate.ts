import type { wcCalendar } from "@/types/wc";

export type WcDayGroup = {
    dayOfMonth: number;
    dayTitle: string;
    items: wcCalendar[];
    totalTurnover: number;
};

export type WcMonthGroup = {
    sortKey: number;
    monthTitle: string;
    ordersCount: number;
    totalTurnover: number;
    days: WcDayGroup[];
};

const EL_DATE = new Intl.DateTimeFormat("el-GR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
});

const EL_MONTH = new Intl.DateTimeFormat("el-GR", {
    month: "long",
    year: "numeric",
});

/**
 * Parses `lastOrderDate` as a local calendar date when possible (avoids UTC day-shift on date-only strings).
 * ISO datetimes (`2026-03-25T19:51:53.074Z`) use the calendar portion in local time.
 */
export function parseLastOrderDate(value: string | null | undefined): Date | null {
    if (value == null || String(value).trim() === "") return null;
    const s = String(value).trim();
    const isoDay = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
    if (isoDay) {
        const y = Number(isoDay[1]);
        const m = Number(isoDay[2]);
        const d = Number(isoDay[3]);
        const dt = new Date(y, m - 1, d);
        return Number.isNaN(dt.getTime()) ? null : dt;
    }
    const dt = new Date(s);
    return Number.isNaN(dt.getTime()) ? null : dt;
}

function turnoverEuros(r: wcCalendar): number {
    const v = r.totalTurnover;
    if (typeof v === "number" && Number.isFinite(v)) return v;
    return 0;
}

export function groupWcCalendarByLastOrderDate(items: wcCalendar[]): WcMonthGroup[] {
    type Entry = { r: wcCalendar; d: Date };
    const dated: Entry[] = [];

    for (const r of items) {
        const d = parseLastOrderDate(r.lastOrderDate);
        if (d) dated.push({ r, d });
    }

    const byMonth = new Map<number, Entry[]>();
    for (const e of dated) {
        const y = e.d.getFullYear();
        const m = e.d.getMonth() + 1;
        const key = y * 100 + m;
        const arr = byMonth.get(key);
        if (arr) arr.push(e);
        else byMonth.set(key, [e]);
    }

    const monthKeys = [...byMonth.keys()].sort((a, b) => b - a);

    return monthKeys.map((monthKey) => {
        const year = Math.floor(monthKey / 100);
        const month = monthKey % 100;
        const entries = byMonth.get(monthKey)!;

        const ordersCount = entries.length;
        const totalTurnover = entries.reduce((sum, { r }) => sum + turnoverEuros(r), 0);

        const byDay = new Map<number, wcCalendar[]>();
        for (const { r, d } of entries) {
            const dom = d.getDate();
            const list = byDay.get(dom);
            if (list) list.push(r);
            else byDay.set(dom, [r]);
        }

        const dayNumbers = [...byDay.keys()].sort((a, b) => b - a);
        const days: WcDayGroup[] = dayNumbers.map((dayOfMonth) => {
            const sample = entries.find((e) => e.d.getDate() === dayOfMonth)!.d;
            const dayItems = byDay.get(dayOfMonth)!;
            const dayTurnover = dayItems.reduce((sum, r) => sum + turnoverEuros(r), 0);
            return {
                dayOfMonth,
                dayTitle: EL_DATE.format(sample),
                items: dayItems,
                totalTurnover: dayTurnover,
            };
        });

        const monthTitle = EL_MONTH.format(new Date(year, month - 1, 1));

        return {
            sortKey: monthKey,
            monthTitle,
            ordersCount,
            totalTurnover,
            days,
        };
    });
}
