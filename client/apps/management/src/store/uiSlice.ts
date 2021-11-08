import {
    createSlice,
    PayloadAction,
    Action,
    PayloadActionCreator,
    createAsyncThunk,
} from "@reduxjs/toolkit";

import { SnackbarProps } from "@mui/material";

import type { RootState } from "./store";

import API from "../../../../lib/api";

// Define a type for the slice state
interface UIState {
    showSnackBar: boolean;
    snackBarInfo: snackBarInfo | null;
    showBasicDialog: boolean;
    basicDialogInfo: basicDialogInfo;
}

interface snackBarInfo {
    severity: "error" | "warning" | "info" | "success";
    text: string;
}

interface basicDialogInfo {
    allowButtonLabel: string;
    denyButtonLabel: string;
    text: string;
    title: string;
}

export const uiSlice = createSlice({
    name: <string>"ui",
    // `createSlice` will infer the state type from the `initialState` argument
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
        hideSnackBar: (state, action: PayloadAction<snackBarInfo>) => {
            state.showSnackBar = false;
        },
        showBasicDialog: (state, action: PayloadAction<basicDialogInfo>) => {
            state.showBasicDialog = true;
            state.basicDialogInfo = action.payload;
        },
        hideBasicDialog: (state, action: PayloadAction<snackBarInfo>) => {
            state.showBasicDialog = false;
        },
    },
});

export const { showSnackBar, hideSnackBar, hideBasicDialog, showBasicDialog } = uiSlice.actions;

export default uiSlice.reducer;
