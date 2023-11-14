import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../../store/store";

type ActiveTabType = "details" | "notes" | "createNote" | "noteDetail" | "editNote" | "settings";

interface InitialState {
    activeTab: ActiveTabType;
    show: boolean;
    activeNoteId: number;
    editNoteTitle: string;
    editNoteContent: string;
    isSaveNoteEditModalOpen: boolean;
}

export const rightSidebarSlice = createSlice({
    name: <string>"rightSidebar",
    initialState: <InitialState>{
        activeTab: "details",
        show: false,
        activeNoteId: null,
        editNoteTitle: "",
        editNoteContent: "",
        isSaveNoteEditModalOpen: false,
    },
    reducers: {
        toggle(state) {
            state.show = !state.show;
        },
        show(state) {
            state.show = true;
        },
        hide(state) {
            state.show = false;
        },
        showNoteEditModal(state) {
            state.isSaveNoteEditModalOpen = true;
        },
        hideNoteEditModal(state) {
            state.isSaveNoteEditModalOpen = false;
        },
        setActiveTab(state, action: { payload: ActiveTabType }) {
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
        setEditNoteTitle(state, action: { payload: string }) {
            state.editNoteTitle = action.payload;
        },
        setEditNoteContent(state, action: { payload: string }) {
            state.editNoteContent = action.payload;
        },
    },
    // extraReducers: (builder) => {},
});

export const selectRightSidebarOpen = (state: RootState): boolean => state.rightSidebar.show;
export const selectRightSidebarActiveTab = (state: RootState): ActiveTabType =>
    state.rightSidebar.activeTab;

export const selectRightSidebarActiveNoteId = (state: RootState): number =>
    state.rightSidebar.activeNoteId;

export const {
    toggle: toggleRightSidebar,
    show: showRightSidebar,
    hide: hideRightSidebar,
    setActiveTab,
    setActiveNoteId,
    setEditNoteId,
    setEditNoteContent,
    setEditNoteTitle,
    showNoteEditModal,
    hideNoteEditModal,
} = rightSidebarSlice.actions;

export default rightSidebarSlice.reducer;
