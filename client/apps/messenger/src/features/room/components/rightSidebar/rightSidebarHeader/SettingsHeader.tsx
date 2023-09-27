import React from "react";

import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ArrowBackIos from "@mui/icons-material/ArrowBackIos";
import useStrings from "../../../../../hooks/useStrings";

import { setActiveTab } from "../../../slices/rightSidebar";
import { useAppDispatch } from "../../../../../hooks";

export default function EditNoteHeader() {
    const strings = useStrings();
    const dispatch = useAppDispatch();

    return (
        <>
            <IconButton onClick={() => dispatch(setActiveTab("details"))}>
                <ArrowBackIos sx={{ color: "primary.main", position: "relative", left: 3 }} />
            </IconButton>
            <Typography variant="h6">{strings.settings}</Typography>
        </>
    );
}
