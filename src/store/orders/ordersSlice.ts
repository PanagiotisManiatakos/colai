import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AIMaterials, OrdeListOfSelections, Order, OrderFile, OrderListOfAddressPersons, OrderYlika } from "@/types/orders";
import type { IDoctorFormData, IPatientFormData, IRecipientFormData } from "@/lib/interface";
import { RootState } from "@/store/store";
import { formatStringToISODDateTime, formatUIDate } from "@/lib/utils/date";

type OrderDraftType = "eopyy" | "non_eoppy";

export interface DraftState {
  editState: { loading: boolean; error: string | null };
  submitState: { loading: boolean; error: string | null };
  order: Order;
  ylika: OrderYlika[]
  files: OrderFile[]
  list_LogosParalipti: OrdeListOfSelections[]
  list_SygeniaParalipti: OrdeListOfSelections[]
  list_DiscountReasons: OrdeListOfSelections[]
  list_KatigoriesParoxis: OrdeListOfSelections[]
  list_TroposApostolis: OrdeListOfSelections[]
  list_AddressesPersons: OrderListOfAddressPersons[]
  preselected_address_GID?: string;
  preselected_person_GID?: string;
  ai_ylika: AIMaterials[];
  synaineseisResults: {
    infos_list: String[],
    score: number
  } | null
}

export interface SelectedOrderState {
  order: Order;
  ylika: OrderYlika[];
  files: OrderFile[];
  checkErrors: any;
  loading: boolean;
  loadingError: string | null;
  saving: boolean;
  saveError: string | null;
}

