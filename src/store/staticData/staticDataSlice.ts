import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "@/store/store";

const LS_KEY = "staticData";

export interface StaticDatatState {
    loading: boolean;
    error: string | null;
    staticDataLastFetched: number;
    list_GroupEoppy: StaticDataList[];
    list_OtherRecipientReason: StaticDataList[];
    list_OtherRecipientRelationship: StaticDataList[];
    list_ShipMethod: StaticDataList[];
    list_DiscountReasons: StaticDataList[];
    list_KatigoriesParoxis: StaticDataList[];
    list_Order_Statuses: StaticDataList[];
    list_Discount_Statuses: StaticDataList[];
    list_Order_Types: StaticDataList[];
    list_Order_EidosEgkrisis: StaticDataList[];
    list_Order_PriceList: StaticDataList[];
    list_DocumentTypes: StaticDataList[];
}

type StaticDataList = {
    disabled: boolean;
    selected: boolean;
    text: string;
    value: string;
    group: StaticDataGroup
}

type StaticDataGroup = {
    disabled: boolean;
    name: string;
}


export const fetchStaticData = createAsyncThunk<any, void, { state: RootState }>(
    "staticData/fetchStaticData",
    async () => {
        const res = await fetch(`/api/staticData`, {
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

function loadStateFromLocalStorage(): StaticDatatState | null {
    if (typeof window === "undefined") return null;

    try {
        const raw = window.localStorage.getItem(LS_KEY);
        if (!raw) return null;

        const parsed = JSON.parse(raw) as any;
        if (!parsed || typeof parsed !== "object") return null;

        return {
            ...initialStateBase,
            staticDataLastFetched: (parsed.staticDataLastFetched ?? initialStateBase.staticDataLastFetched),
            list_GroupEoppy: (parsed.list_GroupEoppy ?? initialStateBase.list_GroupEoppy),
            list_OtherRecipientReason: (parsed.list_OtherRecipientReason ?? initialStateBase.list_OtherRecipientReason),
            list_OtherRecipientRelationship: (parsed.list_OtherRecipientRelationship ?? initialStateBase.list_OtherRecipientRelationship),
            list_ShipMethod: (parsed.list_ShipMethod ?? initialStateBase.list_ShipMethod),
            list_DiscountReasons: (parsed.list_DiscountReasons ?? initialStateBase.list_DiscountReasons),
            list_KatigoriesParoxis: (parsed.list_KatigoriesParoxis ?? initialStateBase.list_KatigoriesParoxis),
            list_Order_Statuses: (parsed.list_Order_Statuses ?? initialStateBase.list_Order_Statuses),
            list_Discount_Statuses: (parsed.list_Discount_Statuses ?? initialStateBase.list_Discount_Statuses),
            list_Order_Types: (parsed.list_Order_Types ?? initialStateBase.list_Order_Types),
            list_Order_EidosEgkrisis: (parsed.list_Order_EidosEgkrisis ?? initialStateBase.list_Order_EidosEgkrisis),
            list_Order_PriceList: (parsed.list_Order_PriceList ?? initialStateBase.list_Order_PriceList),
            list_DocumentTypes: (parsed.list_DocumentTypes ?? initialStateBase.list_DocumentTypes),
        }
    } catch {
        return null;
    }
}

function persistStateToLocalStorage(state: StaticDatatState) {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(LS_KEY, JSON.stringify({ ...state }));
    } catch {
        // ignore quota / private mode issues
    }
}

const initialStateBase: StaticDatatState = {
    loading: false,
    error: null,
    staticDataLastFetched: 0,
    list_GroupEoppy: [] as StaticDataList[],
    list_OtherRecipientReason: [] as StaticDataList[],
    list_OtherRecipientRelationship: [] as StaticDataList[],
    list_ShipMethod: [] as StaticDataList[],
    list_DiscountReasons: [] as StaticDataList[],
    list_KatigoriesParoxis: [] as StaticDataList[],
    list_Order_Statuses: [] as StaticDataList[],
    list_Discount_Statuses: [] as StaticDataList[],
    list_Order_Types: [] as StaticDataList[],
    list_Order_EidosEgkrisis: [] as StaticDataList[],
    list_Order_PriceList: [] as StaticDataList[],
    list_DocumentTypes: [] as StaticDataList[],
};

const staticDataSlice = createSlice({
    name: "staticData",
    initialState: (loadStateFromLocalStorage() ?? initialStateBase),
    reducers: {},
    extraReducers: (b) => {
        b.addCase(fetchStaticData.pending, (state, action) => {
            state.loading = true;
            state.error = null;
        });
        b.addCase(fetchStaticData.fulfilled, (state, action) => {
            state.loading = false;
            const payload = action.payload;
            if (payload.statusCode == 200 && payload.ok) {
                state.staticDataLastFetched = Date.now();
                state.list_GroupEoppy = payload.list_GroupEoppy;
                state.list_OtherRecipientReason = payload.list_OtherRecipientReason;
                state.list_OtherRecipientRelationship = payload.list_OtherRecipientRelationship;
                state.list_ShipMethod = payload.list_ShipMethod;
                state.list_DiscountReasons = payload.list_DiscountReasons;
                state.list_KatigoriesParoxis = payload.list_KatigoriesParoxis;
                state.list_Order_Statuses = payload.list_Order_Statuses;
                state.list_Discount_Statuses = payload.list_Discount_Statuses;
                state.list_Order_Types = payload.list_Order_Types;
                state.list_Order_EidosEgkrisis = payload.list_Order_EidosEgkrisis;
                state.list_Order_PriceList = payload.list_Order_PriceList;
                state.list_DocumentTypes = payload.list_DocumentTypes;
                persistStateToLocalStorage(state);
            } else {
                state.error = payload.message
            }
        }
        );
        b.addCase(fetchStaticData.rejected, (state, action: any) => {
            state.loading = false;
            state.error = action.payload.message ?? "Failed to fetch static data";

        });
    }
});


export default staticDataSlice.reducer;