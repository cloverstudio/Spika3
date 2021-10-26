import React, { useState, useEffect, useLayoutEffect } from 'react';

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    Button
} from "@mui/material";

import { useSelector, useDispatch } from "react-redux";
import { hideBasicDialog } from "../store/uiSlice";
import { RootState } from "../store/store";
import { uiListeners } from './useUI';

export default function SnackBar() {
    const ui = useSelector((state: RootState) => state.ui);
    const dispatch = useDispatch();

    useEffect(() => {

        if (ui.showSnackBar) {

            setTimeout(() => {
                dispatch(hideBasicDialog());
            }, 6000)
        }

    }, [ui.snackBarInfo]);

    return (
        <Dialog
            open={ui.showBasicDialog}
            onClose={e => dispatch(hideBasicDialog())}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                {ui.basicDialogInfo.title}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {ui.basicDialogInfo.text}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={e => {
                    dispatch(hideBasicDialog());
                    if (uiListeners.onBasicDialogOK) uiListeners.onBasicDialogOK();
                }
                }>{ui.basicDialogInfo.allowButtonLabel}</Button>
                <Button onClick={e => dispatch(hideBasicDialog())}>
                    {ui.basicDialogInfo.denyButtonLabel}
                </Button>
            </DialogActions>
        </Dialog >
    );
}