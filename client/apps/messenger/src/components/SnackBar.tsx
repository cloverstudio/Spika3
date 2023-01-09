import React, { useEffect } from "react";

import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

import { useSelector, useDispatch } from "react-redux";
import { hideSnackBar } from "../store/modalSlice";
import { RootState } from "../store/store";

export default function SnackBar() {
    const modal = useSelector((state: RootState) => state.modal);
    const dispatch = useDispatch();

    useEffect(() => {
        if (modal.showSnackBar) {
            setTimeout(() => {
                dispatch(hideSnackBar());
            }, 6000);
        }
    }, [modal.showSnackBar, dispatch]);

    return (
        <Snackbar open={modal.showSnackBar} autoHideDuration={6000}>
            <Alert severity={modal.snackBarInfo?.severity} sx={{ width: "100%" }}>
                {modal.snackBarInfo?.text}
            </Alert>
        </Snackbar>
    );
}
