import { ArrowBackIos } from "@mui/icons-material";
import { IconButton, Typography } from "@mui/material";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { useGetNoteByIdQuery } from "../../../api/note";
import { selectRightSidebarActiveNoteId, setActiveNoteId } from "../../../slice/rightSidebarSlice";

export default function EditNoteHeader() {
    const dispatch = useDispatch();
    const noteId = useSelector(selectRightSidebarActiveNoteId);
    const { data, isLoading } = useGetNoteByIdQuery(noteId);

    if (isLoading) {
        return null;
    }

    const { note } = data;

    return (
        <>
            <IconButton size="large" onClick={() => dispatch(setActiveNoteId(note.id))}>
                <ArrowBackIos />
            </IconButton>
            <Typography variant="h6">Edit note</Typography>
        </>
    );
}
