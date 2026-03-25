import type { Order } from "@/types/orders";

export type WcStoixoiMina = {
    count_paragg_new: number;
    count_paragg_repeat: number;
    amount_paragg_new: number;
    amount_paragg_repeat: number;
};

/** Payload from `GET /api/dashboard` (mirrors backend `get-dashboard-data`). */
export type DashboardData = {
    totalOrders_month: number;
    totalOrders_prev_month: number;
    totalOrders_month_perc: number;
    pendingReviews: number;
    next10DaysSyntages: number;
    lastOrders: Order[];
    wC_stoixoi_mina: WcStoixoiMina | null;
};