export interface OrdersState {
  orders: Order[];
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
      posoSymmetoxis: parseFloat(String(draft.order.posoSymmetoxis)),
      appVersion: process.env.NEXT_PUBLIC_APP_VERSION
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
  async ({ typeid, catid, uid }) => {
    const res = await fetch(`/api/orders/edit?_ts=${Date.now()}&typeid=${typeid}&catid=${catid}${uid ? `&uid=${uid}` : ""}`, {
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
    list_KatigoriesParoxis: [] as OrdeListOfSelections[],
    list_LogosParalipti: [] as OrdeListOfSelections[],
    list_SygeniaParalipti: [] as OrdeListOfSelections[],
    list_TroposApostolis: [] as OrdeListOfSelections[],
    list_AddressesPersons: [] as OrderListOfAddressPersons[],
    ai_ylika: [] as AIMaterials[],
    synaineseisResults: null
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
        list_KatigoriesParoxis: (parsed?.list_KatigoriesParoxis ?? initialStateBase.draft.list_KatigoriesParoxis) as OrdeListOfSelections[],
        list_LogosParalipti: (parsed?.list_LogosParalipti ?? initialStateBase.draft.list_LogosParalipti) as OrdeListOfSelections[],
        list_SygeniaParalipti: (parsed?.list_SygeniaParalipti ?? initialStateBase.draft.list_SygeniaParalipti) as OrdeListOfSelections[],
        list_TroposApostolis: (parsed?.list_TroposApostolis ?? initialStateBase.draft.list_TroposApostolis) as OrdeListOfSelections[],
        ai_ylika: (parsed?.ai_ylika ?? initialStateBase.draft.ai_ylika) as AIMaterials[],
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
    list_KatigoriesParoxis: state.draft.list_KatigoriesParoxis,
    list_LogosParalipti: state.draft.list_LogosParalipti,
    list_SygeniaParalipti: state.draft.list_SygeniaParalipti,
    list_TroposApostolis: state.draft.list_TroposApostolis,
    ai_ylika: state.draft.ai_ylika
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

      if (["symmPercentage", "kostos", "eidos_Egkrisis", "plafonGiftAmount", "maxPosoKostousGiaSymmetoxi"].includes(action.payload.key)) {
        const eidosEgkrisis = state.draft.order.eidos_Egkrisis;
        const type = state.draft.order.type
        const kostos = Number(state.draft.order.kostos ?? 0);
        const symmPercentage = Number(state.draft.order.symmPercentage ?? 0);
        const maxPosoKostousGiaSymmetoxi = Number(state.draft.order.maxPosoKostousGiaSymmetoxi ?? 0);
        const plafonGiftAmount = Number(state.draft.order.plafonGiftAmount ?? 0);
        if (maxPosoKostousGiaSymmetoxi > 0 && kostos > maxPosoKostousGiaSymmetoxi && eidosEgkrisis == 1 && type == 'eopyy') {
          const diafora = kostos - maxPosoKostousGiaSymmetoxi;
          state.draft.order.posoSymmetoxis = ((maxPosoKostousGiaSymmetoxi * symmPercentage) / 100) + (diafora > plafonGiftAmount ? diafora : 0);
        } else {
          state.draft.order.posoSymmetoxis = kostos * (symmPercentage / 100);
        }
      }

      persistStateToLocalStorage(state);
    },
    setAIMaterials(state, action: PayloadAction<AIMaterials[]>) {
      state.draft.ai_ylika = action.payload;
      persistStateToLocalStorage(state);
    },
    setSynaineseisResults(state, action) {
      state.draft.synaineseisResults = action.payload
    },
    addDraftYliko(state, action: PayloadAction<OrderYlika>) {
      state.draft.ylika.push(action.payload);
      state.draft.order.kostos = state.draft.ylika.reduce((acc, x) => acc + (Number(x.qty) * Number(x[state.draft.order.type == 'eopyy' ? "erp_EoppyPrice" : "erp_Price"]) || 0), 0);
      state.draft.order.kostos_EOPPY = state.draft.ylika.reduce((acc, x) => acc + (Number(x.qty) * Number(x.erp_EoppyPrice || 0)), 0);
      state.draft.order.kostos_RETAIL = state.draft.ylika.reduce((acc, x) => acc + (Number(x.qty) * Number(x.erp_Price || 0)), 0);

      const eidosEgkrisis = state.draft.order.eidos_Egkrisis;
      const type = state.draft.order.type
      const kostos = Number(state.draft.order.kostos ?? 0);
      const symmPercentage = Number(state.draft.order.symmPercentage ?? 0);
      const maxPosoKostousGiaSymmetoxi = Number(state.draft.order.maxPosoKostousGiaSymmetoxi ?? 0);
      const plafonGiftAmount = Number(state.draft.order.plafonGiftAmount ?? 0);
      if (maxPosoKostousGiaSymmetoxi > 0 && kostos > maxPosoKostousGiaSymmetoxi && eidosEgkrisis == 1 && type == 'eopyy') {
        const diafora = kostos - maxPosoKostousGiaSymmetoxi;
        state.draft.order.posoSymmetoxis = ((maxPosoKostousGiaSymmetoxi * symmPercentage) / 100) + (diafora > plafonGiftAmount ? diafora : 0);
      } else {
        state.draft.order.posoSymmetoxis = kostos * (symmPercentage / 100);
      }
      persistStateToLocalStorage(state);
    },
    updateDraftYlikoQuantity: (state, action: PayloadAction<{ index: number; quantity: number }>) => {
      const { index, quantity } = action.payload;
      if (state.draft.ylika[index]) {
        state.draft.ylika[index].qty = quantity;
      }

      state.draft.order.kostos = state.draft.ylika.reduce((acc, x) => acc + (Number(x.qty) * Number(x[state.draft.order.type == 'eopyy' ? "erp_EoppyPrice" : "erp_Price"]) || 0), 0);
      state.draft.order.kostos_EOPPY = state.draft.ylika.reduce((acc, x) => acc + (Number(x.qty) * Number(x.erp_EoppyPrice || 0)), 0);
      state.draft.order.kostos_RETAIL = state.draft.ylika.reduce((acc, x) => acc + (Number(x.qty) * Number(x.erp_Price || 0)), 0);

      const eidosEgkrisis = state.draft.order.eidos_Egkrisis;
      const type = state.draft.order.type
      const kostos = Number(state.draft.order.kostos ?? 0);
      const symmPercentage = Number(state.draft.order.symmPercentage ?? 0);
      const maxPosoKostousGiaSymmetoxi = Number(state.draft.order.maxPosoKostousGiaSymmetoxi ?? 0);
      const plafonGiftAmount = Number(state.draft.order.plafonGiftAmount ?? 0);
      if (maxPosoKostousGiaSymmetoxi > 0 && kostos > maxPosoKostousGiaSymmetoxi && eidosEgkrisis == 1 && type == 'eopyy') {
        const diafora = kostos - maxPosoKostousGiaSymmetoxi;
        state.draft.order.posoSymmetoxis = ((maxPosoKostousGiaSymmetoxi * symmPercentage) / 100) + (diafora > plafonGiftAmount ? diafora : 0);
      } else {
        state.draft.order.posoSymmetoxis = kostos * (symmPercentage / 100);
      }

      persistStateToLocalStorage(state);
    },
    removeDraftYliko: (state, action: PayloadAction<number>) => {
      state.draft.ylika.splice(action.payload, 1);
      state.draft.order.kostos = state.draft.ylika.reduce((acc, x) => acc + (Number(x.qty) * Number(x[state.draft.order.type == 'eopyy' ? "erp_EoppyPrice" : "erp_Price"]) || 0), 0);
      state.draft.order.kostos_EOPPY = state.draft.ylika.reduce((acc, x) => acc + (Number(x.qty) * Number(x.erp_EoppyPrice || 0)), 0);
      state.draft.order.kostos_RETAIL = state.draft.ylika.reduce((acc, x) => acc + (Number(x.qty) * Number(x.erp_Price || 0)), 0);

      const eidosEgkrisis = state.draft.order.eidos_Egkrisis;
      const type = state.draft.order.type
      const kostos = Number(state.draft.order.kostos ?? 0);
      const symmPercentage = Number(state.draft.order.symmPercentage ?? 0);
      const maxPosoKostousGiaSymmetoxi = Number(state.draft.order.maxPosoKostousGiaSymmetoxi ?? 0);
      const plafonGiftAmount = Number(state.draft.order.plafonGiftAmount ?? 0);
      if (maxPosoKostousGiaSymmetoxi > 0 && kostos > maxPosoKostousGiaSymmetoxi && eidosEgkrisis == 1 && type == 'eopyy') {
        const diafora = kostos - maxPosoKostousGiaSymmetoxi;
        state.draft.order.posoSymmetoxis = ((maxPosoKostousGiaSymmetoxi * symmPercentage) / 100) + (diafora > plafonGiftAmount ? diafora : 0);
      } else {
        state.draft.order.posoSymmetoxis = kostos * (symmPercentage / 100);
      }

      persistStateToLocalStorage(state);
    },
    removeAIMaterial: (state, action: PayloadAction<number>) => {
      state.draft.ai_ylika.splice(action.payload, 1);
      persistStateToLocalStorage(state);
    },
    setDraftSyntagiUploaded(state, action: PayloadAction<OrderFile>) {
      if (!state.draft.files) state.draft.files = []
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
      state.selected.ylika = action.payload?.items;
      state.selected.files = action.payload?.files;
      state.selected.checkErrors = action.payload?.check_errors;
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
        state.draft.order.dateOfSyntagi = formatUIDate(action.payload.data.order.dateOfSyntagi)
        state.draft.order.dateIsxyeiApo = formatUIDate(action.payload.data.order.dateIsxyeiApo)
        state.draft.order.dateIsxyeiEos = formatUIDate(action.payload.data.order.dateIsxyeiEos)
        state.draft.ylika = action.payload.data.items;
        state.draft.files = action.payload.data.files;
        state.draft.list_DiscountReasons = action.payload.data.list_DiscountReasons
        state.draft.list_KatigoriesParoxis = action.payload.data.list_KatigoriesParoxis
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
      if (action.payload.ok && action.payload.result) {
        state.draft.order = {} as Order;
        state.draft.ai_ylika = [] as AIMaterials[];
        state.draft.files = [] as OrderFile[];
        state.draft.ylika = [] as OrderYlika[];
      } else {
        state.draft.submitState.error = action.payload.message
      }
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
  setSynaineseisResults,
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
  removeAIMaterial,
  setAIMaterials
} = ordersSlice.actions;

export default ordersSlice.reducer;
