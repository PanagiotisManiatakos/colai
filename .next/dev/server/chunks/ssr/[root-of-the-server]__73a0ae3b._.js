module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/src/features/orders/ordersSlice.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "approveDiscount",
    ()=>approveDiscount,
    "default",
    ()=>__TURBOPACK__default__export__,
    "denyDiscount",
    ()=>denyDiscount,
    "patchDraftDoctor",
    ()=>patchDraftDoctor,
    "patchDraftPatient",
    ()=>patchDraftPatient,
    "patchDraftRecipient",
    ()=>patchDraftRecipient,
    "setDraftSyntagiUploaded",
    ()=>setDraftSyntagiUploaded,
    "startDraft",
    ()=>startDraft,
    "submitDraft",
    ()=>submitDraft
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [app-ssr] (ecmascript) <locals>");
;
function initialPatient() {
    return {
        amka: "",
        fullName: "",
        idNumber: "",
        phone: "",
        otp: "",
        email: "",
        dob: "",
        address: "",
        city: "",
        zip: "",
        deliverToOtherAddress: false,
        pickedUpByOther: false
    };
}
function initialRecipient() {
    return {
        reason: "",
        relation: "",
        fullName: "",
        idNumber: "",
        amka: "",
        afm: "",
        phone: "",
        address: "",
        city: "",
        zip: ""
    };
}
function initialDoctor() {
    return {
        amka: "",
        fullName: "",
        afm: "",
        healthStructure: "",
        healthType: "",
        hasRefDoctor: true,
        refDoctorAmka: "",
        refDoctorFullName: "",
        refDoctorAfm: ""
    };
}
function initialDraft() {
    return {
        type: null,
        syntagiUploaded: null,
        patient: initialPatient(),
        recipient: initialRecipient(),
        doctor: initialDoctor()
    };
}
const initialState = {
    orders: [
        {
            kind: "order",
            id: 56,
            recipeNo: "022025081477434",
            dateCreated: "17/12/2025",
            dateSubmitted: "29/12/2025",
            clientName: "ΓΑΒΑΘΟΠΟΥΛΟΥ ΜΑΡΙΑ",
            clientAmka: "27033301881",
            doctorName: "ΑΔΑΜΟΠΟΥΛΟΣ ΣΤΑΥΡΟΣ",
            doctorAmka: "20036600532",
            quantity: 2,
            status: "ΚΑΤΑΧΩΡΗΘΗΚΕ"
        }
    ],
    discountRequests: [
        {
            kind: "discountRequest",
            id: 58,
            recipeNo: "022025081551405",
            dateCreated: "18/12/2025",
            dateSubmitted: "29/12/2025",
            clientName: "ΜΑΝΑΓΛΙΩΤΗΣ ΠΑΝΑΓΙΩΤΗΣ",
            clientAmka: "10076204113",
            doctorName: "ΚΥΡΙΑΚΙΔΗΣ ΑΛΕΞΑΝΔΡΟΣ",
            doctorAmka: "20106600198",
            quantity: 1,
            requestedPrice: 5.93,
            status: "ΕΚΚΡΕΜΕΙ"
        }
    ],
    draft: initialDraft()
};
const ordersSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: "orders",
    initialState,
    reducers: {
        approveDiscount (state, action) {
            const req = state.discountRequests.find((r)=>r.id === action.payload);
            if (req) req.status = "ΕΓΚΡΙΘΗΚΕ";
        },
        denyDiscount (state, action) {
            const req = state.discountRequests.find((r)=>r.id === action.payload);
            if (req) req.status = "ΑΠΟΡΡΙΦΘΗΚΕ";
        },
        // Draft flow (shared for both types)
        startDraft (state, action) {
            state.draft = initialDraft();
            state.draft.type = action.payload.type;
        },
        setDraftSyntagiUploaded (state, action) {
            state.draft.syntagiUploaded = {
                filename: action.payload.filename
            };
        },
        patchDraftPatient (state, action) {
            state.draft.patient = {
                ...state.draft.patient,
                ...action.payload
            };
        },
        patchDraftRecipient (state, action) {
            state.draft.recipient = {
                ...state.draft.recipient,
                ...action.payload
            };
        },
        patchDraftDoctor (state, action) {
            state.draft.doctor = {
                ...state.draft.doctor,
                ...action.payload
            };
        },
        // Demo submit: here you can call API later.
        submitDraft (state) {
            // Keep it minimal for now; you can build the real payload here.
            state.draft = initialDraft();
        }
    }
});
const { approveDiscount, denyDiscount, startDraft, setDraftSyntagiUploaded, patchDraftPatient, patchDraftRecipient, patchDraftDoctor, submitDraft } = ordersSlice.actions;
const __TURBOPACK__default__export__ = ordersSlice.reducer;
}),
"[project]/src/features/settings/settingsSlice.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "setTheme",
    ()=>setTheme,
    "toggleTheme",
    ()=>toggleTheme
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [app-ssr] (ecmascript) <locals>");
;
const initialState = {
    theme: "light"
};
const settingsSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
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
}),
"[project]/src/store/store.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "store",
    ()=>store
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$orders$2f$ordersSlice$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/features/orders/ordersSlice.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$settings$2f$settingsSlice$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/features/settings/settingsSlice.ts [app-ssr] (ecmascript)");
;
;
;
const store = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["configureStore"])({
    reducer: {
        orders: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$orders$2f$ordersSlice$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"],
        settings: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$settings$2f$settingsSlice$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"]
    },
    devTools: ("TURBOPACK compile-time value", "development") !== "production"
});
}),
"[project]/src/store/StoreProvider.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StoreProvider",
    ()=>StoreProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-redux/dist/react-redux.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/store.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
function StoreProvider({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Provider"], {
        store: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["store"],
        children: children
    }, void 0, false, {
        fileName: "[project]/src/store/StoreProvider.tsx",
        lineNumber: 7,
        columnNumber: 10
    }, this);
}
}),
"[project]/src/store/hooks.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useAppDispatch",
    ()=>useAppDispatch,
    "useAppSelector",
    ()=>useAppSelector
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-redux/dist/react-redux.mjs [app-ssr] (ecmascript)");
;
const useAppDispatch = ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDispatch"])();
const useAppSelector = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useSelector"];
}),
"[project]/src/components/ui/BootstrapThemeSync.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BootstrapThemeSync",
    ()=>BootstrapThemeSync
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$hooks$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/hooks.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$settings$2f$settingsSlice$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/features/settings/settingsSlice.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
const STORAGE_KEY = "colai_theme";
function BootstrapThemeSync() {
    const dispatch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$hooks$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppDispatch"])();
    const theme = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$hooks$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppSelector"])((s)=>s.settings.theme);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Initialize from localStorage or system preference
        const stored = ("TURBOPACK compile-time value", "undefined") !== "undefined" && localStorage.getItem(STORAGE_KEY);
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
        dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$features$2f$settings$2f$settingsSlice$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setTheme"])(prefersDark ? "dark" : "light"));
    }, [
        dispatch
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (typeof document === "undefined") return;
        document.documentElement.setAttribute("data-bs-theme", theme);
        localStorage.setItem(STORAGE_KEY, theme);
    }, [
        theme
    ]);
    return null;
}
}),
"[project]/src/components/ui/ServiceWorkerRegister.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ServiceWorkerRegister",
    ()=>ServiceWorkerRegister
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
function ServiceWorkerRegister() {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
    }, []);
    return null;
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__73a0ae3b._.js.map