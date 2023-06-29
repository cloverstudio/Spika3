import React from "react";
import { useDispatch } from "react-redux";

import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ArrowBackIos from "@mui/icons-material/ArrowBackIos";
import useStrings from "../../../../../hooks/useStrings";

import { setActiveTab } from "../../../slices/rightSidebar";

export default function EditNoteHeader() {
    const strings = useStrings();
    const dispatch = useDispatch();

    return (
        <>
            <IconButton onClick={() => dispatch(setActiveTab("details"))}>
                <ArrowBackIos sx={{ color: "primary.main", position: "relative", left: 3 }} />
            </IconButton>
            <Typography variant="h6">{strings.settings}</Typography>
        </>
    );
}
