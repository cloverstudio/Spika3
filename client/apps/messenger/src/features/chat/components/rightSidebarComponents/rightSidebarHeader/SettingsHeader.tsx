import { ArrowBackIos } from "@mui/icons-material";
import { IconButton, Typography } from "@mui/material";
import React from "react";
import { useDispatch } from "react-redux";

import { setActiveTab } from "../../../slice/rightSidebarSlice";

export default function EditNoteHeader() {
    const dispatch = useDispatch();

    return (
        <>
            <IconButton size="large" onClick={() => dispatch(setActiveTab("details"))}>
                <ArrowBackIos />
            </IconButton>
            <Typography variant="h6">Settings</Typography>
        </>
    );
}
