import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import User from "../types/User";
import type { RootState } from "./store";
import { dynamicBaseQuery } from "../api/api";

interface UserState {
    id: number;
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

export const userSlice = createSlice({
    name: <string>"user",
    initialState: <UserState>{ id: null },
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchMe.fulfilled, (state, { payload }: any) => {
            state.id = payload.data.user.id;
        });
    },
});

export const {} = userSlice.actions;

export const selectUserId = (state: RootState): Number => state.user.id;

export const selectUser = (state: RootState): User => {
    const data = state.api.queries["getUser(undefined)"]?.data as any;
    return data.user as User;
};

export default userSlice.reducer;
