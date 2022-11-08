import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../../store/store";

interface InitialState {
    show: boolean;
}

export const rightSidebarSlice = createSlice({
    name: <string>"rightSidebar",
    initialState: <InitialState>{ show: true },
    reducers: {
        toggle(state) {
            state.show = !state.show;
        },
    },
    // extraReducers: (builder) => {},
});

export const { toggle: toggleRightSidebar } = rightSidebarSlice.actions;

export default rightSidebarSlice.reducer;
