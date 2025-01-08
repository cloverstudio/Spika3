import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../../store/store";

interface InitialState {
    showMeetIframe: boolean;
    url: string;
}

const initialState: InitialState = {
    showMeetIframe: false,
    url: "",
};

export const meetIframeSlice = createSlice({
    name: "meetIframe",
    initialState,
    reducers: {
        openMeetIframe(state,
            action: PayloadAction<{
                url: string
            }>,) {
            state.url = action.payload.url;
            state.showMeetIframe = true;
        },
        closeMeetIframe(state) {
            state.showMeetIframe = false;
        },
    },
});

export const shouldshowMeetIframe = (state: RootState): boolean =>
    state.meetIframe.showMeetIframe;

export const selectMeetUrl = (state: RootState): string => state.meetIframe.url;

export const { openMeetIframe, closeMeetIframe } =
    meetIframeSlice.actions;

export default meetIframeSlice.reducer;
