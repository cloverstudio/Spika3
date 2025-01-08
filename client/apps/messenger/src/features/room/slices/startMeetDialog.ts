import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../../store/store";

interface InitialState {
    showStartMeetDialog: boolean;
    roomId: number | null;
    avatarFileId: number | null;
    displayName: string | null;
    enableCamera: boolean;
    isAccepted: boolean;
}

const initialState: InitialState = {
    showStartMeetDialog: false,
    roomId: null,
    avatarFileId: null,
    displayName: null,
    enableCamera: false,
    isAccepted: false,
};

export const startMeetDialogSlice = createSlice({
    name: "startMeetDialog",
    initialState,
    reducers: {
        openStartMeetDialog(
            state,
            action: PayloadAction<{
                roomId: number;
                avatarFileId: number;
                displayName: string;
                enableCamera: boolean;
            }>,
        ) {
            state.showStartMeetDialog = true;
            state.roomId = action.payload.roomId;
            state.avatarFileId = action.payload.avatarFileId;
            state.displayName = action.payload.displayName;
            state.enableCamera = action.payload.enableCamera;
            state.isAccepted = false;
        },
        closeStartMeetDialog(state) {
            state.showStartMeetDialog = false;
        },
        setIsAccepted(state) {
            state.isAccepted = true;
        },
    },
});

export const shouldShowStartMeetDialog = (state: RootState): boolean =>
    state.startMeet.showStartMeetDialog;

export const selectStartMeetRoomId = (state: RootState): number | null => state.startMeet.roomId;

export const selectStartMeetAvatarFileId = (state: RootState): number | null =>
    state.startMeet.avatarFileId;

export const selectStartMeetDisplayName = (state: RootState): string | null =>
    state.startMeet.displayName;

export const selectStartMeetEnableCamera = (state: RootState): boolean =>
    state.startMeet.enableCamera;

export const selectIsAccepted = (state: RootState): boolean => state.startMeet.isAccepted;

export const { openStartMeetDialog, closeStartMeetDialog, setIsAccepted } =
    startMeetDialogSlice.actions;

export default startMeetDialogSlice.reducer;
