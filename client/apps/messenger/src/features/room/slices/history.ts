import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../../../store/store";

type HistoryRoomState = {
    avatarUrl: string;
    name: string;
    lastMessageText: string;
    lastMessageCreatedAt: number;
};

interface HistoryState {
    list: HistoryRoomState[];
}

export const historySlice = createSlice({
    name: <string>"room",
    initialState: <HistoryState>{ list: [] },
    reducers: {},
    // extraReducers: (builder) => {},
});

export const {} = historySlice.actions;

export default historySlice.reducer;
