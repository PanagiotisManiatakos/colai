import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/store/store";
import { DiscountRequest } from "@/types/discoutRequest";

const LS_KEY = "discountRequests";

export interface DiscountRequestState {
  requests: DiscountRequest[];
  loadingList: boolean;
  refreshingList: boolean;
  error: string | null;
  query: string;
  requestsFetchedAt: number;
  userCanMakeAction: boolean;
  review: {
    loading: boolean;
    error: string | null
  }
}

export const reviewDiscountRequest = createAsyncThunk<any, { id: number; uid: string; isapproved: number; overrideamount?: number }>(
  "discountRequests/reviewDiscountRequest",
  async ({ id, uid, isapproved, overrideamount = 0 }) => {
    const res = await fetch(`/api/discountRequests/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, uid, isapproved, overrideamount }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      throw new Error(data?.message || "Failed to load orders");
    }
    return { ...data, id, isapproved };
  }
);

export const fetchDiscountRequests = createAsyncThunk<any, { q?: string; force?: boolean } | void, { state: RootState }>(
  "discountRequests/fetchDiscountRequests",
  async (arg) => {
    const q = typeof arg === "object" && arg?.q ? arg.q : "";
    const res = await fetch(`/api/discountRequests?_ts=${Date.now()}${q ? `&search=${encodeURIComponent(q)}` : ""}`, {
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

      if (force) return !(state.discountRequests.refreshingList || state.discountRequests.loadingList);

      if (state.discountRequests.loadingList || state.discountRequests.refreshingList) return false;

      if (state.discountRequests.requests.length > 0 && state.discountRequests.query === q) {
        return false;
      }

      return true;
    },
  }
);

function loadStateFromLocalStorage(): DiscountRequestState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as any;
    if (!parsed || typeof parsed !== "object") return null;

    return {
      ...initialStateBase,
      userCanMakeAction: (parsed.userCanMakeAction ?? initialStateBase.userCanMakeAction)
    };
  } catch {
    return null;
  }
}

function persistStateToLocalStorage(state: DiscountRequestState) {
  if (typeof window === "undefined") return;

  const toSave = {
    userCanMakeAction: state.userCanMakeAction,
  };

  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(toSave));
  } catch {
    // ignore quota / private mode issues
  }
}

const initialStateBase: DiscountRequestState = {
  requests: [],
  loadingList: false,
  refreshingList: false,
  error: null,
  query: "",
  requestsFetchedAt: 0,
  userCanMakeAction: false,
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
    b.addCase(fetchDiscountRequests.pending, (state, action) => {
      const force = typeof action.meta.arg === "object" && !!(action.meta.arg as any)?.force;
      if (force) state.refreshingList = true;
      else state.loadingList = true;
    });
    b.addCase(fetchDiscountRequests.fulfilled, (state, action) => {
      const payload = action.payload;
      const force = typeof action.meta.arg === "object" && !!(action.meta.arg as any)?.force;
      if (force) state.refreshingList = false;
      else state.loadingList = false;
      if (!payload.ok) {
        state.error = payload.message
      } else {
        state.requests = payload.data.mydata
        state.userCanMakeAction = payload.data.userCanMakeAction

        const q =
          typeof action.meta.arg === "object" && action.meta.arg?.q
            ? action.meta.arg.q.trim()
            : "";
        state.query = q;
        state.requestsFetchedAt = Date.now();
        persistStateToLocalStorage(state);
      }
    });
    b.addCase(fetchDiscountRequests.rejected, (state, action) => {
      const force = typeof action.meta.arg === "object" && !!(action.meta.arg as any)?.force;
      if (force) state.refreshingList = false;
      else state.loadingList = false;

      state.error = action.error.message || "Failed to load discount requests";
    });

    b.addCase(reviewDiscountRequest.pending, (state) => {
      state.review.loading = true;
      state.review.error = null;
    })
    b.addCase(reviewDiscountRequest.fulfilled, (state, action) => {
      state.review.loading = false;
      if (action.payload.result && action.payload.type === "success") {
        const req = state.requests.find((r) => r.id === action.payload.id);
        if (req) {
          req.isDiscountApproved = action.payload.isapproved;
        }
      } else {
        state.review.error = action.payload.message ?? action.payload.exmessage;
      }
    })
    b.addCase(reviewDiscountRequest.rejected, (state, action) => {
      state.review.loading = false;
      state.review.error = action.error.message ?? "";
    })
  }
});


export default discountRequestsSlice.reducer;