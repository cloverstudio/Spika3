import React, { useEffect } from "react";
import { useSelector } from "react-redux";

import { Box } from "@mui/material";
import TextField from "@mui/material/TextField";

import { useTranslation } from "react-i18next";

import { useGetNoteByIdQuery } from "../../../api/note";
import {
    selectRightSidebarActiveNoteId,
    setEditNoteContent,
    setEditNoteTitle,
} from "../../../slices/rightSidebar";
import { useAppDispatch, useAppSelector } from "../../../../../hooks";

export default function RightSidebarEditNoteContent(): React.ReactElement {
    const { t } = useTranslation();
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
                placeholder={t("title")}
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
                placeholder={t("description")}
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
