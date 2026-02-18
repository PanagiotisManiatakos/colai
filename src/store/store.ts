import { configureStore } from "@reduxjs/toolkit";
import ordersReducer from "@/store/orders/ordersSlice";
import settingsReducer from "@/features/settings/settingsSlice";
import authReducer from "@/features/auth/authSlice";
import discountRequestsReducer from "@/store/discountRequests/discountRequestsSlice"
import staticDataReducer from "@/store/staticData/staticDataSlice"
import dashboardReducer from "@/store/dashboard/slice";

export const store = configureStore({
  reducer: {
    orders: ordersReducer,
    settings: settingsReducer,
    auth: authReducer,
    discountRequests: discountRequestsReducer,
    staticData: staticDataReducer,
    dashboard: dashboardReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
