import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../../store/store";

interface InitialState {
    showStartCallDialog: boolean;
    roomId: number | null;
    avatarFileId: number | null;
    displayName: string | null;
    enableCamera: boolean;
    isAccepted: boolean;
}

const initialState: InitialState = {
    showStartCallDialog: false,
    roomId: null,
    avatarFileId: null,
    displayName: null,
    enableCamera: false,
    isAccepted: false,
};

export const startCallDialogSlice = createSlice({
    name: "startCallDialog",
    initialState,
    reducers: {
        openStartCallDialog(
            state,
            action: PayloadAction<{
                roomId: number;
                avatarFileId: number;
                displayName: string;
                enableCamera: boolean;
            }>,
        ) {
            state.showStartCallDialog = true;
            state.roomId = action.payload.roomId;
            state.avatarFileId = action.payload.avatarFileId;
            state.displayName = action.payload.displayName;
            state.enableCamera = action.payload.enableCamera;
            state.isAccepted = false;
        },
        closeStartCallDialog(state) {
            state.showStartCallDialog = false;
        },
        setIsAccepted(state) {
            state.isAccepted = true;
        },
    },
});

export const shouldShowStartCallDialog = (state: RootState): boolean =>
    state.startCall.showStartCallDialog;

export const selectStartCallRoomId = (state: RootState): number | null => state.startCall.roomId;

export const selectStartCallAvatarFileId = (state: RootState): number | null =>
    state.startCall.avatarFileId;

export const selectStartCallDisplayName = (state: RootState): string | null =>
    state.startCall.displayName;

export const selectStartCallEnableCamera = (state: RootState): boolean =>
    state.startCall.enableCamera;

export const selectIsAccepted = (state: RootState): boolean => state.startCall.isAccepted;

export const { openStartCallDialog, closeStartCallDialog, setIsAccepted } =
    startCallDialogSlice.actions;

export default startCallDialogSlice.reducer;
