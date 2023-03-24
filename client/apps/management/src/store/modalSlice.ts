import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/store";

interface UIState {
    showSnackBar: boolean;
    snackBarInfo: snackBarInfo | null;
    showBasicDialog: boolean;
    basicDialogInfo: basicDialogInfo;
}

interface snackBarInfo {
    severity: "error" | "warning" | "info" | "success";
    text: string;
    autoHideDuration?: number;
}

interface basicDialogInfo {
    allowButtonLabel: string;
    denyButtonLabel: string;
    text: string;
    title: string;
}

export const uiSlice = createSlice({
    name: <string>"ui",
    initialState: <UIState>{
        showSnackBar: false,
        snackBarInfo: null,
        basicDialogInfo: null,
        showBasicDialog: false,
    },
    reducers: {
        showSnackBar: (state, action: PayloadAction<snackBarInfo>) => {
            state.showSnackBar = true;
            state.snackBarInfo = action.payload;
        },
        hideSnackBar: (state) => {
            state.showSnackBar = false;
        },
        showBasicDialog: (state, action: PayloadAction<basicDialogInfo>) => {
            state.showBasicDialog = true;
            state.basicDialogInfo = action.payload;
        },
        hideBasicDialog: (state) => {
            state.showBasicDialog = false;
        },
    },
});

export const { showSnackBar, hideSnackBar, hideBasicDialog, showBasicDialog } = uiSlice.actions;

export const selectModal = (state: RootState) => state.modal;

export default uiSlice.reducer;
