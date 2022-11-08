import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../../store/store";

interface InitialState {
    show: boolean;
}

export const leftSidebarSlice = createSlice({
    name: <string>"leftSidebar",
    initialState: <InitialState>{ show: true },
    reducers: {
        show(state) {
            state.show = true;
        },
    },
    // extraReducers: (builder) => {},
});

export const { show: showLeftSidebar } = leftSidebarSlice.actions;

export default leftSidebarSlice.reducer;
