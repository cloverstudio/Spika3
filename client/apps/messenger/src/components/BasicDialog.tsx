import React from "react";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import DialogContentText from "@mui/material/DialogContentText";
import Button from "@mui/material/Button";

import { useSelector, useDispatch } from "react-redux";
import { hideBasicDialog } from "../store/modalSlice";
import { RootState } from "../store/store";
import { uiListeners } from "../hooks/useModal";

export default function BasicDialog() {
    const modalState = useSelector((state: RootState) => state.modal);
    const dispatch = useDispatch();

    return (
        <Dialog
            open={modalState.showBasicDialog}
            onClose={(e) => dispatch(hideBasicDialog())}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            sx={{ "& .MuiDialog-paper": { width: "100%" } }}
            maxWidth="xs"
        >
            <DialogTitle id="alert-dialog-title">{modalState.basicDialogInfo?.title}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {modalState.basicDialogInfo?.text}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={(e) => {
                        dispatch(hideBasicDialog());
                        if (uiListeners.onBasicDialogOK) uiListeners.onBasicDialogOK();
                    }}
                >
                    {modalState.basicDialogInfo?.allowButtonLabel}
                </Button>

                {modalState.basicDialogInfo?.denyButtonLabel ? (
                    <Button
                        onClick={(e) => {
                            dispatch(hideBasicDialog());
                            if (uiListeners.onBasicDialogCancel) uiListeners.onBasicDialogCancel();
                        }}
                    >
                        {modalState.basicDialogInfo?.denyButtonLabel}
                    </Button>
                ) : null}
            </DialogActions>
        </Dialog>
    );
}
