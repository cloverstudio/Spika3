import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../../store/store";

interface SidebarState {
    activeTab: "chat" | "call" | "contact";
}

export const sidebarSlice = createSlice({
    name: <string>"sidebar",
    initialState: <SidebarState>{ activeTab: "chat" },
    reducers: {
        setActiveTab(state, action: { payload: "chat" | "call" | "contact" }) {
            state.activeTab = action.payload;
        },
    },
});

export const { setActiveTab } = sidebarSlice.actions;

export const selectActiveTab = (state: RootState): "chat" | "call" | "contact" =>
    state.sidebar.activeTab;

export default sidebarSlice.reducer;
