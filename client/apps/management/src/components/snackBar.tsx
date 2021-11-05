import React, { useState, useEffect } from 'react';

import {
    Alert,
    Snackbar
} from "@mui/material";

import { useSelector, useDispatch } from "react-redux";
import { hideSnackBar, showSnackBar } from "../store/uiSlice";
import { RootState } from "../store/store";

export default function SnackBar() {
    const ui = useSelector((state: RootState) => state.ui);
    const dispatch = useDispatch();

    useEffect(() => {

        if (ui.showSnackBar) {

            setTimeout(() => {
                dispatch(hideSnackBar());
            }, 6000)
        }

    }, [ui.snackBarInfo]);

    return (
        <Snackbar
            open={ui.showSnackBar}
            autoHideDuration={6000}
        >
            <Alert severity={ui.snackBarInfo?.severity} sx={{ width: '100%' }}>
                {ui.snackBarInfo?.text}
            </Alert>
        </Snackbar>
    );
}