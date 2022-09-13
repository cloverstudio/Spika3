import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import User from "../types/User";
import UserSettingList from "../types/UserSettings";
import type { RootState } from "./store";
import { dynamicBaseQuery } from "../api/api";
import UserSettingsList from "../types/UserSettings";

interface UserState {
    id: number;
    settings: UserSettingList;
}

export const fetchMe = createAsyncThunk("messenger/me", async () => {
    const response = await dynamicBaseQuery({
        url: "/messenger/me",
        method: "GET",
    });

    return {
        data: response.data,
    };
});

export const fetchSettings = createAsyncThunk("messenger/me/settings", async () => {
    const response = await dynamicBaseQuery({
        url: "/messenger/me/settings",
        method: "GET",
    });

    return {
        data: response.data,
    };
});

export const userSlice = createSlice({
    name: <string>"user",
    initialState: <UserState>{ id: null },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchMe.fulfilled, (state, { payload }: any) => {
            state.id = payload.data.user.id;
        });
        builder.addCase(fetchSettings.fulfilled, (state, { payload }: any) => {
            const settings: UserSettingsList = payload.data.settings.map((r) => {
                return { key: r.key, value: r.value };
            });

            state.settings = settings;
        });
    },
});

export const {} = userSlice.actions;

export const selectUserId = (state: RootState): Number => state.user.id;

export const selectUser = (state: RootState): User => {
    const data = state.api.queries["getUser(undefined)"]?.data as any;
    return data.user as User;
};

export const settings = (state: RootState): UserSettingsList => state.user.settings;

export default userSlice.reducer;
