import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../../store/store";

interface SidebarState {
    activeTab: "chat" | "call" | "contact";
    leftSidebarOpen: boolean;
    showProfileEditing: boolean;
}

export const sidebarSlice = createSlice({
    name: "sidebar",
    initialState: <SidebarState>{ activeTab: "chat", leftSidebarOpen: false },
    reducers: {
        setActiveTab(state, action: { payload: "chat" | "call" | "contact" }) {
            state.activeTab = action.payload;
        },
        setLeftSidebar(state, action: { payload: boolean }) {
            state.leftSidebarOpen = action.payload;
        },
        setOpenEditProfile(state, action: { payload: boolean }) {
            state.showProfileEditing = action.payload;
        },
    },
});

export const { setActiveTab, setLeftSidebar, setOpenEditProfile } = sidebarSlice.actions;

export const selectActiveTab = (state: RootState): "chat" | "call" | "contact" =>
    state.sidebar.activeTab;

export const selectLeftSidebarOpen = (state: RootState): boolean => state.sidebar.leftSidebarOpen;

export const shouldShowProfileEditor = (state: RootState): boolean =>
    state.sidebar.showProfileEditing;

export default sidebarSlice.reducer;
