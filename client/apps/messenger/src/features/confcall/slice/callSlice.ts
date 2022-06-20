import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import MessageType, { MessageRecordType } from "../../../types/Message";

import type { RootState } from "../../../store/store";

enum MediaType {
    microphone,
    camera,
}

enum WindowState {
    maximized,
    minimized,
}

interface CallState {
    roomId: number;
    showCall: boolean;
    initialMedia: MediaType;
    windowState: WindowState;
}

export const CallSlice = createSlice({
    name: <string>"call",
    initialState: <CallState>{
        roomId: 0,
        showCall: false,
        initialMedia: null,
        windowState: WindowState.maximized,
    },
    reducers: {
        setShowCall: (state, { payload }: { payload: boolean }) => {
            state.showCall = payload;
        },
        setRoomId: (state, { payload }: { payload: number }) => {
            state.roomId = payload;
        },
    },
});

export const { setShowCall, setRoomId } = CallSlice.actions;

export default CallSlice.reducer;
