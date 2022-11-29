import { ArrowBackIos } from "@mui/icons-material";
import { IconButton, Typography } from "@mui/material";
import React from "react";
import { useDispatch } from "react-redux";
import useStrings from "../../../../../hooks/useStrings";

import { setActiveTab } from "../../../slices/rightSidebar";

export default function EditNoteHeader() {
    const strings = useStrings();

    const dispatch = useDispatch();

    return (
        <>
            <IconButton size="large" onClick={() => dispatch(setActiveTab("details"))}>
                <ArrowBackIos />
            </IconButton>
            <Typography variant="h6">{strings.settings}</Typography>
        </>
    );
}
