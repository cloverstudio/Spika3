import React from "react";
import { useSelector } from "react-redux";

import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import ArrowBackIos from "@mui/icons-material/ArrowBackIos";
import useStrings from "../../../../../hooks/useStrings";

import { useGetNoteByIdQuery } from "../../../api/note";
import { selectRightSidebarActiveNoteId, setActiveNoteId } from "../../../slices/rightSidebar";
import { useAppDispatch } from "../../../../../hooks";

export default function EditNoteHeader() {
    const strings = useStrings();
    const dispatch = useAppDispatch();
    const noteId = useSelector(selectRightSidebarActiveNoteId);
    const { data, isLoading } = useGetNoteByIdQuery(noteId);

    if (isLoading) {
        return null;
    }

    const { note } = data;

    return (
        <>
            <IconButton
                onClick={() => dispatch(setActiveNoteId(note.id))}
                style={{ borderRadius: "10px" }}
            >
                <ArrowBackIos sx={{ color: "primary.main", position: "relative", left: 3 }} />
            </IconButton>
            <Typography variant="h6">{strings.editNote}</Typography>
        </>
    );
}
