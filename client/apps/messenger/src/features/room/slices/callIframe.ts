import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../../store/store";

interface InitialState {
    showCallIframe: boolean;
    url: string;
}

const initialState: InitialState = {
    showCallIframe: false,
    url: "",
};

export const callIframeSlice = createSlice({
    name: "callIframe",
    initialState,
    reducers: {
        openCallIframe(state,
            action: PayloadAction<{
                url: string
            }>,) {
            state.url = action.payload.url;
            state.showCallIframe = true;
        },
        closeCallIframe(state) {
            state.showCallIframe = false;
        },
    },
});

export const shouldshowCallIframe = (state: RootState): boolean =>
    state.callIframe.showCallIframe;

export const selectCallUrl = (state: RootState): string => state.callIframe.url;

export const { openCallIframe, closeCallIframe } =
    callIframeSlice.actions;

export default callIframeSlice.reducer;
