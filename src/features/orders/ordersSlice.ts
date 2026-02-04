import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { DiscountRequest, OrdeListOfSelections, Order, OrderFile, OrderListOfAddressPersons, OrderYlika } from "@/types/orders";
import type { IDoctorFormData, IPatientFormData, IRecipientFormData } from "@/lib/interface";
import { RootState } from "@/store/store";
import { formatStringToISODDateTime } from "@/lib/utils/date";

type OrderDraftType = "eoppy" | "non_eoppy";

export interface DraftState {
  editState: { loading: boolean; error: string | null };
  submitState: { loading: boolean; error: string | null };
  order: Order;
  ylika: OrderYlika[]
  files: OrderFile[]
  list_LogosParalipti: OrdeListOfSelections[]
  list_SygeniaParalipti: OrdeListOfSelections[]
  list_DiscountReasons: OrdeListOfSelections[]
  list_TroposApostolis: OrdeListOfSelections[]
  list_AddressesPersons: OrderListOfAddressPersons[]
  preselected_address_GID?: string;
  preselected_person_GID?: string;
}

export interface SelectedOrderState {
  order: Order
  loading: boolean;
  loadingError: string | null;
  saving: boolean;
  saveError: string | null;
}

export interface OrdersState {
  orders: Order[];
  discountRequests: DiscountRequest[];
  loadingOrders: boolean;
  refreshingOrders: boolean;
  ordersError: string | null;
  draft: DraftState;
  selected: SelectedOrderState | null;
  ordersQuery: string;
  ordersFetchedAt: number;
}

