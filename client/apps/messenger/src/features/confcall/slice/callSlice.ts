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

export interface CallState {
    roomId: number;
    showCall: boolean;
    initialMedia: MediaType;
    windowState: WindowState;
    cameraEnabled: boolean;
    microphoneEnabled: boolean;
    screenshareEnabled: boolean;
    selectedCamera: string;
    selectedMicrophone: string;
}

export const CallSlice = createSlice({
    name: <string>"call",
    initialState: <CallState>{
        roomId: 0,
        showCall: false,
        initialMedia: null,
        cameraEnabled: false,
        microphoneEnabled: false,
        screenshareEnabled: false,
        selectedCamera: null,
        selectedMicrophone: null,
        windowState: WindowState.maximized,
    },
    reducers: {
        setShowCall: (state, { payload }: { payload: boolean }) => {
            state.showCall = payload;
        },
        setRoomId: (state, { payload }: { payload: number }) => {
            state.roomId = payload;
        },
        setCameraEnabled: (state, { payload }: { payload: boolean }) => {
            state.cameraEnabled = payload;
        },
        setMicrophoneEnabled: (state, { payload }: { payload: boolean }) => {
            state.microphoneEnabled = payload;
        },
        setScreenshareEnabled: (state, { payload }: { payload: boolean }) => {
            state.screenshareEnabled = payload;
        },
        setSelectedCamera: (state, { payload }: { payload: string }) => {
            state.selectedCamera = payload;
        },
        setSelectedMicrophone: (state, { payload }: { payload: string }) => {
            state.selectedMicrophone = payload;
        },
    },
});

export const {
    setShowCall,
    setRoomId,
    setCameraEnabled,
    setMicrophoneEnabled,
    setScreenshareEnabled,
    setSelectedCamera,
    setSelectedMicrophone,
} = CallSlice.actions;

export default CallSlice.reducer;
