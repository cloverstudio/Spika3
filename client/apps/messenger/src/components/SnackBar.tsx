import React, { useEffect } from "react";

import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

import { useSelector, useDispatch } from "react-redux";
import { hideSnackBar } from "../store/modalSlice";
import { AppDispatch, RootState } from "../store/store";

export default function SnackBar() {
    const modal = useSelector((state: RootState) => state.modal);
    const dispatch = useDispatch<AppDispatch>();
    const autoHideDuration = modal.snackBarInfo?.autoHideDuration || 6000;

    useEffect(() => {
        if (modal.showSnackBar) {
            setTimeout(() => {
                dispatch(hideSnackBar());
            }, autoHideDuration);
        }
    }, [modal.showSnackBar, dispatch, autoHideDuration]);

    return (
        <Snackbar open={modal.showSnackBar} autoHideDuration={autoHideDuration}>
            <Alert severity={modal.snackBarInfo?.severity} sx={{ width: "100%" }}>
                {modal.snackBarInfo?.text}
            </Alert>
        </Snackbar>
    );
}
