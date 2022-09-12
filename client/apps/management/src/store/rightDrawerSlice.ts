import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";

interface RightSidebarState {
    isOpened: boolean;
}

export const rightSidebarSlice = createSlice({
    name: <string>"rightSidebar",
    // `createSlice` will infer the state type from the `initialState` argument
    initialState: <RightSidebarState>{
        isOpened: false,
    },
    reducers: {
        show: (state, action: PayloadAction<null>) => {
            state.isOpened = true;
        },
        hide: (state, action: PayloadAction<null>) => {
            state.isOpened = false;
        },
    },
});

export const { show, hide } = rightSidebarSlice.actions;

export const selectRightSidebarOpen = (state: RootState): boolean => state.rightSidebar.isOpened;

export default rightSidebarSlice.reducer;
