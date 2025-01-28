import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../../store/store";

interface InitialState {
    showCallIframe: boolean;
    roomId: number | null;
    enableCamera: boolean;
}

const initialState: InitialState = {
    showCallIframe: false,
    roomId: null,
    enableCamera: null
};

export const callIframeSlice = createSlice({
    name: "callIframe",
    initialState,
    reducers: {
        openCallIframe(state,
            action: PayloadAction<{
                roomId: number,
                enableCamera: boolean,
            }>,) {
            state.showCallIframe = true;
            state.roomId = action.payload.roomId,
                state.enableCamera = action.payload.enableCamera
        },
        closeCallIframe(state) {
            state.showCallIframe = false;
        },
    },
});

export const shouldshowCallIframe = (state: RootState): boolean =>
    state.callIframe.showCallIframe;

export const selectCallData = (state: RootState) => state.callIframe;

export const { openCallIframe, closeCallIframe } =
    callIframeSlice.actions;

export default callIframeSlice.reducer;
