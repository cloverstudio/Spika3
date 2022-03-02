import { createSlice } from "@reduxjs/toolkit";
import User from "../types/User";
import type { RootState } from "./store";

interface UserState {
    id: number;
}

export const userSlice = createSlice({
    name: <string>"user",
    initialState: <UserState>{ id: null },
    reducers: {},
});

export const {} = userSlice.actions;

export const selectUser = (state: RootState): User => {
    const data = state.api.queries["getUser(undefined)"]?.data as any;

    return data.user as User;
};

export default userSlice.reducer;
