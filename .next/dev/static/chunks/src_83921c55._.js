(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/features/orders/ordersSlice.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addDraftYliko",
    ()=>addDraftYliko,
    "default",
    ()=>__TURBOPACK__default__export__,
    "deletedDraftTemplate",
    ()=>deletedDraftTemplate,
    "editDraftAsync",
    ()=>editDraftAsync,
    "fetchOrderById",
    ()=>fetchOrderById,
    "fetchOrders",
    ()=>fetchOrders,
    "patchDraftDoctor",
    ()=>patchDraftDoctor,
    "patchDraftPatient",
    ()=>patchDraftPatient,
    "patchDraftRecipient",
    ()=>patchDraftRecipient,
    "removeDraftYliko",
    ()=>removeDraftYliko,
    "setDraftProperty",
    ()=>setDraftProperty,
    "setDraftSyntagiUploaded",
    ()=>setDraftSyntagiUploaded,
    "startDraft",
    ()=>startDraft,
    "submitDraft",
    ()=>submitDraft,
    "submitDraftAsync",
    ()=>submitDraftAsync,
    "updateDraftYlikoQuantity",
    ()=>updateDraftYlikoQuantity
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [app-client] (ecmascript) <locals>");
;
const fetchOrders = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])("orders/fetchOrders", async (arg)=>{
    const q = typeof arg === "object" && arg?.q ? arg.q : "";
    const res = await fetch(`/api/orders${q ? `?search=${encodeURIComponent(q)}` : ""}`, {
        cache: "no-store"
    });
    const data = await res.json().catch(()=>({}));
    if (!res.ok || !data?.ok) {
        throw new Error(data?.message || "Failed to load orders");
    }
    return data.orders ?? [];
}, {
    condition: (arg, { getState })=>{
        const state = getState();
        const q = typeof arg === "object" && arg?.q ? arg.q.trim() : "";
        const force = typeof arg === "object" && arg?.force;
        if (force) return true; // later: pull-to-refresh uses this
        if (state.orders.loadingOrders) return false;
        if (state.orders.orders.length > 0 && state.orders.ordersQuery === q) {
            return false;
        }
        return true;
    }
});
const fetchOrderById = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])("orders/fetchOrderById", async ({ orderId, orderUID })=>{
    const res = await fetch(`/api/orders/${orderId}?uid=${orderUID}`, {
        cache: "no-store"
    });
    const data = await res.json().catch(()=>({}));
    if (!res.ok || !data?.ok) throw new Error(data?.message || "Failed to load order");
    return data;
});
const submitDraftAsync = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])("orders/submitDraftAsync", async (_, thunkApi)=>{
    const state = thunkApi.getState();
    const { draft } = state.orders;
    const payload = {
        order: draft.order,
        ylika: draft.ylika,
        isTempSave: draft.order.isTempSave
    };
    const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    const data = await res.json().catch(()=>({}));
    if (!res.ok || !data?.ok) {
        throw new Error(data?.message || "Failed to submit order");
    }
    return data;
});
const editDraftAsync = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])("orders/editDraftAsync", async (_, thunkApi)=>{
    const state = thunkApi.getState();
    const { type, groupid } = state.orders.draft.order;
    const res = await fetch(`/api/orders/edit?typeid=${type}&catid=${groupid}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });
    const data = await res.json().catch(()=>({}));
    if (!res.ok || !data?.ok) {
        throw new Error(data?.message || "Failed to submit order");
    }
    return data;
});
const initialStateBase = {
    orders: [],
    discountRequests: [],
    loadingOrders: false,
    isRefreshing: false,
    ordersError: null,
    draft: {
        editState: {
            loading: false,
            error: null
        },
        submitState: {
            loading: false,
            error: null
        },
        order: {},
        ylika: []
    },
    selected: null,
    ordersQuery: "",
    ordersFetchedAt: 0
};
const initialState = (("TURBOPACK compile-time truthy", 1) ? loadStateFromLocalStorage() : "TURBOPACK unreachable") ?? initialStateBase;
const LS_KEY = "orders";
function loadStateFromLocalStorage() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    try {
        const raw = window.localStorage.getItem(LS_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== "object") return null;
        // Only hydrate what you really want persisted (recommended)
        return {
            ...initialState,
            draft: {
                ...initialState.draft,
                order: parsed?.order ?? initialState.draft.order,
                ylika: parsed?.ylika ?? initialState.draft.ylika
            }
        };
    } catch  {
        return null;
    }
}
function persistStateToLocalStorage(state) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const toSave = {
        order: state.draft.order,
        ylika: state.draft.ylika
    };
    try {
        window.localStorage.setItem(LS_KEY, JSON.stringify(toSave));
    } catch  {
    // ignore quota / private mode issues
    }
}
const ordersSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: "orders",
    initialState: ()=>loadStateFromLocalStorage() ?? initialStateBase,
    reducers: {
        startDraft (state, action) {
            state.draft.order.type = action.payload.type;
            persistStateToLocalStorage(state);
        },
        deletedDraftTemplate (state) {
            state.draft.order = {};
            state.draft.ylika = [], persistStateToLocalStorage(state);
        },
        setDraftProperty (state, action) {
            state.draft.order = {
                ...state.draft.order,
                [action.payload.key]: action.payload.value
            };
            persistStateToLocalStorage(state);
        },
        addDraftYliko (state, action) {
            state.draft.ylika.push({
                ...action.payload,
                qty: 1,
                kostos_RETAIL: action.payload.erp_price,
                kostos_EOPPY: action.payload.erp_eoppyprice
            });
            state.draft.order.kostos_RETAIL = state.draft.ylika.reduce((acc, x)=>acc + (Number(x.kostos_RETAIL) || 0), 0);
            state.draft.order.kostos_EOPPY = state.draft.ylika.reduce((acc, x)=>acc + (Number(x.kostos_EOPPY) || 0), 0);
            persistStateToLocalStorage(state);
        },
        updateDraftYlikoQuantity: (state, action)=>{
            const { index, quantity } = action.payload;
            if (state.draft.ylika[index]) {
                state.draft.ylika[index].qty = quantity;
                state.draft.ylika[index].kostos_RETAIL = quantity * state.draft.ylika[index].erp_price;
                state.draft.ylika[index].kostos_EOPPY = quantity * state.draft.ylika[index].erp_eoppyprice;
            }
            state.draft.order.kostos_RETAIL = state.draft.ylika.reduce((acc, x)=>acc + (Number(x.kostos_RETAIL) || 0), 0);
            state.draft.order.kostos_EOPPY = state.draft.ylika.reduce((acc, x)=>acc + (Number(x.kostos_EOPPY) || 0), 0);
            state.draft.order.kostos = state.draft.ylika.reduce((acc, x)=>acc + (Number(x[state.draft.order.type == 'eoppy' ? "kostos_EOPPY" : "kostos_RETAIL"]) || 0), 0);
            persistStateToLocalStorage(state);
        },
        removeDraftYliko: (state, action)=>{
            state.draft.ylika.splice(action.payload, 1);
            state.draft.order.kostos_RETAIL = state.draft.ylika.reduce((acc, x)=>acc + (Number(x.kostos_RETAIL) || 0), 0);
            state.draft.order.kostos_EOPPY = state.draft.ylika.reduce((acc, x)=>acc + (Number(x.kostos_EOPPY) || 0), 0);
            persistStateToLocalStorage(state);
        },
        setDraftSyntagiUploaded (state, action) {
            // state.draft.syntagiUploaded = { filename: action.payload.filename };
            return state;
        },
        patchDraftPatient (state, action) {
            // state.draft.patient = { ...state.draft.patient, ...action.payload };
            return state;
        },
        patchDraftRecipient (state, action) {
            // state.draft.recipient = { ...state.draft.recipient, ...action.payload };
            return state;
        },
        patchDraftDoctor (state, action) {
            // state.draft.doctor = { ...state.draft.doctor, ...action.payload };
            return state;
        },
        submitDraft (state) {
            // state.draft = initialDraft();
            return state;
        }
    },
    extraReducers: (b)=>{
        b.addCase(fetchOrders.pending, (state)=>{
            state.loadingOrders = true;
            state.ordersError = null;
        });
        b.addCase(fetchOrders.fulfilled, (state, action)=>{
            state.loadingOrders = false;
            state.orders = action.payload;
            const q = typeof action.meta.arg === "object" && action.meta.arg?.q ? action.meta.arg.q.trim() : "";
            state.ordersQuery = q;
            state.ordersFetchedAt = Date.now();
        });
        b.addCase(fetchOrders.rejected, (state, action)=>{
            state.loadingOrders = false;
            state.ordersError = action.error.message || "Failed to load orders";
        });
        b.addCase(fetchOrderById.pending, (state)=>{
            if (!state.selected) state.selected = {};
            state.selected.loading = true;
            state.selected.loadingError = null;
        });
        b.addCase(fetchOrderById.fulfilled, (state, action)=>{
            if (!state.selected) state.selected = {};
            state.selected.loading = false;
            state.selected.loadingError = null;
            state.selected.order = action.payload?.order;
        });
        b.addCase(fetchOrderById.rejected, (state, action)=>{
            if (!state.selected) state.selected = {};
            state.selected.loading = false;
            state.selected.loadingError = action.error.message || "Failed to load order";
            state.selected.order = null;
        });
        b.addCase(editDraftAsync.pending, (state)=>{
            state.draft.editState.loading = true;
            state.draft.editState.error = null;
        });
        b.addCase(editDraftAsync.fulfilled, (state, action)=>{
            state.draft.editState.loading = false;
            if (action.payload.ok) {
                state.draft.order = action.payload.data.order;
                state.draft.ylika = [];
            } else {
                state.draft.editState.error = action.payload.message || "Failed to submit order";
            }
        });
        b.addCase(editDraftAsync.rejected, (state, action)=>{
            state.draft.editState.loading = false;
            state.draft.editState.error = action.error.message || "Failed to submit order";
        });
        b.addCase(submitDraftAsync.pending, (state)=>{
            state.draft.submitState.loading = true;
            state.draft.submitState.error = null;
        });
        b.addCase(submitDraftAsync.fulfilled, (state, action)=>{
            state.draft.submitState.loading = false;
        });
        b.addCase(submitDraftAsync.rejected, (state, action)=>{
            state.draft.submitState.loading = false;
            state.draft.submitState.error = action.error.message || "Failed to submit order";
        });
    }
});
const { startDraft, deletedDraftTemplate, setDraftSyntagiUploaded, patchDraftPatient, patchDraftRecipient, patchDraftDoctor, submitDraft, setDraftProperty, addDraftYliko, updateDraftYlikoQuantity, removeDraftYliko } = ordersSlice.actions;
const __TURBOPACK__default__export__ = ordersSlice.reducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/features/settings/settingsSlice.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "setTheme",
    ()=>setTheme,
    "toggleTheme",
    ()=>toggleTheme
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [app-client] (ecmascript) <locals>");
;
const initialState = {
    theme: "light"
};
const settingsSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: "settings",
    initialState,
    reducers: {
        setTheme (state, action) {
            state.theme = action.payload;
        },
        toggleTheme (state) {
            state.theme = state.theme === "dark" ? "light" : "dark";
        }
    }
});
const { setTheme, toggleTheme } = settingsSlice.actions;
const __TURBOPACK__default__export__ = settingsSlice.reducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/features/auth/authSlice.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "hydrateAuth",
    ()=>hydrateAuth,
    "loginFail",
    ()=>loginFail,
    "loginOk",
    ()=>loginOk,
    "logoutAsync",
    ()=>logoutAsync
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [app-client] (ecmascript) <locals>");
;
const initialState = {
    status: "unknown",
    userInfos: null,
    error: null
};
const hydrateAuth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])("auth/hydrate", async ()=>{
    const res = await fetch("/api/auth/me", {
        cache: "no-store"
    });
    const data = await res.json();
    return data;
});
const logoutAsync = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createAsyncThunk"])("auth/logout", async ()=>{
    await fetch("/api/auth/logout", {
        method: "POST"
    });
    return true;
});
const authSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: "auth",
    initialState,
    reducers: {
        loginOk (state, action) {
            state.status = "authenticated";
            state.userInfos = action.payload.userInfos;
            state.error = null;
        },
        loginFail (state, action) {
            state.status = "unauthenticated";
            state.userInfos = null;
            state.error = action.payload;
        }
    },
    extraReducers: (b)=>{
        b.addCase(hydrateAuth.fulfilled, (state, action)=>{
            if (action.payload.authenticated) {
                state.status = "authenticated";
            //state.user = action.payload.user ?? { username: "user" };
            } else {
                state.status = "unauthenticated";
                state.userInfos = null;
            }
        });
        b.addCase(hydrateAuth.rejected, (state)=>{
            state.status = "unauthenticated";
            state.userInfos = null;
        });
        b.addCase(logoutAsync.fulfilled, (state)=>{
            state.status = "unauthenticated";
            state.userInfos = null;
        });
    }
});
const { loginOk, loginFail } = authSlice.actions;
const __TURBOPACK__default__export__ = authSlice.reducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/store/store.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "store",
    ()=>store
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$orders$2f$ordersSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/features/orders/ordersSlice.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$settings$2f$settingsSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/features/settings/settingsSlice.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$auth$2f$authSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/features/auth/authSlice.ts [app-client] (ecmascript)");
;
;
;
;
const store = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["configureStore"])({
    reducer: {
        orders: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$orders$2f$ordersSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        settings: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$settings$2f$settingsSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        auth: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$auth$2f$authSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
    }
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/store/StoreProvider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StoreProvider",
    ()=>StoreProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-redux/dist/react-redux.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/store.ts [app-client] (ecmascript)");
"use client";
;
;
;
function StoreProvider({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Provider"], {
        store: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["store"],
        children: children
    }, void 0, false, {
        fileName: "[project]/src/store/StoreProvider.tsx",
        lineNumber: 7,
        columnNumber: 10
    }, this);
}
_c = StoreProvider;
var _c;
__turbopack_context__.k.register(_c, "StoreProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/store/hooks.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useAppDispatch",
    ()=>useAppDispatch,
    "useAppSelector",
    ()=>useAppSelector
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-redux/dist/react-redux.mjs [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
const useAppDispatch = ()=>{
    _s();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDispatch"])();
};
_s(useAppDispatch, "jI3HA1r1Cumjdbu14H7G+TUj798=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDispatch"]
    ];
});
const useAppSelector = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSelector"];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/BootstrapThemeSync.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BootstrapThemeSync",
    ()=>BootstrapThemeSync
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$hooks$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/hooks.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$settings$2f$settingsSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/features/settings/settingsSlice.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
const STORAGE_KEY = "colai_theme";
function BootstrapThemeSync() {
    _s();
    const dispatch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$hooks$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppDispatch"])();
    const theme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$hooks$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppSelector"])({
        "BootstrapThemeSync.useAppSelector[theme]": (s)=>s.settings.theme
    }["BootstrapThemeSync.useAppSelector[theme]"]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "BootstrapThemeSync.useEffect": ()=>{
            // Initialize from localStorage or system preference
            const stored = ("TURBOPACK compile-time value", "object") !== "undefined" && localStorage.getItem(STORAGE_KEY);
            if (stored === "light" || stored === "dark") {
                dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$settings$2f$settingsSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setTheme"])(stored));
                return;
            }
            const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
            dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$settings$2f$settingsSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setTheme"])(prefersDark ? "dark" : "light"));
        }
    }["BootstrapThemeSync.useEffect"], [
        dispatch
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "BootstrapThemeSync.useEffect": ()=>{
            if (typeof document === "undefined") return;
            document.documentElement.setAttribute("data-bs-theme", theme);
            localStorage.setItem(STORAGE_KEY, theme);
        }
    }["BootstrapThemeSync.useEffect"], [
        theme
    ]);
    return null;
}
_s(BootstrapThemeSync, "3qG6uJQmBvkRASvrchkadnIZpmo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$hooks$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppDispatch"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$hooks$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppSelector"]
    ];
});
_c = BootstrapThemeSync;
var _c;
__turbopack_context__.k.register(_c, "BootstrapThemeSync");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/ServiceWorkerRegister.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ServiceWorkerRegister",
    ()=>ServiceWorkerRegister
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
function ServiceWorkerRegister() {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ServiceWorkerRegister.useEffect": ()=>{
            if ("TURBOPACK compile-time truthy", 1) return;
            //TURBOPACK unreachable
            ;
        }
    }["ServiceWorkerRegister.useEffect"], []);
    return null;
}
_s(ServiceWorkerRegister, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = ServiceWorkerRegister;
var _c;
__turbopack_context__.k.register(_c, "ServiceWorkerRegister");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_83921c55._.js.map