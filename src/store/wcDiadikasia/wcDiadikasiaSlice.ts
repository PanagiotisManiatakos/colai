import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/store/store";
import { wcCalendar } from "@/types/wc";

const LS_KEY = "wc";

type listStatuses = {
    dateIn: string;
    dateUpdated: string;
    displayRank: number;
    statusId: number;
    statusUID: string;
    title: string;
}

export interface WCDiadiadikasiatState {
    calendar: wcCalendar[];
    loadingList: boolean;
    refreshingList: boolean;
    error: string | null;
    query: string;
    requestsFetchedAt: number;
    listStatuses: listStatuses[]
    showActions: boolean;
    review: {
        loading: boolean;
        error: string | null
    }
}

export const fetchWCCalendar = createAsyncThunk<any, { q?: string; force?: boolean } | void, { state: RootState }>(
    "wc/fetchWCDiadikasiaCalendar",
    async (arg) => {
        const q = typeof arg === "object" && arg?.q ? arg.q : "";
        const res = await fetch(`/api/wc-diadikasia/calendar?_ts=${Date.now()}${q ? `&searchfield=${encodeURIComponent(q)}` : ""}`, {
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
    {
        condition: (arg, { getState }) => {
            const state = getState();
            const q = typeof arg === "object" && arg?.q ? arg.q.trim() : "";
            const force = typeof arg === "object" && arg?.force;

            if (force) return !(state.wcDiadiaksia.refreshingList || state.wcDiadiaksia.loadingList);

            if (state.wcDiadiaksia.loadingList || state.wcDiadiaksia.refreshingList) return false;

            if (state.wcDiadiaksia.calendar.length > 0 && state.wcDiadiaksia.query === q) {
                return false;
            }

            return true;
        },
    }
);

function loadStateFromLocalStorage(): WCDiadiadikasiatState | null {
    if (typeof window === "undefined") return null;

    try {
        const raw = window.localStorage.getItem(LS_KEY);
        if (!raw) return null;

        const parsed = JSON.parse(raw) as any;
        if (!parsed || typeof parsed !== "object") return null;

        return {
            ...initialStateBase,
            //userCanMakeAction: (parsed.userCanMakeAction ?? initialStateBase.userCanMakeAction)
        };
    } catch {
        return null;
    }
}

function persistStateToLocalStorage(state: WCDiadiadikasiatState) {
    if (typeof window === "undefined") return;

    const toSave = {
        showActions: state.showActions,
    };

    try {
        window.localStorage.setItem(LS_KEY, JSON.stringify(toSave));
    } catch {
        // ignore quota / private mode issues
    }
}

const initialStateBase: WCDiadiadikasiatState = {
    calendar: [],
    loadingList: false,
    refreshingList: false,
    error: null,
    query: "",
    requestsFetchedAt: 0,
    showActions: false,
    listStatuses: [],
    review: {
        loading: false,
        error: null
    }
};

const discountRequestsSlice = createSlice({
    name: "discountRequests",
    initialState: (loadStateFromLocalStorage() ?? initialStateBase),
    reducers: {},
    extraReducers: (b) => {
        b.addCase(fetchWCCalendar.pending, (state, action) => {
            const force = typeof action.meta.arg === "object" && !!(action.meta.arg as any)?.force;
            if (force) state.refreshingList = true;
            else state.loadingList = true;
        });
        b.addCase(fetchWCCalendar.fulfilled, (state, action) => {
            const payload = action.payload;
            const force = typeof action.meta.arg === "object" && !!(action.meta.arg as any)?.force;
            if (force) state.refreshingList = false;
            else state.loadingList = false;

            if (!payload.ok) {
                state.error = payload.message ?? "Σφάλμα φόρτωσης";
                return;
            }

            // Backend uses `statusCode: 0` for success; some environments may use `200`.
            const sc = payload.statusCode as number | undefined;
            const statusOk = sc === undefined || sc === 0 || sc === 200;
            const list = payload.listData;

            if (!statusOk && !Array.isArray(list)) {
                state.error = payload.message ?? payload.detailedMessage ?? "Σφάλμα φόρτωσης";
                return;
            }

            state.error = null;
            state.calendar = Array.isArray(list) ? list : [];
            state.showActions = !!payload.showActions;
            if (Array.isArray(payload.listStatuses)) {
                state.listStatuses = payload.listStatuses;
            }

            const q =
                typeof action.meta.arg === "object" && action.meta.arg?.q
                    ? action.meta.arg.q.trim()
                    : "";
            state.query = q;
            state.requestsFetchedAt = Date.now();
            persistStateToLocalStorage(state);
        });
        b.addCase(fetchWCCalendar.rejected, (state, action) => {
            const force = typeof action.meta?.arg === "object" && !!(action.meta.arg as any)?.force;
            if (force) state.refreshingList = false;
            else state.loadingList = false;
            state.review.loading = false;
            state.review.error = action.error.message ?? "";
            state.error = action.error.message ?? "Σφάλμα φόρτωσης";
        })
    }
});


export default discountRequestsSlice.reducer;