export const fetchOrders = createAsyncThunk<Order[], { q?: string; force?: boolean } | void, { state: RootState }>(
  "orders/fetchOrders",
  async (arg) => {
    const q = typeof arg === "object" && arg?.q ? arg.q : "";
    const res = await fetch(`/api/orders?_ts=${Date.now()}${q ? `&search=${encodeURIComponent(q)}` : ""}`, {
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

    return (data.orders ?? []) as Order[];
  },
  {
    condition: (arg, { getState }) => {
      const state = getState();
      const q = typeof arg === "object" && arg?.q ? arg.q.trim() : "";
      const force = typeof arg === "object" && arg?.force;

      if (force) return !(state.orders.refreshingOrders || state.orders.loadingOrders);

      if (state.orders.loadingOrders || state.orders.refreshingOrders) return false;

      if (state.orders.orders.length > 0 && state.orders.ordersQuery === q) {
        return false;
      }

      return true;
    },
  }
);

export const fetchOrderById = createAsyncThunk<any, { orderId: number; orderUID: string }>(
  "orders/fetchOrderById",
  async ({ orderId, orderUID }) => {
    const res = await fetch(`/api/orders/${orderId}?_ts=${Date.now()}&uid=${orderUID}`, { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) throw new Error(data?.message || "Failed to load order");
    return data;
  }
);

export const deleteOrderAsync = createAsyncThunk<any, { orderId: number; orderUID: string }>(
  "orders/deleteOrder",
  async ({ orderId, orderUID }) => {
    const res = await fetch(`/api/orders/${orderId}?uid=${orderUID}`, { method: "DELETE", cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) throw new Error(data?.message || "Failed to delete order");
    return { ...data, orderId, orderUID };
  }
);

export const submitDraftAsync = createAsyncThunk<any, void, { state: RootState }>("orders/submitDraftAsync", async (_, thunkApi) => {
  const state = thunkApi.getState();
  const { draft } = state.orders;

  const payload = {
    order: {
      ...draft.order,
      dateOfSyntagi: formatStringToISODDateTime(draft.order.dateOfSyntagi),
      dateIsxyeiApo: formatStringToISODDateTime(draft.order.dateIsxyeiApo),
      dateIsxyeiEos: formatStringToISODDateTime(draft.order.dateIsxyeiEos),
      posoDiscounted: parseFloat(String(draft.order.posoDiscounted)),
      posoSymmetoxis: parseFloat(String(draft.order.posoSymmetoxis))
    },
    ylika: draft.ylika,
    isTempSave: draft.order.isTempSave
  };

  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.ok) {
    throw new Error(data?.message || "Failed to submit order");
  }

  return data;
});

export const editDraftAsync = createAsyncThunk<any, { typeid: string; catid: number, uid?: string }, { state: RootState }>(
  "orders/editDraftAsync",
  async ({ typeid, catid, uid = null }) => {
    const res = await fetch(`/api/orders/edit?_ts=${Date.now()}&uid=${uid}&typeid=${typeid}&catid=${catid}`, {
      method: "GET",
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      throw new Error(data?.message || "Failed to submit order");
    }

    return data;
  });

export const loadCustomerAddressesAsync = createAsyncThunk<any, { customer_ErpGID: string | undefined; customer_name: string | undefined; customer_address: string | undefined; customer_amka: string | undefined; }>(
  "orders/loadCustomerAddressesAsync",
  async ({ customer_ErpGID, customer_name, customer_address, customer_amka }) => {
    const res = await fetch(`/api/customers/${customer_ErpGID}/addresses?customerAMKA=${customer_amka ?? ""}&customerName=${customer_name ?? ""}&customerAddress=${customer_address ?? ""}`, {
      method: "GET",
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.ok) {
      throw new Error(data?.message || "Failed to submit order");
    }

    return data;
  });


const initialStateBase: OrdersState = {
  orders: [],
  discountRequests: [],
  loadingOrders: false,
  refreshingOrders: false,
  ordersError: null,
  draft: {
    editState: { loading: false, error: null },
    submitState: { loading: false, error: null },
    order: {} as Order,
    ylika: [] as OrderYlika[],
    files: [] as OrderFile[],
    list_DiscountReasons: [] as OrdeListOfSelections[],
    list_LogosParalipti: [] as OrdeListOfSelections[],
    list_SygeniaParalipti: [] as OrdeListOfSelections[],
    list_TroposApostolis: [] as OrdeListOfSelections[],
    list_AddressesPersons: [] as OrderListOfAddressPersons[]
  },
  selected: null,
  ordersQuery: "",
  ordersFetchedAt: 0,
};


const LS_KEY = "orders";

function loadStateFromLocalStorage(): OrdersState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as any;
    if (!parsed || typeof parsed !== "object") return null;

    return {
      ...initialStateBase,
      draft: {
        ...initialStateBase.draft,
        order: (parsed?.order ?? initialStateBase.draft.order) as Order,
        ylika: (parsed?.ylika ?? initialStateBase.draft.ylika) as OrderYlika[],
        files: (parsed?.files ?? initialStateBase.draft.files) as OrderFile[],
        list_DiscountReasons: (parsed?.list_DiscountReasons ?? initialStateBase.draft.list_DiscountReasons) as OrdeListOfSelections[],
        list_LogosParalipti: (parsed?.list_LogosParalipti ?? initialStateBase.draft.list_LogosParalipti) as OrdeListOfSelections[],
        list_SygeniaParalipti: (parsed?.list_SygeniaParalipti ?? initialStateBase.draft.list_SygeniaParalipti) as OrdeListOfSelections[],
        list_TroposApostolis: (parsed?.list_TroposApostolis ?? initialStateBase.draft.list_TroposApostolis) as OrdeListOfSelections[],
      },
      // optionally persist selected too, but usually not needed:
      // selected: (parsed.selected ?? initialState.selected) as any,
    };
  } catch {
    return null;
  }
}

function persistStateToLocalStorage(state: OrdersState) {
  if (typeof window === "undefined") return;

  const toSave = {
    order: state.draft.order,
    ylika: state.draft.ylika,
    files: state.draft.files,
    list_DiscountReasons: state.draft.list_DiscountReasons,
    list_LogosParalipti: state.draft.list_LogosParalipti,
    list_SygeniaParalipti: state.draft.list_SygeniaParalipti,
    list_TroposApostolis: state.draft.list_TroposApostolis,
  };

  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(toSave));
  } catch {
    // ignore quota / private mode issues
  }
}

const ordersSlice = createSlice({
  name: "orders",
  initialState: () => (loadStateFromLocalStorage() ?? initialStateBase),
  reducers: {
    startDraft(state, action: PayloadAction<{ type: OrderDraftType }>) {
      state.draft.order.type = action.payload.type;
      persistStateToLocalStorage(state);
    },
    deletedDraftTemplate(state) {
      state.draft.order = {} as Order;
      state.draft.ylika = [] as OrderYlika[];
      persistStateToLocalStorage(state);
    },
    setDraftProperty(state, action: PayloadAction<{ key: keyof Order; value: any }>) {
      state.draft.order = {
        ...state.draft.order,
        [action.payload.key]: action.payload.value
      };
      persistStateToLocalStorage(state);
    },
    addDraftYliko(state, action: PayloadAction<OrderYlika>) {
      state.draft.ylika.push({ ...action.payload, qty: 1, kostos_RETAIL: action.payload.erp_price, kostos_EOPPY: action.payload.erp_eoppyprice });
      state.draft.order.kostos_RETAIL = state.draft.ylika.reduce((acc, x) => acc + (Number(x.kostos_RETAIL) || 0), 0);
      state.draft.order.kostos_EOPPY = state.draft.ylika.reduce((acc, x) => acc + (Number(x.kostos_EOPPY) || 0), 0);
      persistStateToLocalStorage(state);
    },
    updateDraftYlikoQuantity: (state, action: PayloadAction<{ index: number; quantity: number }>) => {
      const { index, quantity } = action.payload;
      if (state.draft.ylika[index]) {
        state.draft.ylika[index].qty = quantity;
        state.draft.ylika[index].kostos_RETAIL = quantity * state.draft.ylika[index].erp_price
        state.draft.ylika[index].kostos_EOPPY = quantity * state.draft.ylika[index].erp_eoppyprice
      }
      state.draft.order.kostos_RETAIL = state.draft.ylika.reduce((acc, x) => acc + (Number(x.kostos_RETAIL) || 0), 0);
      state.draft.order.kostos_EOPPY = state.draft.ylika.reduce((acc, x) => acc + (Number(x.kostos_EOPPY) || 0), 0);
      state.draft.order.kostos = state.draft.ylika.reduce((acc, x) => acc + (Number(x[state.draft.order.type == 'eoppy' ? "kostos_EOPPY" : "kostos_RETAIL"]) || 0), 0);

      persistStateToLocalStorage(state);
    },
    removeDraftYliko: (state, action: PayloadAction<number>) => {
      state.draft.ylika.splice(action.payload, 1);
      state.draft.order.kostos_RETAIL = state.draft.ylika.reduce((acc, x) => acc + (Number(x.kostos_RETAIL) || 0), 0);
      state.draft.order.kostos_EOPPY = state.draft.ylika.reduce((acc, x) => acc + (Number(x.kostos_EOPPY) || 0), 0);

      persistStateToLocalStorage(state);
    },
    setDraftSyntagiUploaded(state, action: PayloadAction<OrderFile>) {
      state.draft.files.push(action.payload);
      persistStateToLocalStorage(state);
    },
    patchDraftPatient(state, action: PayloadAction<Partial<IPatientFormData>>) {
      // state.draft.patient = { ...state.draft.patient, ...action.payload };
      return state
    },
    patchDraftRecipient(state, action: PayloadAction<Partial<IRecipientFormData>>) {
      // state.draft.recipient = { ...state.draft.recipient, ...action.payload };
      return state
    },
    patchDraftDoctor(state, action: PayloadAction<Partial<IDoctorFormData>>) {
      // state.draft.doctor = { ...state.draft.doctor, ...action.payload };
      return state
    },
    submitDraft(state) {
      // state.draft = initialDraft();
      return state
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchOrders.pending, (state, action) => {
      const force = typeof action.meta.arg === "object" && !!(action.meta.arg as any)?.force;
      if (force) state.refreshingOrders = true;
      else state.loadingOrders = true;
      state.ordersError = null;
    });
    b.addCase(fetchOrders.fulfilled, (state, action) => {
      const force = typeof action.meta.arg === "object" && !!(action.meta.arg as any)?.force;
      if (force) state.refreshingOrders = false;
      else state.loadingOrders = false;

      state.orders = action.payload;

      const q =
        typeof action.meta.arg === "object" && action.meta.arg?.q
          ? action.meta.arg.q.trim()
          : "";
      state.ordersQuery = q;
      state.ordersFetchedAt = Date.now();
    });
    b.addCase(fetchOrders.rejected, (state, action) => {
      const force = typeof action.meta.arg === "object" && !!(action.meta.arg as any)?.force;
      if (force) state.refreshingOrders = false;
      else state.loadingOrders = false;

      state.ordersError = action.error.message || "Failed to load orders";
    });
    b.addCase(fetchOrderById.pending, (state) => {
      if (!state.selected) state.selected = {} as SelectedOrderState;
      state.selected.loading = true;
      state.selected.loadingError = null;
    });
    b.addCase(fetchOrderById.fulfilled, (state, action) => {
      if (!state.selected) state.selected = {} as SelectedOrderState;
      state.selected.loading = false;
      state.selected.loadingError = null;
      state.selected.order = action.payload?.order;
    });
    b.addCase(fetchOrderById.rejected, (state, action) => {
      if (!state.selected) state.selected = {} as SelectedOrderState;
      state.selected.loading = false;
      state.selected.loadingError = action.error.message || "Failed to load order";
      state.selected.order = null as any;
    });
    b.addCase(editDraftAsync.pending, (state) => {
      state.draft.editState.loading = true;
      state.draft.editState.error = null;
    });
    b.addCase(editDraftAsync.fulfilled, (state, action) => {
      state.draft.editState.loading = false;
      if (action.payload.ok) {
        state.draft.order = action.payload.data.order
        state.draft.ylika = action.payload.data.items;
        state.draft.files = action.payload.files;
        state.draft.list_DiscountReasons = action.payload.data.list_DiscountReasons
        state.draft.list_LogosParalipti = action.payload.data.list_LogosParalipti
        state.draft.list_SygeniaParalipti = action.payload.data.list_SygeniaParalipti
        state.draft.list_TroposApostolis = action.payload.data.list_TroposApostolis
        persistStateToLocalStorage(state);
      } else {
        state.draft.editState.error = action.payload.message || "Failed to submit order";
      }
    });
    b.addCase(editDraftAsync.rejected, (state, action) => {
      state.draft.editState.loading = false;
      state.draft.editState.error = action.error.message || "Failed to submit order";
    });
    b.addCase(submitDraftAsync.pending, (state) => {
      state.draft.submitState.loading = true;
      state.draft.submitState.error = null;
    });
    b.addCase(submitDraftAsync.fulfilled, (state, action) => {
      state.draft.submitState.loading = false;
    });
    b.addCase(submitDraftAsync.rejected, (state, action) => {
      state.draft.submitState.loading = false;
      state.draft.submitState.error = action.error.message || "Failed to submit order";
    });
    b.addCase(deleteOrderAsync.fulfilled, (state, action) => {
      const idx = state.orders.findIndex((x) => x.id === action.payload.orderId && x.uid === action.payload.orderUID);
      if (idx !== -1) state.orders.splice(idx, 1);
    });
    b.addCase(loadCustomerAddressesAsync.fulfilled, (state, action) => {
      if (action.payload.ok) {
        state.draft.list_AddressesPersons = action.payload.addresses;
        state.draft.order.person_ErpGID = action.payload.preselected_person_GID
        state.draft.order.address_ErpGID = action.payload.preselected_address_GID
        state.draft.preselected_person_GID = action.payload.preselected_person_GID;
        state.draft.preselected_address_GID = action.payload.preselected_address_GID;
      }
    });

  },
});

export const {
  startDraft,
  deletedDraftTemplate,
  setDraftSyntagiUploaded,
  patchDraftPatient,
  patchDraftRecipient,
  patchDraftDoctor,
  submitDraft,
  setDraftProperty,
  addDraftYliko,
  updateDraftYlikoQuantity,
  removeDraftYliko,
} = ordersSlice.actions;

export default ordersSlice.reducer;
