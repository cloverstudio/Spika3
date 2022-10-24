import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../../store/store";

type activeTabType = "details" | "notes" | "createNote" | "noteDetail" | "editNote" | "settings";

interface RightSidebarState {
    activeTab: activeTabType;
    isOpened: boolean;
    activeNoteId: number;
}

export const rightSidebarSlice = createSlice({
    name: "rightSidebar",
    initialState: <RightSidebarState>{
        activeTab: "details",
        isOpened: false,
        activeNoteId: null,
    },
    reducers: {
        show: (state) => {
            state.isOpened = true;
        },
        hide: (state) => {
            state.isOpened = false;
        },
        setActiveTab(
            state,
            action: {
                payload: activeTabType;
            }
        ) {
            state.activeTab = action.payload;
            state.activeNoteId = null;
        },
        setActiveNoteId(state, action: { payload: number }) {
            state.activeTab = "noteDetail";
            state.activeNoteId = action.payload;
        },
        setEditNoteId(state, action: { payload: number }) {
            state.activeTab = "editNote";
            state.activeNoteId = action.payload;
        },
    },
});

export const { show, hide, setActiveTab, setActiveNoteId, setEditNoteId } =
    rightSidebarSlice.actions;

export const selectRightSidebarOpen = (state: RootState): boolean => state.rightSidebar.isOpened;
export const selectRightSidebarActiveTab = (state: RootState): string =>
    state.rightSidebar.activeTab;
export const selectRightSidebarActiveNoteId = (state: RootState): number =>
    state.rightSidebar.activeNoteId;

export default rightSidebarSlice.reducer;
