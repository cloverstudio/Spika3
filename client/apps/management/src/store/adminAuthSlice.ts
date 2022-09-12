import {
    createSlice,
    PayloadAction,
    Action,
    PayloadActionCreator,
    createAsyncThunk,
} from "@reduxjs/toolkit";

import type { RootState } from "./store";

import API from "../../../../lib/api";

// Define a type for the slice state
interface AdminAuthState {
    username: string | null;
    token: string | null;
    expireDate: number | null;
}

interface AdminSigninParams {
    username: string | null;
    password: string | null;
}

export const callAdminAuthApi = createAsyncThunk(
    "adminAuth/callAdminAuthApi",
    async (adminAuthCredentials: AdminSigninParams, thunkAPI) => {
        const response = await API.post("/management/auth", {
            username: adminAuthCredentials.username,
            password: adminAuthCredentials.password,
        });

        return { ...response, username: adminAuthCredentials.username };
    }
);

export const adminAuthSlice = createSlice({
    name: <string>"adminAuth",
    // `createSlice` will infer the state type from the `initialState` argument
    initialState: <AdminAuthState>{
        username: null,
        token: null,
        expireDate: null,
    },
    reducers: {
        login: (state, action: PayloadAction<AdminAuthState>) => {
            state.username = action.payload.username;
            state.token = action.payload.token;
            state.expireDate = action.payload.expireDate;
        },
        logout: (state) => {
            state.username = null;
            state.expireDate = null;
            state.token = null;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(callAdminAuthApi.fulfilled, (state, action) => {
            state.username = action.payload.username;
            state.token = action.payload.token;
            state.expireDate = action.payload.username;
        });
    },
});

export const { login, logout } = adminAuthSlice.actions;

export default adminAuthSlice.reducer;
