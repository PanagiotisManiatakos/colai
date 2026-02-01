module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/app/api/orders/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/headers.js [app-route] (ecmascript)");
;
;
const COOKIE_NAME = "amsa_token";
const WEB_ORDERS_PATH = "/api/list-orders";
const ERP_ORDERS_PATH = "/api/list-erp-orders";
function extractOrdersArray(payload) {
    // Your backend returns orders here:
    if (Array.isArray(payload?.data?.mydata)) return payload.data.mydata;
    // Safe fallbacks (in case other endpoints differ)
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.result)) return payload.result;
    return [];
}
async function GET(req) {
    const jar = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    const token = (await jar).get(COOKIE_NAME)?.value;
    if (!token) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: false,
            message: "Not authenticated"
        }, {
            status: 401
        });
    }
    const baseUrl = process.env.AMSA_API_BASE_URL;
    if (!baseUrl) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: false,
            message: "Missing AMSA_API_BASE_URL"
        }, {
            status: 500
        });
    }
    // Optional: choose which list to call via query param (mode=erp)
    const url = new URL(req.url);
    const mode = url.searchParams.get("mode"); // "erp" or null
    const qs = url.searchParams.toString();
    const path = mode === "erp" ? ERP_ORDERS_PATH : WEB_ORDERS_PATH;
    const backendUrl = `${baseUrl}${path}?pagesize=1000&page=1${qs ? `&${qs}` : ""}`;
    console.log(backendUrl);
    const res = await fetch(backendUrl, {
        method: "GET",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`
        },
        cache: "no-store"
    });
    // If backend uses real non-2xx codes:
    if (!res.ok) {
        const text = await res.text().catch(()=>"");
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: false,
            message: text || "Backend orders fetch failed"
        }, {
            status: res.status
        });
    }
    const payload = await res.json().catch(()=>({}));
    // // IMPORTANT: backend logical errors can still come with HTTP 200
    // // Your example shows statusCode: 0 for success. Treat non-zero as error.
    // const statusCode = Number(payload?.statusCode);
    // if (Number.isFinite(statusCode) && statusCode !== 200) {
    //     return NextResponse.json(
    //         {
    //             ok: false,
    //             message: payload?.message || "Backend returned error",
    //             detailedMessage: payload?.detailedMessage || null,
    //         },
    //         { status: 500 }
    //     );
    // }
    const arr = extractOrdersArray(payload);
    // Optional: return paging too (useful later)
    const paging = payload?.data?.paging_item ?? null;
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        ok: true,
        orders: arr,
        paging
    });
}
async function POST(req) {
    const jar = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$headers$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["cookies"])();
    const token = (await jar).get(COOKIE_NAME)?.value;
    if (!token) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: false,
            message: "Not authenticated"
        }, {
            status: 401
        });
    }
    const body = await req.json().catch(()=>null);
    if (!body || typeof body !== "object") {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: false,
            message: "Invalid body"
        }, {
            status: 400
        });
    }
    const baseUrl = process.env.AMSA_API_BASE_URL;
    if (!baseUrl) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: false,
            message: "Missing AMSA_API_BASE_URL"
        }, {
            status: 500
        });
    }
    const backendUrl = `${baseUrl}/api/order-save`;
    const res = await fetch(backendUrl, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body),
        cache: "no-store"
    });
    // If backend uses real non-2xx codes:
    if (!res.ok) {
        const text = await res.text().catch(()=>"");
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            ok: false,
            message: text || "Backend orders fetch failed"
        }, {
            status: res.status
        });
    }
    const payload = await res.json().catch(()=>({}));
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        ok: true,
        ...payload
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__cecf596d._.js.map