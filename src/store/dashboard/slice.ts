import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/store/store";
import { Order } from "@/types/orders";

const LS_KEY = "dashboard";

export interface DashboardState {
    loading: boolean;
    error: string | null;
    totalOrder_month?: number;
    totalOrders_prev_month?: number;
    totalOrders_month_perc?: number;
    pendingReviews?: number;
    next10DaysSyntages?: number;
    lastOrders?: Order[];
    wC_stoixoi_mina?: any;

}



export const fetchDashboardData = createAsyncThunk<any, void, { state: RootState }>(
    "dashboard/fetchDashboardData",
    async () => {
        const res = await fetch(`/api/dashboard`, {
            cache: "no-store",
            headers: {
                "Cache-Control": "no-cache",
                Pragma: "no-cache",
            }
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data?.ok) {
            throw new Error(data?.message || "Failed to load orders");
        }
        return data;
    },
);


const initialStateBase: DashboardState = {
    loading: false,
    error: null,
};

const dashboardSlice = createSlice({
    name: "dashboard",
    initialState: initialStateBase,
    reducers: {},
    extraReducers: (b) => {
        b.addCase(fetchDashboardData.pending, (state, action) => {
            state.loading = true;
            state.error = null;
        });
        b.addCase(fetchDashboardData.fulfilled, (state, action) => {
            state.loading = false;
            const payload = action.payload;
            if (payload.ok) {
                Object.assign(state, payload);
            } else {
                state.error = payload.message
            }
        }
        );
        b.addCase(fetchDashboardData.rejected, (state, action: any) => {
            state.loading = false;
            state.error = action.error.message ?? "Failed to fetch dashboard data";

        });
    }
});


export default dashboardSlice.reducer;