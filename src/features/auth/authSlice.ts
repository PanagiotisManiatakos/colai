import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

type AuthStatus = "unknown" | "authenticated" | "unauthenticated";

export type AuthUser = {
    username?: string;
    fname?: string;
    lname?: string;
    userUID?: string
    userID?: number
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

export const logoutAsync = createAsyncThunk("auth/logout", async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    return true;
});

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        loginOk(state, action: PayloadAction<{ userInfos: AuthUser }>) {
            state.status = "authenticated";
            state.userInfos = action.payload.userInfos;
            state.error = null;
        },
        loginFail(state, action: PayloadAction<string>) {
            state.status = "unauthenticated";
            state.userInfos = null;
            state.error = action.payload;
        },
    },
    extraReducers: (b) => {
        b.addCase(hydrateAuth.fulfilled, (state, action) => {
            if (action.payload.authenticated) {
                state.status = "authenticated";
                //state.user = action.payload.user ?? { username: "user" };
            } else {
                state.status = "unauthenticated";
                state.userInfos = null;
            }
        });
        b.addCase(hydrateAuth.rejected, (state) => {
            state.status = "unauthenticated";
            state.userInfos = null;
        });
        b.addCase(logoutAsync.fulfilled, (state) => {
            state.status = "unauthenticated";
            state.userInfos = null;
        });
    },
});

export const { loginOk, loginFail } = authSlice.actions;
export default authSlice.reducer;
