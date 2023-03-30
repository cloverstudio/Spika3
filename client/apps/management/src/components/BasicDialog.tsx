import React from "react";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import DialogContentText from "@mui/material/DialogContentText";
import Button from "@mui/material/Button";

import { useSelector, useDispatch } from "react-redux";
import { hideBasicDialog, selectModal } from "@/store/modalSlice";
import { uiListeners } from "@/hooks/useModal";

export default function BasicDialog() {
    const modalState = useSelector(selectModal);
    const dispatch = useDispatch();

    return (
        <Dialog
            open={modalState.showBasicDialog}
            onClose={() => dispatch(hideBasicDialog())}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">{modalState.basicDialogInfo?.title}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {modalState.basicDialogInfo?.text}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                {modalState.basicDialogInfo?.denyButtonLabel ? (
                    <Button
                        color="error"
                        onClick={(e) => {
                            dispatch(hideBasicDialog());
                            if (uiListeners.onBasicDialogCancel) uiListeners.onBasicDialogCancel();
                        }}
                    >
                        {modalState.basicDialogInfo?.denyButtonLabel}
                    </Button>
                ) : null}
                <Button
                    onClick={() => {
                        dispatch(hideBasicDialog());
                        if (uiListeners.onBasicDialogOK) uiListeners.onBasicDialogOK();
                    }}
                >
                    {modalState.basicDialogInfo?.allowButtonLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
