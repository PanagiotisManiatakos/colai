import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { clearUserSessionOnLogout } from "@/store/clearUserSessionOnLogout";
import type { AppDispatch } from "@/store/store";

type AuthStatus = "unknown" | "authenticated" | "unauthenticated";

export type AuthUser = {
    username?: string;
    fname?: string;
    lname?: string;
    userUID?: string
    userID?: number
    isSeller?: boolean;
    isManager?: boolean;
    isSuperAdmin?: boolean;
    isSalesAdmin?: boolean
};

export type AuthState = {
    status: AuthStatus;
    userInfos: AuthUser | null;
    error: string | null;
};

const initialState: AuthState = {
    status: "unknown",
    userInfos: null,
    error: null,
};

export const hydrateAuth = createAsyncThunk("auth/hydrate", async () => {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    const data = await res.json();
    return data as { authenticated: boolean; user?: AuthUser };
});

export const logoutAsync = createAsyncThunk<
  boolean,
  void,
  { dispatch: AppDispatch }
>(
  "auth/logout",
  async (_, { dispatch }) => {
    await fetch("/api/auth/logout", { method: "POST" });
    clearUserSessionOnLogout(dispatch);
    return true;
  },
);


const LS_KEY = "auth";

function loadStateFromLocalStorage(): any | null {
    if (typeof window === "undefined") return null;

    try {
        const raw = window.localStorage.getItem(LS_KEY);
        if (!raw) return null;

        const parsed = JSON.parse(raw) as any;
        if (!parsed || typeof parsed !== "object") return null;

        return parsed;
    } catch {
        return null;
    }
}

function persistStateToLocalStorage(state: any) {
    if (typeof window === "undefined") return;

    try {
        window.localStorage.setItem(LS_KEY, JSON.stringify(state));
    } catch {
        // ignore quota / private mode issues
    }
}

const authSlice = createSlice({
    name: "auth",
    initialState: () => (loadStateFromLocalStorage() ?? initialState),
    reducers: {
        loginOk(state, action: PayloadAction<{ userInfos: AuthUser }>) {
            state.status = "authenticated";
            state.userInfos = action.payload.userInfos;
            state.error = null;
            persistStateToLocalStorage(state)
        },
        loginFail(state, action: PayloadAction<string>) {
            state.status = "unauthenticated";
            state.userInfos = null;
            state.error = action.payload;
            persistStateToLocalStorage(state)
        },
    },
    extraReducers: (b) => {
        b.addCase(hydrateAuth.fulfilled, (state, action) => {
            if (action.payload.authenticated) {
                state.status = "authenticated";
                //state.user = action.payload.user ?? { username: "user" };
                persistStateToLocalStorage(state)
            } else {
                state.status = "unauthenticated";
                state.userInfos = null;
                persistStateToLocalStorage(state)
            }
        });
        b.addCase(hydrateAuth.rejected, (state) => {
            state.status = "unauthenticated";
            state.userInfos = null;
            persistStateToLocalStorage(state)
        });
        b.addCase(logoutAsync.fulfilled, (state) => {
            state.status = "unauthenticated";
            state.userInfos = null;
            persistStateToLocalStorage(state)
        });
    },
});

export const { loginOk, loginFail } = authSlice.actions;
export default authSlice.reducer;
