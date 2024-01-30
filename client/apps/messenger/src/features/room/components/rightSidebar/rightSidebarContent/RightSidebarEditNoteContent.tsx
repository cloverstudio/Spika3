import React, { useEffect } from "react";
import { useSelector } from "react-redux";

import { Box } from "@mui/material";
import TextField from "@mui/material/TextField";

import useStrings from "../../../../../hooks/useStrings";

import { useGetNoteByIdQuery } from "../../../api/note";
import {
    selectRightSidebarActiveNoteId,
    setEditNoteContent,
    setEditNoteTitle,
} from "../../../slices/rightSidebar";
import { useAppDispatch, useAppSelector } from "../../../../../hooks";

export default function RightSidebarEditNoteContent(): React.ReactElement {
    const strings = useStrings();
    const noteId = useSelector(selectRightSidebarActiveNoteId);
    const dispatch = useAppDispatch();

    const title = useAppSelector((state) => state.rightSidebar.editNoteTitle);
    const content = useAppSelector((state) => state.rightSidebar.editNoteContent);

    const { data } = useGetNoteByIdQuery(noteId);

    useEffect(() => {
        if (data && data.note) {
            dispatch(setEditNoteTitle(data.note.title));
            dispatch(setEditNoteContent(data.note.content));
        }
    }, [data]);

    return (
        <Box>
            <TextField
                sx={{ mb: 2 }}
                required
                fullWidth
                placeholder={strings.title}
                id="title"
                name="title"
                autoFocus
                value={title}
                onChange={({ target }) => dispatch(setEditNoteTitle(target.value))}
            />
            <TextField
                sx={{ mb: 2 }}
                required
                fullWidth
                placeholder={strings.description}
                id="content"
                name="content"
                minRows={20}
                maxRows={30}
                multiline
                value={content}
                onChange={({ target }) => dispatch(setEditNoteContent(target.value))}
            />
        </Box>
    );
}
